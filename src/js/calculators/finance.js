export class FinanceCalculator {
  constructor() {
    this.currencyEl = document.getElementById('fin-currency');
    this.principalEl = document.getElementById('fin-p');
    this.rateEl = document.getElementById('fin-r');
    this.timeEl = document.getElementById('fin-t');
    this.resEl = document.getElementById('finance-res');
    this.activeInput = null;

    this.updateCurrencySymbol();
  }

  updateCurrencySymbol() {
    if (this.principalEl && this.currencyEl) {
      this.principalEl.placeholder = `Principal (${this.currencyEl.value})`;
    }
  }

  calculate() {
    const currency = this.currencyEl?.value || '$';
    const p = parseFloat(this.principalEl?.value) || 0;
    const r = (parseFloat(this.rateEl?.value) || 0) / 100;
    const t = parseFloat(this.timeEl?.value) || 0;
    if (!this.resEl) return;
    if (p > 0 && t > 0) {
      const amount = p * Math.pow(1 + r, t);
      this.resEl.textContent = `${currency}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      this.resEl.textContent = `${currency}0.00`;
    }
  }

  setActiveInput(el) {
    this.activeInput = el;
  }

  keypadType(key) {
    if (key === 'AC') {
      if (this.principalEl) this.principalEl.value = '';
      if (this.rateEl) this.rateEl.value = '';
      if (this.timeEl) this.timeEl.value = '';
      if (this.resEl) this.resEl.textContent = '$0.00';
      this.updateCurrencySymbol();
      return;
    }
    if (!this.activeInput) this.activeInput = this.principalEl;
    if (key === 'B') this.activeInput.value = this.activeInput.value.slice(0, -1);
    else this.activeInput.value += key;
    this.calculate();
  }
}
