import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import MortgageCalculator from '../components/MortgageCalculator';
import { findStateBySlug } from '../lib/states';
import { loadCounties, countyUrl, type County } from '../lib/counties';
import { PROPERTY_TAX_DATA_YEAR, PROPERTY_TAX_SOURCE } from '../data/states';

// /mortgage/:state 주소에 보여줄 주별 페이지
export default function StatePage() {
  // 주소에서 :state 부분을 꺼냅니다. (예: /mortgage/texas -> "texas")
  const { state: slug } = useParams();
  // 허용 목록(51개)에 있는 값만 통과합니다. 없으면 undefined
  const state = findStateBySlug(slug);

  // 그 주의 카운티 목록 (지연 로딩). null 이면 아직 불러오는 중
  const [counties, setCounties] = useState<County[] | null>(null);
  // 카운티 목록을 걸러 보는 검색어 (화면 표시용일 뿐, 어디에도 저장하거나 보내지 않습니다)
  const [query, setQuery] = useState('');

  // 주가 바뀔 때마다 그 주의 카운티 데이터만 불러옵니다.
  // 주의: 훅(useEffect 등)은 아래의 early return(if (!state))보다 위에 있어야 합니다.
  useEffect(() => {
    let cancelled = false; // 주소가 빨리 바뀌었을 때 옛날 결과가 덮어쓰지 않도록 합니다.
    setCounties(null);
    setQuery('');
    loadCounties(state?.slug).then((result) => {
      if (!cancelled) setCounties(result);
    });
    return () => {
      cancelled = true;
    };
  }, [state?.slug]);

  // 검색어로 카운티 목록을 걸러냅니다. (대소문자 구분 없음)
  const visible = useMemo(() => {
    if (!counties) return [];
    const q = query.trim().toLowerCase();
    return q ? counties.filter((c) => c.name.toLowerCase().includes(q)) : counties;
  }, [counties, query]);

  // 없는 주소(예: /mortgage/atlantis)이면 안내 화면을 보여줍니다.
  // 보안: 사용자가 입력한 주소 문자열은 화면에 출력하지 않습니다.
  if (!state) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-slate-900">State not found</h1>
        <p className="mt-2 text-slate-600">We could not find that state.</p>
        <Link to="/" className="mt-4 inline-block text-blue-600 underline">
          Back to calculator
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/" className="text-sm text-blue-600 underline">
        &larr; All calculators
      </Link>
      <div className="mt-3">
        {/* key: 다른 주로 이동하면 계산기 입력값을 새로 시작하도록 합니다. */}
        <MortgageCalculator
          key={state.slug}
          initialTaxRatePct={state.propertyTaxRatePct}
          title={`${state.name} Mortgage Calculator`}
          description={`Estimate your monthly payment in ${state.name}. The average effective property tax rate in ${state.name} is ${state.propertyTaxRatePct.toFixed(2)}%.`}
        />
      </div>

      {/* 카운티 목록: 카운티 페이지로 들어가는 길 */}
      {counties !== null && counties.length > 0 && (
        <section className="mt-8 rounded-xl bg-white p-5 shadow">
          <h2 className="text-2xl font-bold text-slate-900">
            Property tax by county in {state.name}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {counties.length} counties. Select a county to see its property tax rate and a mortgage estimate.
          </p>

          <label className="mt-4 block max-w-xs">
            <span className="text-sm font-medium text-slate-700">Search counties</span>
            <input
              type="search"
              value={query}
              maxLength={60}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Harris"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          {visible.length === 0 ? (
            <p className="mt-4 text-slate-600">No counties match your search.</p>
          ) : (
            <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((c) => (
                <li key={c.slug} className="flex justify-between border-b border-slate-100 py-1">
                  <Link to={countyUrl(state.slug, c)} className="text-blue-600 underline">
                    {c.name}
                  </Link>
                  <span className="text-sm text-slate-500">{c.ratePct.toFixed(2)}%</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <p className="mt-6 text-xs text-slate-500">
        Property tax rate: statewide average effective rate on owner-occupied housing ({PROPERTY_TAX_DATA_YEAR}).
        Source: {PROPERTY_TAX_SOURCE}. Your actual rate depends on your county and city.
      </p>
    </div>
  );
}
