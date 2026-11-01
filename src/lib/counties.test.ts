import { describe, it, expect } from 'vitest';
import { STATES } from '../data/states';
import {
  loadCounties,
  findCounty,
  countyUrl,
  isTopCodedTax,
  rateDifferenceFromState,
  extremeCounties,
} from './counties';

describe('카운티 데이터', () => {
  it('51개 주 모두 데이터 파일이 있고 합계는 3,131개이다', async () => {
    let total = 0;
    for (const s of STATES) {
      const list = await loadCounties(s.slug);
      expect(list.length, s.name).toBeGreaterThan(0);
      total += list.length;
    }
    expect(total).toBe(3131);
  });

  it('주 안에서 slug가 중복되지 않고 URL에 안전하다', async () => {
    for (const s of STATES) {
      const list = await loadCounties(s.slug);
      expect(new Set(list.map((c) => c.slug)).size, s.name).toBe(list.length);
      for (const c of list) expect(c.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it('값 범위가 정상이다 (세율 0~5%, 세금 양수, FIPS 5자리)', async () => {
    for (const s of STATES) {
      for (const c of await loadCounties(s.slug)) {
        expect(c.ratePct).toBeGreaterThan(0);
        expect(c.ratePct).toBeLessThanOrEqual(5);
        expect(c.medianTax).toBeGreaterThan(0);
        expect(c.fips).toMatch(/^\d{5}$/);
      }
    }
  });

  it('원본 값과 일치한다 (Autauga 627/0.28, Harris TX 4489/1.5)', async () => {
    const al = findCounty(await loadCounties('alabama'), 'autauga-county');
    expect(al?.medianTax).toBe(627);
    expect(al?.ratePct).toBe(0.28);
    const tx = findCounty(await loadCounties('texas'), 'harris-county');
    expect(tx?.medianTax).toBe(4489);
    expect(tx?.ratePct).toBe(1.5);
  });

  it('같은 이름의 카운티도 주가 다르면 다른 데이터이다 (Harris TX vs GA)', async () => {
    const tx = findCounty(await loadCounties('texas'), 'harris-county');
    const ga = findCounty(await loadCounties('georgia'), 'harris-county');
    expect(tx?.fips).not.toBe(ga?.fips);
  });
});

describe('조회 함수 보안', () => {
  it('허용 목록에 없는 주는 빈 배열을 돌려준다', async () => {
    expect(await loadCounties('atlantis')).toEqual([]);
    expect(await loadCounties('')).toEqual([]);
    expect(await loadCounties(undefined)).toEqual([]);
    expect(await loadCounties('../states')).toEqual([]);
    expect(await loadCounties('__proto__')).toEqual([]);
  });

  it('없거나 이상한 카운티 slug는 undefined를 돌려준다', async () => {
    const list = await loadCounties('texas');
    expect(findCounty(list, 'nowhere-county')).toBeUndefined();
    expect(findCounty(list, undefined)).toBeUndefined();
    expect(findCounty(list, '<script>')).toBeUndefined();
  });

  it('대소문자는 구분하지 않는다', async () => {
    expect(findCounty(await loadCounties('texas'), 'HARRIS-COUNTY')?.name).toBe('Harris County');
  });
});

describe('보조 함수', () => {
  it('주소를 올바르게 만든다', async () => {
    const c = findCounty(await loadCounties('texas'), 'harris-county')!;
    expect(countyUrl('texas', c)).toBe('/mortgage/texas/harris-county');
  });

  it('상한값 10,001인 세금은 "10,000 초과"로 판정한다', async () => {
    const bergen = findCounty(await loadCounties('new-jersey'), 'bergen-county')!;
    expect(isTopCodedTax(bergen)).toBe(true);
    const autauga = findCounty(await loadCounties('alabama'), 'autauga-county')!;
    expect(isTopCodedTax(autauga)).toBe(false);
  });

  it('주 평균과의 차이를 계산한다 (Harris TX 1.50 - 텍사스 1.40 = 0.10)', async () => {
    const c = findCounty(await loadCounties('texas'), 'harris-county')!;
    expect(rateDifferenceFromState(c, 1.4)).toBe(0.1);
  });

  it('세율 높은/낮은 카운티를 올바른 순서로 돌려준다', async () => {
    const { highest, lowest } = extremeCounties(await loadCounties('texas'), 3);
    expect(highest.length).toBe(3);
    expect(lowest.length).toBe(3);
    expect(highest[0].ratePct).toBeGreaterThanOrEqual(highest[2].ratePct);
    expect(lowest[0].ratePct).toBeLessThanOrEqual(lowest[2].ratePct);
    expect(highest[0].ratePct).toBeGreaterThan(lowest[0].ratePct);
  });
});

