import { useMemo, useState } from 'react';
import { compareExtraPayment, summarizeByYear } from '../lib/amortization';

// 금액을 $1,234 형태로 보여주는 함수
const usd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

// 개월 수를 "N years M months" 형태로 바꿔주는 함수
const formatMonths = (m: number) => {
  const y = Math.floor(m / 12);
  const mo = m % 12;
  return `${y} yr${y === 1 ? '' : 's'}${mo ? ` ${mo} mo` : ''}`;
};

// 잔액 감소 차트 (라이브러리 없이 SVG로 직접 그림)
// base: 추가 상환 없을 때 잔액 목록, extra: 있을 때 잔액 목록
function BalanceChart(props: { base: number[]; extra: number[]; loan: number }) {
  const W = 600;
  const H = 200;
  const maxLen = Math.max(props.base.length, 1);

  // 잔액 목록을 SVG 좌표(x,y) 문자열로 변환 (시작점은 전체 대출금)
  const toPoints = (balances: number[]) =>
    [props.loan, ...balances]
      .map((b, i) => {
        const x = (i / maxLen) * W;
        const y = H - (props.loan > 0 ? (b / props.loan) * H : 0);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="mt-4 w-full rounded-lg bg-slate-50"
      role="img"
      aria-label="Loan balance over time"
    >
      <polyline points={toPoints(props.base)} fill="none" stroke="#94a3b8" strokeWidth="2" />
      <polyline points={toPoints(props.extra)} fill="none" stroke="#2563eb" strokeWidth="2" />
    </svg>
  );
}

export default function AmortizationTable(props: {
  loanAmount: number;
  annualRatePct: number;
  years: number;
}) {
  const [extra, setExtra] = useState(0);       // 매달 추가 상환액
  const [showMonthly, setShowMonthly] = useState(false); // 월별 상세 표 펼침 여부

  // 입력이 바뀔 때만 다시 계산
  const effect = useMemo(
    () => compareExtraPayment(props.loanAmount, props.annualRatePct, props.years, extra),
    [props.loanAmount, props.annualRatePct, props.years, extra]
  );
  const yearRows = useMemo(() => summarizeByYear(effect.withExtra.rows), [effect]);

  if (effect.withExtra.rows.length === 0) return null;

  return (
    <section className="mt-8 rounded-xl bg-white p-5 shadow">
      <h2 className="text-2xl font-bold text-slate-900">Amortization Schedule</h2>

      <label className="mt-4 block max-w-xs">
        <span className="text-sm font-medium text-slate-700">Extra monthly payment ($)</span>
        <input
          type="number"
          min={0}
          step={50}
          value={extra}
          onChange={(e) => setExtra(Math.max(0, Number(e.target.value) || 0))}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </label>

      {/* 요약 카드 3개 */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-slate-100 p-3">
          <p className="text-xs text-slate-500">Total interest</p>
          <p className="text-xl font-bold">{usd(effect.withExtra.totalInterest)}</p>
        </div>
        <div className="rounded-lg bg-slate-100 p-3">
          <p className="text-xs text-slate-500">Paid off in</p>
          <p className="text-xl font-bold">{formatMonths(effect.withExtra.totalMonths)}</p>
        </div>
        <div className="rounded-lg bg-green-100 p-3">
          <p className="text-xs text-slate-500">Interest saved</p>
          <p className="text-xl font-bold text-green-700">{usd(effect.interestSaved)}</p>
          {effect.monthsSaved > 0 && (
            <p className="text-xs text-green-700">{formatMonths(effect.monthsSaved)} sooner</p>
          )}
        </div>
      </div>

      <BalanceChart
        base={effect.base.rows.map((r) => r.balance)}
        extra={effect.withExtra.rows.map((r) => r.balance)}
        loan={props.loanAmount}
      />
      <p className="mt-1 text-xs text-slate-500">
        Gray: standard schedule · Blue: with extra payments
      </p>

      {/* 연도별 요약 표 */}
      <div className="mt-4 max-h-96 overflow-auto">
        <table className="w-full text-right text-sm">
          <thead className="sticky top-0 bg-white text-slate-500">
            <tr>
              <th className="py-2 text-left">Year</th>
              <th>Principal</th>
              <th>Interest</th>
              <th>Ending balance</th>
            </tr>
          </thead>
          <tbody>
            {yearRows.map((y) => (
              <tr key={y.year} className="border-t border-slate-100">
                <td className="py-1 text-left">{y.year}</td>
                <td>{usd(y.principal)}</td>
                <td>{usd(y.interest)}</td>
                <td>{usd(y.endBalance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 월별 상세 표 (접었다 펼치기) */}
      <button
        onClick={() => setShowMonthly(!showMonthly)}
        className="mt-4 text-sm font-medium text-blue-600 underline"
      >
        {showMonthly ? 'Hide monthly details' : 'Show monthly details'}
      </button>
      {showMonthly && (
        <div className="mt-2 max-h-96 overflow-auto">
          <table className="w-full text-right text-sm">
            <thead className="sticky top-0 bg-white text-slate-500">
              <tr>
                <th className="py-2 text-left">Month</th>
                <th>Payment</th>
                <th>Principal</th>
                <th>Interest</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {effect.withExtra.rows.map((r) => (
                <tr key={r.month} className="border-t border-slate-100">
                  <td className="py-1 text-left">{r.month}</td>
                  <td>{usd(r.payment)}</td>
                  <td>{usd(r.principal)}</td>
                  <td>{usd(r.interest)}</td>
                  <td>{usd(r.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

