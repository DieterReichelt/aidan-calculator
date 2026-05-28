import { Sanitizer } from '../utils/sanitizer.js';

export class SolverCalculator {
  constructor() {
    this.linA = document.getElementById('solve-lin-a');
    this.linB = document.getElementById('solve-lin-b');
    this.linC = document.getElementById('solve-lin-c');
    
    this.quadA = document.getElementById('solve-quad-a');
    this.quadB = document.getElementById('solve-quad-b');
    this.quadC = document.getElementById('solve-quad-c');
    
    this.resEl = document.getElementById('solve-res');
    this.lessonEl = document.getElementById('solve-lesson');
  }

  solveLinear() {
    const a = parseFloat(this.linA?.value);
    const b = parseFloat(this.linB?.value);
    const c = parseFloat(this.linC?.value);
    
    if (isNaN(a) || isNaN(b) || isNaN(c)) return;
    if (a === 0) {
      if (this.resEl) this.resEl.textContent = "Invalid (a=0)";
      return;
    }
    
    const x = (c - b) / a;
    if (this.resEl) this.resEl.textContent = "x = " + parseFloat(x.toFixed(4));
    
    if (this.lessonEl) {
      this.lessonEl.innerHTML = Sanitizer.sanitizeHTML(
        `<div class="lesson-title">Solving ${a}x + ${b} = ${c}</div>
        1. Subtract ${b} from both sides: ${a}x = ${c - b}<br>
        2. Divide both sides by ${a}: x = ${x.toFixed(4)}`
      );
      this.lessonEl.classList.add('visible');
    }
  }

  solveQuadratic() {
    const a = parseFloat(this.quadA?.value);
    const b = parseFloat(this.quadB?.value);
    const c = parseFloat(this.quadC?.value);
    
    if (isNaN(a) || isNaN(b) || isNaN(c)) return;
    if (a === 0) {
      this.solveLinear();
      return;
    }
    
    const disc = b * b - 4 * a * c;
    if (disc < 0) {
      if (this.resEl) this.resEl.textContent = "No Real Roots (D < 0)";
      if (this.lessonEl) {
        this.lessonEl.innerHTML = Sanitizer.sanitizeHTML(
          `<div class="lesson-title">Quadratic Formula</div>Discriminant D = ${disc}. Since D is negative, there are no real solutions.`
        );
        this.lessonEl.classList.add('visible');
      }
    } else {
      const x1 = (-b + Math.sqrt(disc)) / (2 * a);
      const x2 = (-b - Math.sqrt(disc)) / (2 * a);
      if (this.resEl) this.resEl.textContent = `x1 = ${x1.toFixed(2)}, x2 = ${x2.toFixed(2)}`;

      if (this.lessonEl) {
        this.lessonEl.innerHTML = Sanitizer.sanitizeHTML(
          `<div class="lesson-title">Quadratic Formula</div>
          1. D = b² - 4ac = ${disc}<br>
          2. x = (-b ± √D) / 2a<br>
          3. x = (${-b} ± ${Math.sqrt(disc).toFixed(2)}) / ${2 * a}`
        );
        this.lessonEl.classList.add('visible');
      }
    }
  }
}