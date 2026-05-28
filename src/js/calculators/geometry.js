import { Sanitizer } from '../utils/sanitizer.js';

export class GeometryCalculator {
  constructor() {
    this.shapeSelect = document.getElementById('geom-shape');
    this.inputsContainer = document.getElementById('geom-inputs');
    this.lessonEl = document.getElementById('geom-lesson');
    
    this.svgElements = {
      circle: document.getElementById('geom-circle'),
      rect: document.getElementById('geom-rect'),
      tri: document.getElementById('geom-tri')
    };
    
    this.labels = {
      l1: document.getElementById('geom-label-1'),
      l2: document.getElementById('geom-label-2')
    };
    
    this.activeInput = null;
  }

  setActiveInput(el) {
    this.activeInput = el;
  }

  keypadType(key) {
    if (key === 'AC') {
      this.clear();
      return;
    }
    if (!this.activeInput) this.activeInput = document.querySelector('#geom-inputs input');
    if (!this.activeInput) return;
    if (key === 'B') this.activeInput.value = this.activeInput.value.slice(0, -1);
    else this.activeInput.value += key;
    this.calculate();
  }

  updateUI() {
    const shape = this.shapeSelect?.value || 'circle';
    
    if (this.svgElements.circle) this.svgElements.circle.style.display = shape === 'circle' ? 'block' : 'none';
    if (this.svgElements.rect) this.svgElements.rect.style.display = shape === 'rectangle' ? 'block' : 'none';
    if (this.svgElements.tri) this.svgElements.tri.style.display = shape === 'triangle' ? 'block' : 'none';
    
    let html = "";
    if (shape === 'circle') html = '<input class="ld-input" type="number" id="geom-val-1" placeholder="Radius (r)" onfocus="setActiveGeom(this)" oninput="calcGeometry()">';
    else if (shape === 'rectangle') html = '<input class="ld-input" type="number" id="geom-val-1" placeholder="Length (L)" onfocus="setActiveGeom(this)" oninput="calcGeometry()"><input class="ld-input" type="number" id="geom-val-2" placeholder="Width (W)" onfocus="setActiveGeom(this)" oninput="calcGeometry()">';
    else if (shape === 'triangle') html = '<input class="ld-input" type="number" id="geom-val-1" placeholder="Base (b)" onfocus="setActiveGeom(this)" oninput="calcGeometry()"><input class="ld-input" type="number" id="geom-val-2" placeholder="Height (h)" onfocus="setActiveGeom(this)" oninput="calcGeometry()">';
    
    if (this.inputsContainer) this.inputsContainer.innerHTML = html;
    if (this.labels.l1) this.labels.l1.textContent = "";
    if (this.labels.l2) this.labels.l2.textContent = "";
  }

  calculate() {
    const shape = this.shapeSelect?.value || 'circle';
    const v1 = parseFloat(document.getElementById('geom-val-1')?.value) || 0;
    const v2 = parseFloat(document.getElementById('geom-val-2')?.value) || 0;

    const needsBoth = shape === 'rectangle' || shape === 'triangle';
    if (v1 <= 0 || (needsBoth && v2 <= 0)) return;

    let area, perim, steps = "";
    if (shape === 'circle') {
      area = Math.PI * v1 * v1; perim = 2 * Math.PI * v1;
      if (this.labels.l1) this.labels.l1.textContent = "r = " + v1;
      steps = `1. Area = π × r² = π × ${v1}² = ${area.toFixed(2)}<br>2. Circumference = 2 × π × r = ${perim.toFixed(2)}`;
    } else if (shape === 'rectangle') {
      area = v1 * v2; perim = 2 * (v1 + v2);
      if (this.labels.l1) this.labels.l1.textContent = "L=" + v1;
      if (this.labels.l2) this.labels.l2.textContent = "W=" + v2;
      steps = `1. Area = L × W = ${v1} × ${v2} = ${area}<br>2. Perimeter = 2(L + W) = 2(${v1} + ${v2}) = ${perim}`;
    } else if (shape === 'triangle') {
      area = 0.5 * v1 * v2;
      if (this.labels.l1) this.labels.l1.textContent = "b=" + v1;
      if (this.labels.l2) this.labels.l2.textContent = "h=" + v2;
      steps = `1. Area = ½ × b × h = 0.5 × ${v1} × ${v2} = ${area}`;
    }

    if (this.lessonEl) {
      this.lessonEl.innerHTML = Sanitizer.sanitizeHTML(`<div class="lesson-title">${shape.toUpperCase()} Formulas</div>${steps}`);
      this.lessonEl.classList.add('visible');
    }
  }

  clear() {
    const inputs = document.querySelectorAll('#geom-inputs input');
    inputs.forEach(i => i.value = "");
    if (this.lessonEl) {
      this.lessonEl.innerHTML = "";
      this.lessonEl.classList.remove('visible');
    }
    if (this.labels.l1) this.labels.l1.textContent = "";
    if (this.labels.l2) this.labels.l2.textContent = "";
  }
}