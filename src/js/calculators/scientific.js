import { Parser } from '../core/parser.js';
import { Evaluator } from '../core/evaluator.js';
import { MathEngine } from '../core/math-engine.js';
import { StorageManager } from '../utils/storage.js';
import { ErrorHandler } from '../utils/errors.js';
import { CONFIG } from '../config.js';

export class ScientificCalculator {
  constructor() {
    this.expr = "";
    this.history = StorageManager.getItem(CONFIG.STORAGE_KEYS.HISTORY, []);
    this.ans = 0;
    this.memory = 0;
    
    this.exprEl = document.getElementById('sci-expr');
    this.resEl = document.getElementById('sci-res');
    this.historyEl = document.getElementById('sci-history');
    
    this.updateDisplay();
    this.updateHistoryUI();
  }

  insertChar(c) {
    this.expr += c;
    this.updateDisplay();
  }

  insertConst(name) {
    const constants = {
      'pi': 'pi',
      'e': 'e',
      'tau': 'tau',
      'phi': 'phi'
    };
    this.expr += constants[name] || '';
    this.updateDisplay();
  }

  insertAns() {
    this.expr += String(this.ans);
    this.updateDisplay();
  }

  clear() {
    this.expr = "";
    this.updateDisplay();
    if (this.resEl) this.resEl.textContent = "0";
  }

  backspace() {
    this.expr = this.expr.slice(0, -1);
    this.updateDisplay();
  }

  calculate() {
    if (!this.expr) return;
    try {
      const tokens = Parser.tokenize(this.expr);
      const postfix = Parser.shuntingYard(tokens);
      let res = Evaluator.evaluateRPN(postfix);
      
      if (!isFinite(res)) throw new Error("Result is not finite");
      
      res = parseFloat(res.toFixed(CONFIG.DISPLAY.DECIMAL_PLACES));
      this.ans = res;
      
      this.addHistory(this.expr, res);
      
      if (this.resEl) this.resEl.textContent = res;
      if (this.exprEl) this.exprEl.textContent = this.expr + " =";
      
      this.expr = String(res);
    } catch (e) {
      if (this.resEl) this.resEl.textContent = ErrorHandler.handle(e, 'ScientificCalculator');
    }
  }

  addHistory(e, r) {
    this.history.unshift({ e, r });
    if (this.history.length > CONFIG.DISPLAY.MAX_HISTORY_ITEMS) {
      this.history.pop();
    }
    StorageManager.setItem(CONFIG.STORAGE_KEYS.HISTORY, this.history);
    this.updateHistoryUI();
  }

  updateDisplay() {
    if (this.exprEl) {
      this.exprEl.textContent = this.expr
        .replace(/pi/g, 'π')
        .replace(/tau/g, 'τ')
        .replace(/phi/g, 'φ')
        .replace(/\*\*/g, '^');
    }
    
    const lastToken = this.expr.split(/[\+\-\*\/\(]/).pop();
    if (this.resEl) {
      this.resEl.textContent = (lastToken && !isNaN(lastToken)) ? lastToken : "0";
    }
  }

  updateHistoryUI() {
    if (!this.historyEl) return;
    this.historyEl.innerHTML = this.history
      .map(i => `<div class="history-item">${i.e} = <strong>${i.r}</strong></div>`)
      .join('');
  }

  clearHistory() {
    this.history = [];
    StorageManager.removeItem(CONFIG.STORAGE_KEYS.HISTORY);
    this.updateHistoryUI();
  }

  calcFunction(f) {
    const cur = parseFloat(this.resEl?.textContent);
    if (isNaN(cur)) return;
    let res, label;
    try {
      switch (f) {
        case 'sin':  res = MathEngine.sin(cur);  label = `sin(${cur})`; break;
        case 'cos':  res = MathEngine.cos(cur);  label = `cos(${cur})`; break;
        case 'tan':  res = MathEngine.tan(cur);  label = `tan(${cur})`; break;
        case 'sqrt':
          if (cur < 0) throw new Error('sqrt needs non-negative');
          res = Math.sqrt(cur); label = `√(${cur})`; break;
        case 'log':
          if (cur <= 0) throw new Error('log needs value > 0');
          res = Math.log10(cur); label = `log(${cur})`; break;
        case 'ln':
          if (cur <= 0) throw new Error('ln needs value > 0');
          res = Math.log(cur); label = `ln(${cur})`; break;
        case 'sq':   res = cur * cur;             label = `${cur}²`; break;
        case 'inv':
          if (cur === 0) throw new Error('Cannot divide by 0');
          res = 1 / cur; label = `1/${cur}`; break;
        case 'abs':  res = Math.abs(cur);         label = `|${cur}|`; break;
        case 'fact':
          res = MathEngine.factorial(cur); label = `${cur}!`; break;
        case 'prime': {
          const isPrime = MathEngine.isPrime(cur);
          if (this.resEl) this.resEl.textContent = isPrime ? 'PRIME' : 'NOT PRIME';
          return;
        }
        default: return;
      }
      res = parseFloat(res.toFixed(CONFIG.DISPLAY.DECIMAL_PLACES));
      this.ans = res;
      this.expr = String(res);
      if (this.resEl) this.resEl.textContent = res;
      this.addHistory(label, res);
    } catch (e) {
      if (this.resEl) this.resEl.textContent = ErrorHandler.handle(e, 'ScientificCalculator');
    }
  }

  toggleAngleMode() {
    const newMode = MathEngine.getAngleMode() === 'deg' ? 'rad' : 'deg';
    MathEngine.setAngleMode(newMode);
    const btn = document.getElementById('angle-mode-btn');
    if (btn) btn.textContent = newMode.toUpperCase();
  }

  memoryAdd() {
    const cur = parseFloat(this.resEl?.textContent);
    if (!isFinite(cur)) return;
    this.memory += cur;
    if (this.exprEl) this.exprEl.textContent = `Memory: ${parseFloat(this.memory.toFixed(10))}`;
  }

  memorySubtract() {
    const cur = parseFloat(this.resEl?.textContent);
    if (!isFinite(cur)) return;
    this.memory -= cur;
    if (this.exprEl) this.exprEl.textContent = `Memory: ${parseFloat(this.memory.toFixed(10))}`;
  }

  memoryRecall() {
    this.expr += String(parseFloat(this.memory.toFixed(10)));
    this.updateDisplay();
  }

  memoryClear() {
    this.memory = 0;
    if (this.exprEl) this.exprEl.textContent = 'Memory cleared';
  }

  saveHistoryPDF() {
    if (this.history.length === 0) { alert('History is empty!'); return; }
    document.body.classList.add('print-history-only');
    window.print();
    document.body.classList.remove('print-history-only');
  }
}