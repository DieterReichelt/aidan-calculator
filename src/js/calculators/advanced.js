import { Parser } from '../core/parser.js';
import { Evaluator } from '../core/evaluator.js';
import { CONFIG } from '../config.js';
import { ErrorHandler } from '../utils/errors.js';
import { Sanitizer } from '../utils/sanitizer.js';

export class AdvancedParserCalculator {
  constructor() {
    this.expr = "";
    this.latestSteps = [];
    this.playbackIndex = 0;
    this.playbackTimer = null;
    this.isPlaying = false;
    
    this.infixEl = document.getElementById('adv-infix');
    this.postfixEl = document.getElementById('adv-postfix');
    this.stepsEl = document.getElementById('adv-steps');
    this.resEl = document.getElementById('adv-res');
    this.playBtn = document.getElementById('adv-play-btn');
    this.speedEl = document.getElementById('adv-speed');
    
    this.init();
  }

  init() {
    this.updateDisplay();
  }

  insertChar(c) {
    this.expr += c;
    this.updateDisplay();
  }

  clear() {
    this.expr = "";
    this.stopPlayback();
    this.latestSteps = [];
    this.playbackIndex = 0;
    this.updateDisplay();
    if (this.resEl) this.resEl.textContent = "0";
  }

  backspace() {
    this.expr = this.expr.slice(0, -1);
    this.updateDisplay();
  }

  getPlaybackDelay() {
    const speed = this.speedEl?.value || 'normal';
    return CONFIG.PLAYBACK_SPEED[speed.toUpperCase()] || 700;
  }

  stopPlayback() {
    if (this.playbackTimer) {
      clearInterval(this.playbackTimer);
      this.playbackTimer = null;
    }
    this.isPlaying = false;
    if (this.playBtn) this.playBtn.textContent = "Play";
  }

  togglePlayback() {
    if (this.isPlaying) {
      this.stopPlayback();
      return;
    }
    if (!this.latestSteps.length) return;
    if (this.playbackIndex >= this.latestSteps.length) this.playbackIndex = 0;
    
    this.isPlaying = true;
    if (this.playBtn) this.playBtn.textContent = "Pause";
    
    this.playbackTimer = setInterval(() => {
      if (this.playbackIndex < this.latestSteps.length) {
        this.playbackIndex++;
        this.renderSteps();
      } else {
        this.stopPlayback();
      }
    }, this.getPlaybackDelay());
  }

  nextStep() {
    this.stopPlayback();
    if (!this.latestSteps.length) return;
    this.playbackIndex = Math.min(this.playbackIndex + 1, this.latestSteps.length);
    this.renderSteps();
  }

  resetSteps() {
    this.stopPlayback();
    this.playbackIndex = 0;
    this.renderSteps();
  }

  updateDisplay() {
    if (this.infixEl) {
      this.infixEl.textContent = this.expr.replace(/\*/g, '×').replace(/\//g, '÷');
    }
    
    try {
      if (!this.expr.trim()) {
        this.stopPlayback();
        this.latestSteps = [];
        this.playbackIndex = 0;
        if (this.postfixEl) this.postfixEl.textContent = "";
        if (this.stepsEl) this.stepsEl.innerHTML = "";
        return;
      }
      
      const tokens = Parser.tokenize(this.expr);
      const conversion = Parser.shuntingYardDetailed(tokens);
      
      this.latestSteps = conversion.steps;
      this.playbackIndex = conversion.steps.length;
      if (this.postfixEl) this.postfixEl.textContent = conversion.postfix.join(" ");
      this.renderSteps();
    } catch (e) {
      this.stopPlayback();
      this.latestSteps = [];
      this.playbackIndex = 0;
      if (this.postfixEl) this.postfixEl.textContent = "...";
      if (this.stepsEl) this.stepsEl.innerHTML = "";
    }
  }

  calculate() {
    if (!this.expr.trim()) return;
    try {
      const tokens = Parser.tokenize(this.expr);
      const postfix = Parser.shuntingYard(tokens);
      const result = Evaluator.evaluateRPN(postfix);
      if (this.resEl) this.resEl.textContent = parseFloat(result.toFixed(CONFIG.DISPLAY.DECIMAL_PLACES));
    } catch (e) {
      if (this.resEl) this.resEl.textContent = ErrorHandler.handle(e, 'AdvancedParser');
    }
  }

  renderSteps() {
    if (!this.stepsEl) return;
    if (!this.latestSteps.length) {
      this.stepsEl.innerHTML = "";
      return;
    }
    
    if (this.playbackIndex === 0) {
      this.stepsEl.innerHTML = `<div class="history-item">Press <strong>Play</strong> to animate steps.</div>`;
      return;
    }
    
    this.stepsEl.innerHTML = this.latestSteps
      .slice(0, this.playbackIndex)
      .map((s, i) => Sanitizer.sanitizeHTML(
        `<div class="history-item"><strong>${i + 1}.</strong> token=<strong>${Sanitizer.escapeHTML(String(s.token))}</strong> | op=[${s.operatorStack.map(t => Sanitizer.escapeHTML(String(t))).join(' ')}] | out=[${s.outputQueue.map(t => Sanitizer.escapeHTML(String(t))).join(' ')}]</div>`
      )).join('');
    
    // Auto-scroll to bottom
    this.stepsEl.scrollTop = this.stepsEl.scrollHeight;
  }
}