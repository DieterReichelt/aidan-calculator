import { describe, it, expect } from 'vitest';
import { Evaluator } from './js/core/evaluator.js';
import { Parser } from './js/core/parser.js';

describe('Calculation Engine', () => {
  it('should correctly handle PEMDAS (Order of Operations)', () => {
    const tokens = Parser.tokenize("3 + 5 * 2");
    const postfix = Parser.shuntingYard(tokens);
    const result = Evaluator.evaluateRPN(postfix);
    expect(result).toBe(13);
  });

  it('should handle parentheses correctly', () => {
    const tokens = Parser.tokenize("(3 + 5) * 2");
    const postfix = Parser.shuntingYard(tokens);
    const result = Evaluator.evaluateRPN(postfix);
    expect(result).toBe(16);
  });

  it('should handle division by zero errors gracefully', () => {
    const tokens = Parser.tokenize("10 / 0");
    const postfix = Parser.shuntingYard(tokens);
    expect(() => Evaluator.evaluateRPN(postfix)).toThrow(/divide by 0/i);
  });
});