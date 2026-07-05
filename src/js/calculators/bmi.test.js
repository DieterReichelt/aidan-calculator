import { describe, it, expect } from 'vitest';
import { BmiCalculator } from './bmi.js';

describe('BMI Calculator', () => {
  it('computes BMI = weight(kg) / height(m)²', () => {
    expect(BmiCalculator.bmi(70, 1.75)).toBeCloseTo(22.857, 2);
  });

  it('classifies the standard categories', () => {
    expect(BmiCalculator.category(17).label).toBe('Underweight');
    expect(BmiCalculator.category(22).label).toBe('Normal weight');
    expect(BmiCalculator.category(27).label).toBe('Overweight');
    expect(BmiCalculator.category(32).label).toBe('Obese');
  });

  it('places boundary values in the higher band (18.5 → normal, 25 → overweight)', () => {
    expect(BmiCalculator.category(18.5).label).toBe('Normal weight');
    expect(BmiCalculator.category(25).label).toBe('Overweight');
  });
});
