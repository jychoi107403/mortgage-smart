// 카운티 데이터 조회 유틸리티
// - 주별 JSON 파일을 "그 주 페이지에 들어갔을 때만" 불러옵니다 (지연 로딩).
// - 허용 목록(51개 주 slug)에 없는 값은 파일을 찾지도 않고 빈 결과를 돌려줍니다.

import { findStateBySlug } from './states';

export interface County {
  fips: string;            // 5자리 고유 번호
  name: string;            // 예: "Harris County"
  slug: string;            // URL용 이름 (예: "harris-county")
  medianTax: number;       // 중위 재산세 납부액 ($/년)
  ratePct: number;         // 실효 재산세율 (%)
  changePct: number | null; // 물가 반영 전년 대비 변화율 (%), 자료 없으면 null
}

// Vite가 빌드할 때 주별 JSON을 각각 별도 조각(chunk)으로 나눠 줍니다.
// 아래는 "함수 목록"일 뿐이라, 호출하기 전에는 실제로 불러오지 않습니다.
const loaders = import.meta.glob<County[]>('../data/counties/*.json', { import: 'default' });

// 한 번 불러온 주는 다시 불러오지 않도록 저장해 둡니다.
const cache = new Map<string, County[]>();

// 주 slug로 그 주의 카운티 목록을 불러옵니다.
// 허용 목록에 없는 주이거나 파일이 없으면 빈 배열을 돌려줍니다.
export async function loadCounties(stateSlug: string | undefined): Promise<County[]> {
  const state = findStateBySlug(stateSlug); // 51개 허용 목록 검사
  if (!state) return [];

  const hit = cache.get(state.slug);
  if (hit) return hit;

  const loader = loaders[`../data/counties/${state.slug}.json`];
  if (!loader) return [];

  const list = await loader();
  cache.set(state.slug, list);
  return list;
}

// 카운티 slug로 한 개를 찾습니다. 없으면 undefined
export function findCounty(list: County[], slug: string | undefined): County | undefined {
  if (typeof slug !== 'string') return undefined;
  const key = slug.toLowerCase();
  return list.find((c) => c.slug === key);
}

// 카운티 페이지 주소를 만들어 줍니다. 예: "/mortgage/texas/harris-county"
export function countyUrl(stateSlug: string, county: County): string {
  return `/mortgage/${stateSlug}/${county.slug}`;
}

// 중위 세금이 상한값(10,001)이면 "$10,000 초과"를 뜻하는 값으로 봅니다.
// (Tax Foundation 지도 범례의 "$10,001"과 같은 값)
export const TOP_CODED_TAX = 10001;
export const isTopCodedTax = (c: County): boolean => c.medianTax >= TOP_CODED_TAX;

// 카운티 세율이 주 평균보다 얼마나 높은지(%p). 양수면 주 평균보다 높음
export function rateDifferenceFromState(c: County, stateRatePct: number): number {
  return Math.round((c.ratePct - stateRatePct) * 100) / 100;
}

// 세율이 높은 카운티 n개와 낮은 카운티 n개 (페이지의 "함께 보기" 링크용)
export function extremeCounties(
  list: County[],
  n: number
): { highest: County[]; lowest: County[] } {
  const sorted = [...list].sort((a, b) => b.ratePct - a.ratePct || a.name.localeCompare(b.name));
  return {
    highest: sorted.slice(0, n),
    lowest: sorted.slice(-n).reverse(),
  };
}

