import { describe, it, expect } from 'vitest';
import { calculateAffordability, type AffordabilityInput } from './affordability';

// 기본 예시 입력 (테스트마다 필요한 값만 바꿔서 사용)
const base: AffordabilityInput = {
  annualIncome: 120000,
  monthlyDebt: 0,
  downPayment: 60000,
  annualRatePct: 6.5,
  years: 30,
  propertyTaxRatePct: 1.1,
  annualInsurance: 1800,
  pmiRatePct: 0.7,
};

describe('감당 가능한 집값', () => {
  it('손계산: 연소득 $120k면 28% 한도는 월 $2,800이고 월 납입액이 거의 같다', () => {
    const r = calculateAffordability(base);
    expect(r.maxMonthlyHousing).toBeCloseTo(2800, 5);
    expect(r.limitedBy).toBe('housing-ratio');
    expect(r.breakdown.totalMonthly).toBeLessThanOrEqual(2800);
    expect(r.breakdown.totalMonthly).toBeGreaterThan(2799);
  });

  it('월 부채가 크면 36% 기준이 한도를 정한다 (한도 $2,600)', () => {
    const r = calculateAffordability({ ...base, monthlyDebt: 1000 });
    expect(r.limitedBy).toBe('debt-ratio');
    expect(r.maxMonthlyHousing).toBeCloseTo(2600, 5);
    expect(r.breakdown.totalMonthly).toBeLessThanOrEqual(2600);
  });

  it('소득이 0이면 집값은 0이다', () => {
    expect(calculateAffordability({ ...base, annualIncome: 0 }).maxHomePrice).toBe(0);
  });

  it('부채가 너무 커서 한도가 0이면 집값은 0이다', () => {
    const r = calculateAffordability({ ...base, monthlyDebt: 5000 });
    expect(r.maxMonthlyHousing).toBe(0);
    expect(r.maxHomePrice).toBe(0);
  });

  it('소득이 오르면 집값도 오른다', () => {
    const low = calculateAffordability({ ...base, annualIncome: 80000 }).maxHomePrice;
    const high = calculateAffordability({ ...base, annualIncome: 160000 }).maxHomePrice;
    expect(high).toBeGreaterThan(low);
  });

  it('금리가 오르면 집값은 내려간다', () => {
    const a = calculateAffordability({ ...base, annualRatePct: 5 }).maxHomePrice;
    const b = calculateAffordability({ ...base, annualRatePct: 8 }).maxHomePrice;
    expect(a).toBeGreaterThan(b);
  });

  it('이상한 입력(NaN, 음수, 초대형 값)에도 오류 없이 안전한 값을 돌려준다', () => {
    const r = calculateAffordability({
      ...base,
      annualIncome: NaN,
      monthlyDebt: -100,
      downPayment: Infinity,
    });
    expect(Number.isFinite(r.maxHomePrice)).toBe(true);
    expect(r.maxHomePrice).toBeGreaterThanOrEqual(0);
    const big = calculateAffordability({ ...base, annualIncome: 1e18 });
    expect(Number.isFinite(big.maxHomePrice)).toBe(true);
  });

  it('비율을 바꾸면 한도도 바뀐다 (주거비 비율 40%면 한도 $4,000)', () => {
    const r = calculateAffordability({ ...base, frontEndPct: 40, backEndPct: 50 });
    expect(r.maxMonthlyHousing).toBeCloseTo(4000, 5);
  });
});

