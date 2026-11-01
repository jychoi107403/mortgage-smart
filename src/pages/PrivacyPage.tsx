import { Link } from 'react-router-dom';
import { usePageSeo } from '../lib/seo';

// /privacy 주소에 보여줄 개인정보처리방침 페이지 (구글 애드센스 필수 요건)
export default function PrivacyPage() {
  usePageSeo({
    title: 'Privacy Policy | MortgageSmart',
    description:
      'Privacy Policy for MortgageSmart. Learn how we protect your privacy, handle browser-only mortgage calculations, and use cookies.',
    path: '/privacy',
  });

  return (
    <article className="space-y-6 rounded-xl bg-white p-6 shadow">
      <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
      <p className="text-sm text-slate-500">Last updated: November 1, 2026</p>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">
          1. 100% Browser-Based Calculations (No Financial Data Stored)
        </h2>
        <p className="text-slate-700">
          MortgageSmart is designed with privacy first. All numbers you enter into our calculators
          (such as home price, down payment, income, debts, and interest rates) are processed
          entirely inside your web browser. We do not transmit, store, or log your financial inputs
          on any server or database.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">
          2. Cookies and Third-Party Advertising (Google AdSense)
        </h2>
        <p className="text-slate-700">
          We use third-party advertising companies, including Google AdSense, to serve ads when you
          visit our website. Google and its partners use cookies (such as the DoubleClick DART
          cookie) to serve ads based on your visit to this site and/or other sites on the Internet.
        </p>
        <p className="text-slate-700">
          You may opt out of personalized advertising by visiting{' '}
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Google Ads Settings
          </a>{' '}
          or{' '}
          <a
            href="https://www.aboutads.info/choices/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            www.aboutads.info
          </a>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">3. Standard Log Files</h2>
        <p className="text-slate-700">
          Like most websites hosted on content delivery networks (Cloudflare Pages), standard
          non-identifying technical information such as browser type, referring page, and date/time
          stamp may be processed automatically for security and performance purposes.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">4. Related Services</h2>
        <p className="text-slate-700">
          For further information about our terms and educational disclaimer, please review our{' '}
          <Link to="/terms" className="text-blue-600 underline">
            Terms of Use &amp; Disclaimer
          </Link>
          .
        </p>
      </section>
    </article>
  );
}

