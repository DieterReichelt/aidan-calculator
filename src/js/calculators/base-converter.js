export class BaseConverterCalculator {
  constructor() {
    this.inputs = {
      dec: document.getElementById('base-dec'),
      bin: document.getElementById('base-bin'),
      hex: document.getElementById('base-hex'),
      oct: document.getElementById('base-oct')
    };
    this.explanationEl = document.getElementById('base-explanation');
  }

  syncBase(type) {
    const el = this.inputs[type];
    if (!el) return;

    const raw = el.value.trim();
    if (!raw) return;

    const patterns = { dec: /^-?\d+$/, bin: /^[01]+$/, hex: /^[0-9A-Fa-f]+$/, oct: /^[0-7]+$/ };
    if (!patterns[type].test(raw)) {
      el.setCustomValidity(`Invalid character for ${type} input`);
      el.reportValidity();
      return;
    }
    el.setCustomValidity('');

    let val;
    if (type === 'dec') val = parseInt(raw, 10);
    else if (type === 'bin') val = parseInt(raw, 2);
    else if (type === 'hex') val = parseInt(raw, 16);
    else if (type === 'oct') val = parseInt(raw, 8);

    if (isNaN(val)) return;

    if (type !== 'dec') this.inputs.dec.value = val.toString(10);
    if (type !== 'bin') this.inputs.bin.value = val.toString(2);
    if (type !== 'hex') this.inputs.hex.value = val.toString(16).toUpperCase();
    if (type !== 'oct') this.inputs.oct.value = val.toString(8);

    this.updateExplanation(val);
  }

  updateExplanation(n) {
    if (!this.explanationEl) return;
    const bin = n.toString(2);
    let exp = n + " = ";
    for (let i = 0; i < bin.length; i++) {
      const bit = bin[bin.length - 1 - i];
      if (bit === '1') {
        exp += `(1 × 2<sup>${i}</sup>) + `;
      } else {
        exp += `(0 × 2<sup>${i}</sup>) + `;
      }
    }
    this.explanationEl.innerHTML = exp.slice(0, -3);
  }
}