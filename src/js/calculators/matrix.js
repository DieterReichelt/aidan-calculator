export class MatrixCalculator {
  constructor() {
    this.inputs = {
      a: document.getElementById('mat-a'),
      b: document.getElementById('mat-b'),
      c: document.getElementById('mat-c'),
      d: document.getElementById('mat-d')
    };
    this.resEl = document.getElementById('matrix-res');
    this.activeInput = null;
  }

  setActiveInput(el) {
    this.activeInput = el;
  }

  calculate() {
    const a = parseFloat(this.inputs.a?.value) || 0;
    const b = parseFloat(this.inputs.b?.value) || 0;
    const c = parseFloat(this.inputs.c?.value) || 0;
    const d = parseFloat(this.inputs.d?.value) || 0;
    if (this.resEl) this.resEl.textContent = `det(A) = ${(a * d) - (b * c)}`;
  }

  keypadType(key) {
    if (key === 'AC') {
      Object.values(this.inputs).forEach(el => { if (el) el.value = ''; });
      if (this.resEl) this.resEl.textContent = 'det(A) = 0';
      return;
    }
    if (!this.activeInput) this.activeInput = this.inputs.a;
    if (key === 'B') this.activeInput.value = this.activeInput.value.slice(0, -1);
    else this.activeInput.value += key;
    this.calculate();
  }
}
