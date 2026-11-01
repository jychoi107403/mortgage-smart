import { describe, it, expect } from 'vitest';
import { calculateMortgage } from './mortgage';

const base = {
  homePrice: 400000,
  downPayment: 80000, // 20%
  annualRatePct: 6,
  years: 30,
  propertyTaxRatePct: 1.2,
  annualInsurance: 1800,
  pmiRatePct: 0.7,
};

describe('calculateMortgage', () => {
  it('$320,000 대출, 6%, 30년 → 월 원리금 약 $1,918.56', () => {
    const r = calculateMortgage(base);
    expect(r.principalAndInterest).toBeCloseTo(1918.56, 1);
  });

  it('계약금 20% 이상이면 PMI가 0', () => {
    expect(calculateMortgage(base).pmi).toBe(0);
  });

  it('계약금 20% 미만이면 PMI 발생', () => {
    const r = calculateMortgage({ ...base, downPayment: 20000 });
    expect(r.pmi).toBeGreaterThan(0);
  });

  it('재산세/보험료는 월 단위로 환산', () => {
    const r = calculateMortgage(base);
    expect(r.propertyTax).toBeCloseTo(400, 5); // 400000*1.2%/12
    expect(r.insurance).toBeCloseTo(150, 5);
  });

  it('이자율 0%도 오류 없이 계산', () => {
    const r = calculateMortgage({ ...base, annualRatePct: 0 });
    expect(r.principalAndInterest).toBeCloseTo(320000 / 360, 5);
  });
});

