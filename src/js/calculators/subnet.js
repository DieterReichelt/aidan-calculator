import { Sanitizer } from '../utils/sanitizer.js';

export class SubnetCalculator {
  constructor() {
    this.ipEl = document.getElementById('subnet-ip');
    this.cidrEl = document.getElementById('subnet-cidr');
    this.maskEl = document.getElementById('subnet-mask');
    this.resEl = document.getElementById('subnet-res');
    this.activeInput = null;
  }

  setActiveInput(el) {
    this.activeInput = el;
  }

  #ipToInt(ip) {
    const parts = ip.split('.');
    if (parts.length !== 4) return 0;
    return parts.reduce((res, octet) => (res << 8) + (parseInt(octet, 10) || 0), 0) >>> 0;
  }

  #intToIp(int) {
    return [(int >>> 24) & 0xFF, (int >>> 16) & 0xFF, (int >>> 8) & 0xFF, int & 0xFF].join('.');
  }

  #maskToCidr(mask) {
    const int = this.#ipToInt(mask);
    let count = 0;
    for (let i = 31; i >= 0; i--) {
      if ((int >>> i) & 1) count++;
      else break;
    }
    return count;
  }

  calculate(source) {
    if (source === 'cidr') {
      const c = parseInt(this.cidrEl?.value);
      if (!isNaN(c) && c >= 0 && c <= 32) {
        const m = (c === 0) ? 0 : (~0 << (32 - c)) >>> 0;
        if (this.maskEl) this.maskEl.value = this.#intToIp(m);
      }
    } else if (source === 'mask') {
      const mStr = this.maskEl?.value || '';
      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(mStr)) {
        if (this.cidrEl) this.cidrEl.value = this.#maskToCidr(mStr);
      }
    }

    const ipStr = this.ipEl?.value || '';
    const cidr = parseInt(this.cidrEl?.value);
    if (!this.resEl) return;
    if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ipStr) || isNaN(cidr) || cidr < 0 || cidr > 32) {
      this.resEl.textContent = 'Enter a valid IP and CIDR prefix (0-32)';
      return;
    }

    const ip = this.#ipToInt(ipStr);
    const mask = (cidr === 0) ? 0 : (~0 << (32 - cidr)) >>> 0;
    const network = (ip & mask) >>> 0;
    const broadcast = (network | ~mask) >>> 0;
    const hosts = cidr >= 31 ? 0 : Math.pow(2, 32 - cidr) - 2;
    const toBin = (int) => (int >>> 0).toString(2).padStart(32, '0').match(/.{8}/g).join('.');

    let html = `<strong>Mask:</strong> ${this.#intToIp(mask)}<br>`
      + `<strong>Network:</strong> ${this.#intToIp(network)}/${cidr}<br>`
      + `<strong>Broadcast:</strong> ${this.#intToIp(broadcast)}<br>`
      + `<strong>Hosts:</strong> ${hosts.toLocaleString()}<br>`;
    if (cidr < 31) html += `<strong>Range:</strong> ${this.#intToIp(network + 1)} - ${this.#intToIp(broadcast - 1)}<br>`;
    html += `<div style="margin-top:10px; font-size:0.7rem; color:#888;">`
      + `IP Binary:   ${toBin(ip)}<br>`
      + `Mask Binary: ${toBin(mask)}<br>`
      + `Net Binary:  ${toBin(network)}</div>`;

    this.resEl.innerHTML = Sanitizer.sanitizeHTML(html);
  }

  keypadType(key) {
    if (key === 'AC') {
      if (this.ipEl) this.ipEl.value = '';
      if (this.cidrEl) this.cidrEl.value = '';
      if (this.maskEl) this.maskEl.value = '';
      if (this.resEl) this.resEl.textContent = 'Enter IP and CIDR (e.g. 24)';
      return;
    }
    if (!this.activeInput) this.activeInput = this.ipEl;
    if (key === 'B') this.activeInput.value = this.activeInput.value.slice(0, -1);
    else this.activeInput.value += key;
    this.calculate(this.activeInput.id.replace('subnet-', ''));
  }
}
