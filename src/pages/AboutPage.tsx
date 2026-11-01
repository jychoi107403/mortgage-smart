import { Link } from 'react-router-dom';
import { usePageSeo } from '../lib/seo';
import { PROPERTY_TAX_DATA_YEAR, PROPERTY_TAX_SOURCE } from '../data/states';

// /about 주소에 보여줄 사이트 소개 및 데이터 출처/공식 설명 페이지
export default function AboutPage() {
  usePageSeo({
    title: 'About MortgageSmart & Methodology | MortgageSmart',
    description:
      'Learn how MortgageSmart calculates monthly mortgage payments, amortization schedules, home affordability, and county property taxes.',
    path: '/about',
  });

  return (
    <article className="space-y-6 rounded-xl bg-white p-6 shadow">
      <h1 className="text-3xl font-bold text-slate-900">About MortgageSmart &amp; Methodology</h1>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">Our Mission</h2>
        <p className="text-slate-700">
          Many mortgage calculators only show principal and interest, leaving homebuyers surprised
          by property taxes, homeowners insurance, and Private Mortgage Insurance (PMI).
          MortgageSmart helps you see your true monthly payment across all 50 US states, the
          District of Columbia, and 3,131 counties.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">Data Sources</h2>
        <p className="text-slate-700">
          Our statewide and county-level effective property tax rates are sourced from{' '}
          <strong>{PROPERTY_TAX_SOURCE}</strong> ({PROPERTY_TAX_DATA_YEAR} owner-occupied housing
          estimates). Effective property tax rates represent the median or mean annual residential
          property tax paid as a percentage of home value.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">Calculation Formulas</h2>
        <ul className="list-disc space-y-1 pl-5 text-slate-700">
          <li>
            <strong>Monthly Principal &amp; Interest</strong>: Standard fixed-rate amortization
            formula based on loan principal, monthly interest rate, and total months.
          </li>
          <li>
            <strong>Property Tax &amp; Insurance</strong>: Annual estimated property tax and
            homeowners insurance divided by 12 months.
          </li>
          <li>
            <strong>PMI</strong>: Automatically estimated when the down payment is less than 20% of
            the home price.
          </li>
          <li>
            <strong>Home Affordability</strong>: Uses the standard 28/36 lender debt-to-income (DTI)
            guideline to find the maximum home price that fits within your monthly budget.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">Explore Our Tools</h2>
        <div className="flex flex-wrap gap-4 text-sm font-medium">
          <Link to="/" className="text-blue-600 underline">
            Mortgage Payment Calculator
          </Link>
          <Link to="/mortgage" className="text-blue-600 underline">
            50-State Property Tax Guide
          </Link>
          <Link to="/affordability" className="text-blue-600 underline">
            Home Affordability Calculator
          </Link>
        </div>
      </section>
    </article>
  );
}

