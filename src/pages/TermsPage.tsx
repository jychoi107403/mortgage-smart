import { usePageSeo } from '../lib/seo';
import { PROPERTY_TAX_SOURCE } from '../data/states';

// /terms 주소에 보여줄 이용약관 및 재무 면책조항 페이지
export default function TermsPage() {
  usePageSeo({
    title: 'Terms of Use & Financial Disclaimer | MortgageSmart',
    description:
      'Terms of Use and Financial Disclaimer for MortgageSmart. All mortgage and property tax estimates are for educational purposes only.',
    path: '/terms',
  });

  return (
    <article className="space-y-6 rounded-xl bg-white p-6 shadow">
      <h1 className="text-3xl font-bold text-slate-900">Terms of Use &amp; Financial Disclaimer</h1>
      <p className="text-sm text-slate-500">Last updated: November 1, 2026</p>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">
          1. Educational Purposes Only (Not Financial Advice)
        </h2>
        <p className="text-slate-700">
          The calculators, amortization schedules, affordability estimates, and property tax figures
          provided on MortgageSmart are strictly for informational and educational purposes. Nothing
          on this website constitutes financial, legal, tax, or mortgage lending advice.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">
          2. Accuracy of Property Tax &amp; Mortgage Estimates
        </h2>
        <p className="text-slate-700">
          State and county effective property tax rates are derived from {PROPERTY_TAX_SOURCE}.
          Actual property tax bills depend on local millage rates, school districts, municipal
          levies, homestead exemptions, and official property assessments. Always consult a licensed
          mortgage lender, tax professional, or your local county assessor before making financial
          decisions.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">3. No Warranty &amp; Limitation of Liability</h2>
        <p className="text-slate-700">
          MortgageSmart provides all tools &ldquo;as is&rdquo; without warranties of any kind. By
          using this site, you agree that MortgageSmart shall not be held liable for any decisions,
          losses, or damages arising from the use of our calculators or data.
        </p>
      </section>
    </article>
  );
}

