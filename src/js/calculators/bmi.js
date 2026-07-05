/**
 * BMI Calculator — Body Mass Index with metric/imperial units, a colour-coded
 * category, the healthy-weight range for the given height, and a visual scale.
 */
export class BmiCalculator {
  constructor() {
    this.system = 'metric';
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
    };
    // Set the initial toggle appearance once the panel is in the DOM.
    if (this.el.metricBtn) this.setSystem('metric');
  }

  // Pure BMI maths (kg, metres) — kept separate so it's easy to unit-test.
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

    this.render(BmiCalculator.bmi(weightKg, heightM), heightM);
  }

  render(bmi, heightM) {
    const cat = BmiCalculator.category(bmi);
    const metric = this.system === 'metric';
    const toWeight = (kg) => (metric ? `${kg.toFixed(1)} kg` : `${(kg / 0.45359237).toFixed(1)} lb`);
    const range = `${toWeight(18.5 * heightM * heightM)} – ${toWeight(24.9 * heightM * heightM)}`;
    const pct = Math.max(0, Math.min(100, ((bmi - 15) / (40 - 15)) * 100));

    this.el.result.innerHTML = `
      <div style="text-align:center; padding:6px 0;">
        <div style="font-size:0.7rem; color:#888; text-transform:uppercase; letter-spacing:1px;">Your BMI</div>
        <div style="font-size:3rem; font-weight:700; color:${cat.color}; line-height:1.1;">${bmi.toFixed(1)}</div>
        <div style="display:inline-block; margin-top:6px; padding:4px 16px; border-radius:999px; font-weight:600; color:#fff; background:${cat.color};">${cat.label}</div>
      </div>
      <div style="margin-top:16px;">
        <div style="height:12px; border-radius:6px; background:linear-gradient(90deg,#4aa3ff 0%,#3ecf8e 28%,#3ecf8e 42%,#f5a623 62%,#ff5a5a 100%); position:relative;">
          <div style="position:absolute; top:-4px; left:${pct}%; transform:translateX(-50%); width:4px; height:20px; background:#fff; border-radius:2px; box-shadow:0 0 5px rgba(0,0,0,0.6);"></div>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:0.6rem; color:#888; margin-top:4px;">
          <span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
        </div>
      </div>
      <div style="margin-top:14px; font-size:0.8rem; color:#8899bb; line-height:1.6;">
        <div>Healthy weight for your height: <strong style="color:#3ecf8e;">${range}</strong></div>
        <div style="margin-top:4px; opacity:0.8;">Formula: BMI = weight(kg) ÷ height(m)²</div>
      </div>`;
  }

  showError() {
    if (this.el.result) {
      this.el.result.innerHTML =
        '<div style="color:#ff7096; font-size:0.85rem; text-align:center; padding:10px;">Please enter a valid height and weight.</div>';
    }
  }
}
