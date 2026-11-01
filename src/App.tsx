import { Link, Route, Routes } from 'react-router-dom';
import MortgageCalculator from './components/MortgageCalculator';
import StatePage from './pages/StatePage';
import CountyPage from './pages/CountyPage';
import StateIndex from './pages/StateIndex';
import AffordabilityPage from './pages/AffordabilityPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import AboutPage from './pages/AboutPage';
import { usePageSeo } from './lib/seo';

// 홈 화면 컴포넌트 (홈 전용 SEO 메타태그 설정 포함)
function HomePage() {
  usePageSeo({
    title: 'Mortgage Payment Calculator 2026 - Property Tax, Insurance & PMI',
    description:
      'Free US mortgage payment calculator with accurate 50-state and 3,131-county effective property tax rates, home insurance, PMI, and amortization schedule.',
    path: '/',
  });

  return (
    <>
      <MortgageCalculator />
      <div className="mt-6 flex flex-wrap gap-4">
        <Link to="/mortgage" className="font-medium text-blue-600 underline">
          Browse mortgage calculators by state &rarr;
        </Link>
        <Link to="/affordability" className="font-medium text-blue-600 underline">
          How much house can I afford? &rarr;
        </Link>
      </div>
    </>
  );
}

// 앱의 바깥 틀(상단 헤더 + 본문 라우트 + 하단 푸터)입니다.
export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* 상단 네비게이션 헤더 */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <Link to="/" className="text-xl font-bold text-blue-600">
            MortgageSmart
          </Link>
          <nav className="flex flex-wrap gap-4 text-sm font-medium text-slate-700">
            <Link to="/" className="hover:text-blue-600">
              Mortgage Calculator
            </Link>
            <Link to="/mortgage" className="hover:text-blue-600">
              By State &amp; County
            </Link>
            <Link to="/affordability" className="hover:text-blue-600">
              Affordability
            </Link>
            <Link to="/about" className="hover:text-blue-600">
              About
            </Link>
          </nav>
        </div>
      </header>

      {/* 본문 영역 */}
      <main className="mx-auto w-full max-w-4xl flex-1 p-6">
        <Routes>
          {/* 홈: 기본 계산기 */}
          <Route path="/" element={<HomePage />} />
          {/* 주 선택 목록: /mortgage */}
          <Route path="/mortgage" element={<StateIndex />} />
          {/* 감당 가능한 집값 계산기: /affordability */}
          <Route path="/affordability" element={<AffordabilityPage />} />
          {/* 주별 페이지: /mortgage/texas */}
          <Route path="/mortgage/:state" element={<StatePage />} />
          {/* 카운티별 페이지: /mortgage/texas/harris-county */}
          <Route path="/mortgage/:state/:county" element={<CountyPage />} />
          {/* 사이트 소개 및 법적 고지 페이지 */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          {/* 그 외 모든 주소: 안내 화면 */}
          <Route
            path="*"
            element={
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Page not found</h1>
                <Link to="/" className="mt-4 inline-block text-blue-600 underline">
                  Back to calculator
                </Link>
              </div>
            }
          />
        </Routes>
      </main>

      {/* 하단 푸터 (면책 문구 + 법적 고지 링크 + 자매 사이트 링크) */}
      <footer className="mt-12 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-6 text-xs text-slate-500 space-y-3">
          <p>
            Disclaimer: For educational and informational purposes only. Estimates are not
            financial, legal, or lending advice. Actual mortgage rates and property taxes vary by
            lender and local jurisdiction.
          </p>
          <div className="flex flex-wrap justify-between gap-4">
            <span>&copy; {new Date().getFullYear()} MortgageSmart. All rights reserved.</span>
            <nav className="flex flex-wrap gap-4">
              <Link to="/about" className="underline hover:text-slate-800">
                About &amp; Methodology
              </Link>
              <Link to="/privacy" className="underline hover:text-slate-800">
                Privacy Policy
              </Link>
              <Link to="/terms" className="underline hover:text-slate-800">
                Terms &amp; Disclaimer
              </Link>
              <a
                href="https://paycheck.bangjang.net"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-slate-800"
              >
                US Paycheck Calculator
              </a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
