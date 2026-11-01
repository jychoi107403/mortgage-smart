import { Link, Route, Routes } from 'react-router-dom';
import MortgageCalculator from './components/MortgageCalculator';
import StatePage from './pages/StatePage';
import CountyPage from './pages/CountyPage';
import StateIndex from './pages/StateIndex';
import AffordabilityPage from './pages/AffordabilityPage';

// 앱의 바깥 틀(레이아웃)과 주소별 화면 연결표입니다.
export default function App() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <Routes>
        {/* 홈: 기본 계산기 */}
        <Route
          path="/"
          element={
            <>
              <MortgageCalculator />
              <p className="mt-6">
                <Link to="/mortgage" className="font-medium text-blue-600 underline">
                  Browse mortgage calculators by state &rarr;
                </Link>
              </p>
              <p className="mt-2">
                <Link to="/affordability" className="font-medium text-blue-600 underline">
                  How much house can I afford? &rarr;
                </Link>
              </p>
            </>
          }
        />
        {/* 주 선택 목록: /mortgage */}
        <Route path="/mortgage" element={<StateIndex />} />
        {/* 감당 가능한 집값 계산기: /affordability */}
        <Route path="/affordability" element={<AffordabilityPage />} />
        {/* 주별 페이지: /mortgage/texas */}
        <Route path="/mortgage/:state" element={<StatePage />} />
        {/* 카운티별 페이지: /mortgage/texas/harris-county */}
        <Route path="/mortgage/:state/:county" element={<CountyPage />} />
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

      <p className="mt-8 text-xs text-slate-500">
        For educational purposes only. Estimates are not financial advice.
      </p>
    </main>
  );
}
