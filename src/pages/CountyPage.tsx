import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import MortgageCalculator from '../components/MortgageCalculator';
import { findStateBySlug, stateUrl } from '../lib/states';
import {
  loadCounties,
  findCounty,
  countyUrl,
  isTopCodedTax,
  rateDifferenceFromState,
  extremeCounties,
  type County,
} from '../lib/counties';
import { PROPERTY_TAX_SOURCE } from '../data/states';
import { usePageSeo } from '../lib/seo';

// 금액을 $1,234 형태로 보여주는 함수
const usd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

// 예시 집값 (계산기 기본값 $400,000과 같게 맞춥니다)
const EXAMPLE_HOME_PRICE = 400000;

// /mortgage/:state/:county 주소에 보여줄 카운티 페이지
export default function CountyPage() {
  const { state: stateSlug, county: countySlug } = useParams();
  const state = findStateBySlug(stateSlug); // 51개 허용 목록 검사

  // 그 주의 카운티 목록 (지연 로딩) - null 이면 아직 불러오는 중
  const [list, setList] = useState<County[] | null>(null);

  useEffect(() => {
    let cancelled = false; // 주소가 빨리 바뀌었을 때 옛날 결과가 덮어쓰지 않도록 합니다.
    setList(null);
    loadCounties(state?.slug).then((result) => {
      if (!cancelled) setList(result);
    });
    return () => {
      cancelled = true;
    };
  }, [state?.slug]);

  const county = list ? findCounty(list, countySlug) : undefined;

  // 카운티 전용 SEO 메타태그 설정 (데이터가 확인된 카운티만 고유 제목/설명을 넣습니다)
  usePageSeo({
    title:
      state && county
        ? `${county.name}, ${state.abbr} Mortgage & Property Tax Calculator (${county.ratePct.toFixed(2)}% Rate)`
        : 'County Property Tax & Mortgage Calculator | MortgageSmart',
    description:
      state && county
        ? `Estimate your monthly mortgage payment in ${county.name}, ${state.name}. Effective property tax rate is ${county.ratePct.toFixed(2)}% compared to the ${state.propertyTaxRatePct.toFixed(2)}% ${state.name} average.`
        : 'Calculate your monthly mortgage payment with county-level US property tax rates.',
    path: state && county ? `/mortgage/${state.slug}/${county.slug}` : '/mortgage',
  });

  // 없는 주소 안내 화면 (보안: 입력된 주소 문자열은 화면에 출력하지 않습니다)
  const notFound = (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">County not found</h1>
      <p className="mt-2 text-slate-600">We could not find that county.</p>
      <Link to="/mortgage" className="mt-4 inline-block text-blue-600 underline">
        Browse all states
      </Link>
    </div>
  );

  if (!state) return notFound;
  if (list === null) return <p className="text-slate-600">Loading...</p>;
  if (!county) return notFound;

  // ---- 화면에 보여줄 계산값들 ----
  const diff = rateDifferenceFromState(county, state.propertyTaxRatePct);
  const diffText =
    diff === 0
      ? `the same as the ${state.name} average`
      : `${Math.abs(diff).toFixed(2)} percentage points ${diff > 0 ? 'higher' : 'lower'} than the ${state.name} average`;
  const taxOnExample = (EXAMPLE_HOME_PRICE * county.ratePct) / 100;
  const topCoded = isTopCodedTax(county);

  // 같은 주에서 세율이 높은/낮은 카운티 (현재 카운티는 제외)
  const others = list.filter((c) => c.slug !== county.slug);
  const { highest, lowest } = extremeCounties(others, 5);

  const facts: [string, string][] = [
    ['Effective property tax rate', `${county.ratePct.toFixed(2)}%`],
    [`${state.name} average rate`, `${state.propertyTaxRatePct.toFixed(2)}%`],
    ['Median property tax paid', topCoded ? '$10,000+ per year' : `${usd(county.medianTax)} per year`],
    [
      'Change vs. last year (inflation-adjusted)',
      county.changePct === null
        ? 'Not available'
        : `${county.changePct > 0 ? '+' : ''}${county.changePct.toFixed(1)}%`,
    ],
    [`Estimated tax on a ${usd(EXAMPLE_HOME_PRICE)} home`, `${usd(taxOnExample)} per year`],
  ];

  const linkList = (items: County[]) => (
    <ul className="mt-2 space-y-1">
      {items.map((c) => (
        <li key={c.slug}>
          <Link to={countyUrl(state.slug, c)} className="text-blue-600 underline">
            {c.name}
          </Link>{' '}
          <span className="text-sm text-slate-500">{c.ratePct.toFixed(2)}%</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div>
      {/* 빵부스러기 길: 홈 > 주 목록 > 주 > 카운티 */}
      <nav className="text-sm text-blue-600">
        <Link to="/mortgage" className="underline">All states</Link>
        {' / '}
        <Link to={stateUrl(state)} className="underline">{state.name}</Link>
      </nav>

      <div className="mt-3">
        {/* key: 다른 카운티로 이동하면 계산기 입력값을 새로 시작합니다. */}
        <MortgageCalculator
          key={`${state.slug}/${county.slug}`}
          initialTaxRatePct={county.ratePct}
          title={`${county.name}, ${state.name} Mortgage Calculator`}
          description={`Estimate your monthly payment in ${county.name}. The effective property tax rate here is ${county.ratePct.toFixed(2)}%, ${diffText}.`}
        />
      </div>

      <section className="mt-8 rounded-xl bg-white p-5 shadow">
        <h2 className="text-2xl font-bold text-slate-900">
          Property taxes in {county.name}, {state.name}
        </h2>
        <p className="mt-2 text-slate-600">
          Homeowners in {county.name} pay an effective property tax rate of {county.ratePct.toFixed(2)}%, which is {diffText}.
          {topCoded
            ? ' The median homeowner pays more than $10,000 per year in property taxes.'
            : ` The median homeowner pays ${usd(county.medianTax)} per year in property taxes.`}
        </p>
        <dl className="mt-4 divide-y divide-slate-100">
          {facts.map(([label, value]) => (
            <div key={label} className="flex justify-between py-2">
              <dt className="text-slate-600">{label}</dt>
              <dd className="font-medium text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow">
          <h2 className="text-lg font-bold text-slate-900">Higher-rate counties in {state.name}</h2>
          {linkList(highest)}
        </div>
        <div className="rounded-xl bg-white p-5 shadow">
          <h2 className="text-lg font-bold text-slate-900">Lower-rate counties in {state.name}</h2>
          {linkList(lowest)}
        </div>
      </section>

      {/* 미국 검색엔진 롱테일 키워드 및 FAQPage 스키마 매칭용 FAQ 섹션 */}
      <section className="mt-6 space-y-4 rounded-xl bg-white p-5 shadow">
        <h2 className="text-xl font-bold text-slate-900">
          {county.name}, {state.abbr} Property Tax &amp; Mortgage FAQs
        </h2>
        <div className="space-y-3 text-sm text-slate-700">
          <div>
            <h3 className="font-semibold text-slate-900">
              What is the property tax rate in {county.name}, {state.name}?
            </h3>
            <p className="mt-1">
              The effective property tax rate on owner-occupied housing in {county.name},{' '}
              {state.name} is {county.ratePct.toFixed(2)}%, which is {diffText} (
              {state.propertyTaxRatePct.toFixed(2)}%).
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">
              How much is property tax on a {usd(EXAMPLE_HOME_PRICE)} home in {county.name},{' '}
              {state.abbr}?
            </h3>
            <p className="mt-1">
              At an effective rate of {county.ratePct.toFixed(2)}%, a {usd(EXAMPLE_HOME_PRICE)} home
              in {county.name} has an estimated annual property tax of about {usd(taxOnExample)}{' '}
              (around {usd(Math.round(taxOnExample / 12))} per month). The median annual property
              tax bill in {county.name} is{' '}
              {topCoded ? 'over $10,000' : usd(county.medianTax)}.
            </p>
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs text-slate-500">
        Rates are effective property tax rates on owner-occupied housing, based on 2024 American Community
        Survey 5-year estimates. Source: {PROPERTY_TAX_SOURCE}. Your actual tax bill depends on your
        property&apos;s assessed value, city, school district, and any exemptions.
      </p>
    </div>
  );
}
