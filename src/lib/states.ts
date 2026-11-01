// 주(State) 조회 유틸리티
// URL의 slug(예: "texas")로 주 데이터를 안전하게 찾습니다.

import { STATES, type StateData } from '../data/states';

// slug -> 주 데이터를 빠르게 찾기 위한 Map (처음 한 번만 만들어 둡니다)
const STATE_BY_SLUG = new Map<string, StateData>(STATES.map((s) => [s.slug, s]));

// slug로 주를 찾습니다. 허용 목록(51개)에 없으면 undefined를 반환합니다.
// - 보안: 사용자가 URL에 아무 문자열이나 넣어도 목록에 없으면 무시됩니다.
// - 대소문자는 구분하지 않도록 소문자로 바꿔서 비교합니다.
export function findStateBySlug(slug: string | undefined): StateData | undefined {
  if (typeof slug !== 'string') return undefined;
  return STATE_BY_SLUG.get(slug.toLowerCase());
}

// 주 페이지 주소를 만들어 줍니다. 예: "/mortgage/texas"
export function stateUrl(state: StateData): string {
  return `/mortgage/${state.slug}`;
}

