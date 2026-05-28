export class BytesCalculator {
  constructor() {
    this.units = ['bit', 'b', 'kb', 'mb'];
    this.multipliers = { bit: 0.125, b: 1, kb: 1024, mb: 1024 ** 2 };
    this.inputs = Object.fromEntries(
      this.units.map(u => [u, document.getElementById(`byte-${u}`)])
    );
    this.activeInput = null;
  }

  setActiveInput(el) {
    this.activeInput = el;
  }

  sync(sourceUnit) {
    const el = this.inputs[sourceUnit];
    if (!el) return;
    const val = parseFloat(el.value);
    if (isNaN(val)) return;
    const bytes = val * this.multipliers[sourceUnit];
    this.units.forEach(u => {
      if (u !== sourceUnit && this.inputs[u]) {
        const converted = bytes / this.multipliers[u];
        this.inputs[u].value = converted % 1 === 0 ? converted : converted.toFixed(6);
      }
    });
  }

  keypadType(key) {
    if (key === 'AC') {
      this.units.forEach(u => { if (this.inputs[u]) this.inputs[u].value = ''; });
      return;
    }
    if (!this.activeInput) this.activeInput = this.inputs.b;
    if (key === 'B') this.activeInput.value = this.activeInput.value.slice(0, -1);
    else this.activeInput.value += key;
    this.sync(this.activeInput.id.replace('byte-', ''));
  }
}
