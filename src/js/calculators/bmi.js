import { StorageManager } from '../utils/storage.js';

/**
 * BMI Calculator — metric/imperial, colour-coded category, an animated gauge,
 * target-weight guidance, a weekly weight tracker (saved locally) and a
 * printable PDF card. BMI maths kept static + pure for easy unit testing.
 */
const HISTORY_KEY = 'bmi-history';

export class BmiCalculator {
  constructor() {
    this.system = 'metric';
    this.last = null;
    this.el = {
      weight: document.getElementById('bmi-weight'),
      height: document.getElementById('bmi-height'),
      heightIn: document.getElementById('bmi-height-in'),
      inWrap: document.getElementById('bmi-in-wrap'),
      weightUnit: document.getElementById('bmi-weight-unit'),
      heightUnit: document.getElementById('bmi-height-unit'),
      metricBtn: document.getElementById('bmi-metric-btn'),
      imperialBtn: document.getElementById('bmi-imperial-btn'),
      result: document.getElementById('bmi-result'),
      actions: document.getElementById('bmi-actions'),
      history: document.getElementById('bmi-history'),
    };
    if (this.el.metricBtn) this.setSystem('metric');
    this.renderHistory();
  }

  static bmi(weightKg, heightM) {
    return weightKg / (heightM * heightM);
  }

  static category(bmi) {
    if (bmi < 18.5) return { label: 'Underweight', color: '#4aa3ff' };
    if (bmi < 25) return { label: 'Normal weight', color: '#3ecf8e' };
    if (bmi < 30) return { label: 'Overweight', color: '#f5a623' };
    return { label: 'Obese', color: '#ff5a5a' };
  }

  setSystem(system) {
    this.system = system;
    const metric = system === 'metric';
    if (this.el.weightUnit) this.el.weightUnit.textContent = metric ? 'kg' : 'lb';
    if (this.el.heightUnit) this.el.heightUnit.textContent = metric ? 'cm' : 'ft';
    if (this.el.inWrap) this.el.inWrap.style.display = metric ? 'none' : 'block';

    const style = (btn, on) => {
      if (!btn) return;
      btn.style.background = on ? 'var(--btn-op-bg, #1a3a5c)' : 'transparent';
      btn.style.color = on ? 'var(--btn-op-text, #7ec8e3)' : '#8899bb';
      btn.style.fontWeight = on ? '700' : '400';
    };
    style(this.el.metricBtn, metric);
    style(this.el.imperialBtn, !metric);

    if (this.el.result) this.el.result.innerHTML = '';
    if (this.el.actions) this.el.actions.style.display = 'none';
  }

  calculate() {
    const weightRaw = parseFloat(this.el.weight?.value);
    let weightKg;
    let heightM;

    if (this.system === 'metric') {
      const cm = parseFloat(this.el.height?.value);
      if (!(weightRaw > 0) || !(cm > 0)) return this.showError();
      weightKg = weightRaw;
      heightM = cm / 100;
    } else {
      const ft = parseFloat(this.el.height?.value) || 0;
      const inch = parseFloat(this.el.heightIn?.value) || 0;
      const totalIn = ft * 12 + inch;
      if (!(weightRaw > 0) || !(totalIn > 0)) return this.showError();
      weightKg = weightRaw * 0.45359237;
      heightM = totalIn * 0.0254;
    }

    this.last = { bmi: BmiCalculator.bmi(weightKg, heightM), heightM, weightKg };
    this.render();
  }

  // BMI -> point on a 180° top-arc (BMI 15 = left, 40 = right)
  gaugeSvg(bmi) {
    const cx = 100, cy = 105, r = 78, sw = 16;
    const clamp = (b) => Math.max(15, Math.min(40, b));
    const pt = (b) => {
      const th = ((180 - ((clamp(b) - 15) / 25) * 180) * Math.PI) / 180;
      return [cx + r * Math.cos(th), cy - r * Math.sin(th)];
    };
    const arc = (b1, b2, color) => {
      const [x1, y1] = pt(b1);
      const [x2, y2] = pt(b2);
      return `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke="${color}" stroke-width="${sw}"/>`;
    };
    const rot = (((clamp(bmi) - 15) / 25) * 180 - 90).toFixed(1);
    return `
      <svg viewBox="0 0 200 116" style="width:100%; max-width:280px; display:block; margin:8px auto 0;">
        ${arc(15, 18.5, '#4aa3ff')}${arc(18.5, 25, '#3ecf8e')}${arc(25, 30, '#f5a623')}${arc(30, 40, '#ff5a5a')}
        <line x1="${cx}" y1="${cy}" x2="${cx}" y2="34" stroke="#e8f4ff" stroke-width="3" stroke-linecap="round">
          <animateTransform attributeName="transform" type="rotate" from="-90 ${cx} ${cy}" to="${rot} ${cx} ${cy}" dur="0.9s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.34 1.3 0.5 1"/>
        </line>
        <circle cx="${cx}" cy="${cy}" r="5" fill="#e8f4ff"/>
      </svg>`;
  }

  targetText(bmi, heightM) {
    const metric = this.system === 'metric';
    const toW = (kg) => (metric ? `${kg.toFixed(1)} kg` : `${(kg / 0.45359237).toFixed(1)} lb`);
    const low = 18.5 * heightM * heightM;
    const high = 24.9 * heightM * heightM;
    if (bmi < 18.5) {
      return `About <strong style="color:#4aa3ff;">${toW(low - this.last.weightKg)}</strong> under the healthy range — a healthy weight would be from <strong>${toW(low)}</strong>.`;
    }
    if (bmi < 25) {
      return `🎉 You're within the healthy range (<strong>${toW(low)} – ${toW(high)}</strong>). Nice one!`;
    }
    return `About <strong style="color:#f5a623;">${toW(this.last.weightKg - high)}</strong> over the healthy range — aim for <strong>${toW(high)}</strong> or below.`;
  }

  render() {
    const { bmi, heightM } = this.last;
    const cat = BmiCalculator.category(bmi);
    const metric = this.system === 'metric';
    const toW = (kg) => (metric ? `${kg.toFixed(1)} kg` : `${(kg / 0.45359237).toFixed(1)} lb`);
    const range = `${toW(18.5 * heightM * heightM)} – ${toW(24.9 * heightM * heightM)}`;
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    this.el.result.innerHTML = `
      <div style="font-size:0.68rem; color:#888; text-transform:uppercase; letter-spacing:1px; text-align:center;">BMI Report · ${today}</div>
      <div style="text-align:center; padding:2px 0 0;">
        <div style="font-size:3rem; font-weight:700; color:${cat.color}; line-height:1.1;">${bmi.toFixed(1)}</div>
        <div style="display:inline-block; padding:4px 16px; border-radius:999px; font-weight:600; color:#fff; background:${cat.color};">${cat.label}</div>
      </div>
      ${this.gaugeSvg(bmi)}
      <div style="display:flex; justify-content:space-between; font-size:0.58rem; color:#888; max-width:280px; margin:2px auto 0;">
        <span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
      </div>
      <div style="margin-top:14px; font-size:0.82rem; color:#aab4d4; line-height:1.6;">
        <div style="margin-bottom:6px;">${this.targetText(bmi, heightM)}</div>
        <div>Healthy weight for your height: <strong style="color:#3ecf8e;">${range}</strong></div>
        <div style="margin-top:8px; opacity:0.75; font-size:0.75rem;">Formula: BMI = weight(kg) ÷ height(m)². This is a general guide — it doesn't account for muscle or build, so treat it as a starting point, not medical advice.</div>
      </div>`;

    if (this.el.actions) this.el.actions.style.display = 'flex';
  }

  saveReading() {
    if (!this.last) return;
    const hist = StorageManager.getItem(HISTORY_KEY, []);
    const date = new Date().toISOString().slice(0, 10);
    const entry = { date, bmi: +this.last.bmi.toFixed(1), weightKg: +this.last.weightKg.toFixed(1) };
    const existing = hist.findIndex((h) => h.date === date);
    if (existing >= 0) hist[existing] = entry;
    else hist.push(entry);
    hist.sort((a, b) => a.date.localeCompare(b.date));
    StorageManager.setItem(HISTORY_KEY, hist);
    this.renderHistory();
  }

  clearHistory() {
    if (!confirm('Clear all saved readings?')) return;
    StorageManager.removeItem(HISTORY_KEY);
    this.renderHistory();
  }

  renderHistory() {
    if (!this.el.history) return;
    const hist = StorageManager.getItem(HISTORY_KEY, []);
    if (!hist.length) {
      this.el.history.innerHTML = '';
      return;
    }
    const w = 280, h = 74, pad = 10;
    const vals = hist.map((r) => r.bmi);
    const min = Math.min(...vals) - 1, max = Math.max(...vals) + 1;
    const span = max - min || 1;
    const xOf = (i) => pad + (hist.length === 1 ? (w - 2 * pad) / 2 : (i / (hist.length - 1)) * (w - 2 * pad));
    const yOf = (v) => h - pad - ((v - min) / span) * (h - 2 * pad);
    const pts = hist.map((r, i) => [xOf(i), yOf(r.bmi)]);
    const path = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
    const dots = pts
      .map((p, i) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3" fill="${BmiCalculator.category(hist[i].bmi).color}"/>`)
      .join('');
    const last = hist[hist.length - 1];

    this.el.history.innerHTML = `
      <div style="border-top:1px solid var(--border-color,#2a2a4a); padding-top:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span style="font-size:0.7rem; color:#888; text-transform:uppercase; letter-spacing:1px;">Your BMI over time (${hist.length})</span>
          <button onclick="clearBmiHistory()" style="background:none; border:none; color:#ff7096; font-size:0.7rem; cursor:pointer;">clear</button>
        </div>
        <svg viewBox="0 0 ${w} ${h}" style="width:100%; overflow:visible;">
          <path d="${path}" fill="none" stroke="#7ec8e3" stroke-width="2"/>
          ${dots}
        </svg>
        <div style="font-size:0.72rem; color:#aab4d4; margin-top:4px;">Latest: <strong>${last.bmi}</strong> on ${new Date(last.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
      </div>`;
  }

  print() {
    if (!this.last) {
      alert('Calculate a BMI first, then save it as a PDF.');
      return;
    }
    document.body.classList.add('print-bmi-only');
    window.print();
    document.body.classList.remove('print-bmi-only');
  }

  showError() {
    if (this.el.result) {
      this.el.result.innerHTML =
        '<div style="color:#ff7096; font-size:0.85rem; text-align:center; padding:10px;">Please enter a valid height and weight.</div>';
    }
    if (this.el.actions) this.el.actions.style.display = 'none';
  }
}
