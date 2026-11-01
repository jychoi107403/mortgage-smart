import { Link } from 'react-router-dom';
import { STATES, PROPERTY_TAX_DATA_YEAR, PROPERTY_TAX_SOURCE } from '../data/states';
import { stateUrl } from '../lib/states';
import { usePageSeo } from '../lib/seo';

// /mortgage 주소에 보여줄 "주 선택" 목록 페이지
export default function StateIndex() {
  usePageSeo({
    title: 'Mortgage Calculator by State (2026 Property Tax Rates) | MortgageSmart',
    description:
      'Compare average effective property tax rates across all 50 US states and DC, and estimate your true monthly mortgage payment.',
    path: '/mortgage',
  });

  return (
    <div>
      <Link to="/" className="text-sm text-blue-600 underline">
        &larr; All calculators
      </Link>
      <h1 className="mt-3 text-3xl font-bold text-slate-900">Mortgage Calculator by State</h1>
      <p className="mt-2 text-slate-600">
        Choose your state to see a mortgage payment estimate with its average property tax rate.
      </p>

      {/* 51개 주를 반응형 격자로 나열합니다. (화면이 좁으면 2열, 넓으면 4열) */}
      <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {STATES.map((s) => (
          <li key={s.slug}>
            <Link
              to={stateUrl(s)}
              className="block rounded-lg bg-white p-3 shadow hover:bg-slate-50"
            >
              <span className="font-medium text-slate-900">{s.name}</span>
              <span className="block text-xs text-slate-500">
                Property tax {s.propertyTaxRatePct.toFixed(2)}%
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-xs text-slate-500">
        Rates are statewide average effective rates on owner-occupied housing ({PROPERTY_TAX_DATA_YEAR}).
        Source: {PROPERTY_TAX_SOURCE}.
      </p>
    </div>
  );
}
