import { MathEngine } from '../core/math-engine.js';
import { Sanitizer } from '../utils/sanitizer.js';
import { ErrorHandler, CalculatorError, ERROR_CODES } from '../utils/errors.js';

export class FractionCalculator {
  constructor() {
    this.op = '+';
    this.activeInput = null;
    this.lastResult = null;
    
    this.visualResEl = document.getElementById('frac-visual-res');
    this.decResEl = document.getElementById('frac-dec-res');
    this.lessonEl = document.getElementById('frac-lesson');
    
    this.inputs = {
      aw: document.getElementById('f-a-w'),
      an: document.getElementById('f-a-n'),
      ad: document.getElementById('f-a-d'),
      bw: document.getElementById('f-b-w'),
      bn: document.getElementById('f-b-n'),
      bd: document.getElementById('f-b-d')
    };
  }

  setOp(op) {
    this.op = op;
    this.liveUpdate();
  }

  setActiveInput(el) {
    this.activeInput = el;
  }

  keypadType(key) {
    if (key === 'AC') {
      this.clear();
      return;
    }
    if (!this.activeInput) this.activeInput = this.inputs.aw;
    if (key === 'B') this.activeInput.value = this.activeInput.value.slice(0, -1);
    else this.activeInput.value += key;
    this.liveUpdate();
  }

  getF(p) {
    const w = parseInt(document.getElementById(`f-${p}-w`).value) || 0;
    const n = parseInt(document.getElementById(`f-${p}-n`).value) || 0;
    const dRaw = document.getElementById(`f-${p}-d`).value;
    const d = dRaw === "" ? 1 : parseInt(dRaw);
    if (!isFinite(d) || d === 0) return null;
    return { n: Math.abs(w) * d + n * (w < 0 ? -1 : 1), d: d };
  }

  calculate() {
    let A = this.getF('a'), B = this.getF('b'), rn, rd;
    if (!A || !B) {
      if (this.decResEl) this.decResEl.textContent = "";
      if (this.visualResEl) this.visualResEl.textContent = ErrorHandler.handle(
        new CalculatorError('Denominator cannot be 0', ERROR_CODES.INVALID_INPUT, 'Denominator cannot be 0'),
        'FractionCalculator'
      );
      return;
    }
    
    if (this.op === '+') { rn = A.n * B.d + B.n * A.d; rd = A.d * B.d; }
    else if (this.op === '-') { rn = A.n * B.d - B.n * A.d; rd = A.d * B.d; }
    else if (this.op === '*') { rn = A.n * B.n; rd = A.d * B.d; }
    else { rn = A.n * B.d; rd = A.d * B.n; }
    
    if (rd === 0) {
      if (this.visualResEl) this.visualResEl.textContent = ErrorHandler.handle(
        ErrorHandler.createDivisionByZeroError(),
        'FractionCalculator'
      );
      return;
    }
    
    this.lastResult = { A, B, res: { n: rn, d: rd }, op: this.op };
    this._updateDisplay(A, B, { n: rn, d: rd }, this.op);
  }

  simplifyResult() {
    if (!this.lastResult) return;
    
    const simplified = MathEngine.simplifyFraction(this.lastResult.res.n, this.lastResult.res.d);
    this._updateDisplay(this.lastResult.A, this.lastResult.B, simplified, this.lastResult.op, true);
  }

  _formatVisual(f) {
    let w = Math.trunc(f.n / f.d), n = Math.abs(f.n % f.d);
    return `<div style="display:inline-flex; align-items:center;">${w ? `<span>${w}</span>` : (n ? '' : '<span>0</span>')}${n ? `<div style="display:flex; flex-direction:column; align-items:center; margin-left:5px;"><span style="border-bottom:2px solid #333; padding:0 3px;">${n}</span><span>${f.d}</span></div>` : ''}</div>`;
  }

  _updateDisplay(A, B, res, op, isSimplified = false) {
    let opSym = op === '*' ? '×' : (op === '/' ? '÷' : (op === '-' ? '−' : '+'));
    
    if (this.visualResEl) {
      this.visualResEl.innerHTML = Sanitizer.sanitizeHTML(`
        <div style="display:flex; align-items:center; justify-content:center; gap:15px; flex-wrap:wrap;">
          ${this._formatVisual(A)} 
          <span style="font-size:1.5rem; color:#555;">${opSym}</span> 
          ${this._formatVisual(B)} 
          <span style="font-size:1.5rem; color:#b22222;">=</span> 
          <div style="color:#b22222;">${this._formatVisual(res)}</div>
        </div>`);
    }

    if (this.decResEl) this.decResEl.textContent = `≈ ${(res.n / res.d).toFixed(6)}`;
    
    if (this.lessonEl) {
      const title = isSimplified ? 'Simplified Result' : 'Calculation Result';
      this.lessonEl.innerHTML = Sanitizer.sanitizeHTML(`<div class='lesson-title'>Step-by-Step</div><strong>${title}: ${res.n}/${res.d}</strong>`);
      this.lessonEl.classList.add('visible');
    }
  }

  liveUpdate() {
    const getV = (id) => document.getElementById(id)?.value || "";
    const format = (w, n, d) => {
      if(!w && !n && !d) return "";
      return `<div style="display:inline-flex; align-items:center; margin: 0 5px;">
        ${w ? `<span>${w}</span>` : ""}
        ${(n || d) ? `<div style="display:flex; flex-direction:column; align-items:center; margin-left:5px;">
          <span style="border-bottom:2px solid #333; padding:0 3px;">${n || '0'}</span>
          <span>${d || '1'}</span>
        </div>` : ""}
      </div>`;
    };
    
    let opSym = this.op === '*' ? '×' : (this.op === '/' ? '÷' : (this.op === '-' ? '−' : '+'));
    let visualA = format(getV('f-a-w'), getV('f-a-n'), getV('f-a-d'));
    let visualB = format(getV('f-b-w'), getV('f-b-n'), getV('f-b-d'));
    
    if (this.visualResEl) {
      if (!visualA && !visualB) {
        this.visualResEl.innerHTML = "Enter Fractions Below";
      } else {
        this.visualResEl.innerHTML = Sanitizer.sanitizeHTML(`
          <div style="display:flex; align-items:center; justify-content:center; gap:10px;">
            ${visualA || "?"} <span style="color:#666">${opSym}</span> ${visualB || "?"}
          </div>`);
      }
    }
  }

  swap() {
    ['w', 'n', 'd'].forEach(s => {
      let a = document.getElementById('f-a-' + s), b = document.getElementById('f-b-' + s), t = a.value;
      a.value = b.value; b.value = t;
    });
    this.liveUpdate();
  }

  clear() {
    Object.values(this.inputs).forEach(i => { if (i) i.value = ''; });
    if (this.visualResEl) this.visualResEl.innerHTML = 'Enter Fractions Below';
    if (this.decResEl) this.decResEl.textContent = '';
    if (this.lessonEl) {
      this.lessonEl.innerHTML = '';
      this.lessonEl.classList.remove('visible');
    }
  }
}