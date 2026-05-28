import { CONFIG } from '../config.js';

export class MathEngine {
  static #angleMode = localStorage.getItem(CONFIG.STORAGE_KEYS.ANGLE_MODE) || 'deg';

  static setAngleMode(mode) {
    if (!['deg', 'rad'].includes(mode)) {
      throw new Error('Invalid angle mode');
    }
    this.#angleMode = mode;
    localStorage.setItem(CONFIG.STORAGE_KEYS.ANGLE_MODE, mode);
  }

  static getAngleMode() {
    return this.#angleMode;
  }

  static sin(value) {
    const rad = this.#angleMode === 'deg' ? value * Math.PI / 180 : value;
    return Math.sin(rad);
  }

  static cos(value) {
    const rad = this.#angleMode === 'deg' ? value * Math.PI / 180 : value;
    return Math.cos(rad);
  }

  static tan(value) {
    const rad = this.#angleMode === 'deg' ? value * Math.PI / 180 : value;
    return Math.tan(rad);
  }

  static factorial(n) {
    if (n < 0 || !Number.isInteger(n)) {
      throw new Error('Factorial requires non-negative integer');
    }
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }

  static isPrime(n) {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    for (let i = 3; i <= Math.sqrt(n); i += 2) {
      if (n % i === 0) return false;
    }
    return true;
  }

  static gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      let t = b;
      b = a % b;
      a = t;
    }
    return a;
  }

  static simplifyFraction(n, d) {
    if (d === 0) return { n: NaN, d: NaN };
    let g = this.gcd(n, d);
    if (d < 0) {
      n = -n;
      d = -d;
    }
    return { n: n / g, d: d / g };
  }
}