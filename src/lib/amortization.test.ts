import { describe, it, expect } from 'vitest';
import { buildSchedule, compareExtraPayment, summarizeByYear } from './amortization';

describe('상환 일정표', () => {
  it('추가 상환이 없으면 정확히 360개월이고 마지막 잔액은 0이다', () => {
    const s = buildSchedule(320000, 6.5, 30);
    expect(s.totalMonths).toBe(360);
    expect(s.rows[359].balance).toBeCloseTo(0, 2);
  });

  it('총 이자는 손계산 값과 일치한다 ($320k, 6.5%, 30년: 월 $2,022.62 x 360 - $320,000 ≈ $408,143)', () => {
    const s = buildSchedule(320000, 6.5, 30);
    expect(s.totalInterest).toBeGreaterThan(408000);
    expect(s.totalInterest).toBeLessThan(408300);
  });

  it('이자율 0%면 이자가 0이다', () => {
    const s = buildSchedule(120000, 0, 10);
    expect(s.totalInterest).toBeCloseTo(0, 5);
    expect(s.totalMonths).toBe(120);
  });

  it('추가 상환을 하면 기간이 짧아지고 이자가 줄어든다', () => {
    const e = compareExtraPayment(320000, 6.5, 30, 300);
    expect(e.monthsSaved).toBeGreaterThan(0);
    expect(e.interestSaved).toBeGreaterThan(0);
    expect(e.withExtra.rows[e.withExtra.rows.length - 1].balance).toBe(0);
  });

  it('대출금이 0이거나 입력이 이상해도 오류 없이 빈 결과를 반환한다', () => {
    expect(buildSchedule(0, 6.5, 30).rows).toEqual([]);
    expect(buildSchedule(NaN, 6.5, 30).rows).toEqual([]);
    expect(buildSchedule(-5, 6.5, 30).rows).toEqual([]);
  });

  it('기간이 비정상적으로 커도 600개월로 제한된다', () => {
    expect(buildSchedule(100000, 5, 9999).totalMonths).toBeLessThanOrEqual(600);
  });

  it('연도별 요약은 30개 연도를 만든다', () => {
    const y = summarizeByYear(buildSchedule(320000, 6.5, 30).rows);
    expect(y.length).toBe(30);
    expect(y[29].endBalance).toBeCloseTo(0, 2);
  });
});
