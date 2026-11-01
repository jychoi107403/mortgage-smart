import { describe, it, expect } from 'vitest';
import { STATES } from '../data/states';
import { findStateBySlug, stateUrl } from './states';

describe('주 데이터', () => {
  it('50개 주 + DC = 51개이다', () => {
    expect(STATES.length).toBe(51);
  });

  it('slug와 약어가 중복되지 않는다', () => {
    expect(new Set(STATES.map((s) => s.slug)).size).toBe(51);
    expect(new Set(STATES.map((s) => s.abbr)).size).toBe(51);
  });

  it('slug는 소문자와 하이픈만 사용한다 (URL 안전)', () => {
    for (const s of STATES) expect(s.slug).toMatch(/^[a-z]+(-[a-z]+)*$/);
  });

  it('재산세율은 0%보다 크고 3% 이하이다', () => {
    for (const s of STATES) {
      expect(s.propertyTaxRatePct).toBeGreaterThan(0);
      expect(s.propertyTaxRatePct).toBeLessThanOrEqual(3);
    }
  });

  it('원문 값과 일치한다 (텍사스 1.40, 하와이 0.29, 뉴저지 1.88)', () => {
    expect(findStateBySlug('texas')?.propertyTaxRatePct).toBe(1.4);
    expect(findStateBySlug('hawaii')?.propertyTaxRatePct).toBe(0.29);
    expect(findStateBySlug('new-jersey')?.propertyTaxRatePct).toBe(1.88);
  });
});

describe('주 조회 함수', () => {
  it('대소문자 상관없이 찾는다', () => {
    expect(findStateBySlug('TEXAS')?.abbr).toBe('TX');
  });

  it('목록에 없거나 이상한 값은 undefined를 반환한다', () => {
    expect(findStateBySlug('atlantis')).toBeUndefined();
    expect(findStateBySlug('')).toBeUndefined();
    expect(findStateBySlug(undefined)).toBeUndefined();
    expect(findStateBySlug('<script>alert(1)</script>')).toBeUndefined();
    expect(findStateBySlug('__proto__')).toBeUndefined();
  });

  it('주소를 올바르게 만든다', () => {
    expect(stateUrl(findStateBySlug('texas')!)).toBe('/mortgage/texas');
  });
});

