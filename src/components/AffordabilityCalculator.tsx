import { useMemo, useState } from 'react';
import { calculateAffordability } from '../lib/affordability';
import { STATES } from '../data/states';
import { findStateBySlug } from '../lib/states';
import AdSlot from './AdSlot';

// 금액을 $1,234 형태로 보여주는 함수
const usd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

// 숫자 입력칸 하나를 그리는 작은 컴포넌트
function Field(props: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{props.label}</span>
      <input
        type="number"
        min={0}
        step={props.step ?? 1}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
      />
      {props.hint && <span className="text-xs text-slate-500">{props.hint}</span>}
    </label>
  );
}

// 감당 가능한 집값 계산기 화면
// - initialTaxRatePct: 주 페이지 등에서 재산세율 초기값을 미리 채울 때 사용 (없으면 1.1%)
export default function AffordabilityCalculator(props: { initialTaxRatePct?: number }) {
  // 사용자가 입력하는 값들 (기본값은 예시)
  const [income, setIncome] = useState(100000);
  const [debt, setDebt] = useState(500);
  const [down, setDown] = useState(60000);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(30);
  const [taxRate, setTaxRate] = useState(props.initialTaxRatePct ?? 1.1);
  // 선택한 주의 slug ('' 이면 직접 입력 상태)
  const [stateSlug, setStateSlug] = useState('');

  // 주를 고르면 그 주의 재산세율을 자동으로 채웁니다.
  // 목록(51개)에 없는 값이면 무시하고 직접 입력 상태로 둡니다.
  const handleStateChange = (slug: string) => {
    const found = findStateBySlug(slug);
    if (found) {
      setStateSlug(found.slug);
      setTaxRate(found.propertyTaxRatePct);
    } else {
      setStateSlug('');
    }
  };

  // 재산세율을 직접 고치면 "직접 입력" 상태로 돌아갑니다.
  const handleTaxRateChange = (v: number) => {
    setStateSlug('');
    setTaxRate(v);
  };
  const [insurance, setInsurance] = useState(1800);
  const [pmiRate, setPmiRate] = useState(0.7);
  const [frontEnd, setFrontEnd] = useState(28);
  const [backEnd, setBackEnd] = useState(36);

  // 입력이 바뀔 때마다 자동으로 다시 계산
  const result = useMemo(
    () =>
      calculateAffordability({
        annualIncome: income,
        monthlyDebt: debt,
        downPayment: down,
        annualRatePct: rate,
        years,
        propertyTaxRatePct: taxRate,
        annualInsurance: insurance,
        pmiRatePct: pmiRate,
        frontEndPct: frontEnd,
        backEndPct: backEnd,
      }),
    [income, debt, down, rate, years, taxRate, insurance, pmiRate, frontEnd, backEnd]
  );

  const b = result.breakdown;
  const rows: [string, number][] = [
    ['Principal & Interest', b.principalAndInterest],
    ['Property Tax', b.propertyTax],
    ['Home Insurance', b.insurance],
    ['PMI', b.pmi],
  ];

  // 어느 기준이 한도를 정했는지 설명 문구
  const limitText =
    result.limitedBy === 'housing-ratio'
      ? `Your housing budget is capped by the ${frontEnd}% housing ratio.`
      : `Your housing budget is capped by the ${backEnd}% total debt ratio (after your ${usd(debt)}/mo in other debts).`;

  return (
    <>
      <h1 className="text-3xl font-bold text-slate-900">Home Affordability Calculator</h1>
      <p className="mt-2 text-slate-600">
        Find out how much house you can afford based on your income, debts and down payment.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="space-y-4 rounded-xl bg-white p-5 shadow">
          <Field
            label="Annual Income, before tax ($)"
            value={income}
            onChange={setIncome}
            step={1000}
          />
          <Field
            label="Monthly Debts ($)"
            value={debt}
            onChange={setDebt}
            step={50}
            hint="Car loans, student loans, credit card minimums. Do not include housing costs."
          />
          <Field label="Down Payment ($)" value={down} onChange={setDown} step={1000} />
          <Field label="Interest Rate (%)" value={rate} onChange={setRate} step={0.01} />
          <Field label="Loan Term (years)" value={years} onChange={setYears} />
          <label className="block">
            <span className="text-sm font-medium text-slate-700">State (fills in property tax rate)</span>
            <select
              value={stateSlug}
              onChange={(e) => handleStateChange(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="">Custom rate</option>
              {STATES.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name} ({s.propertyTaxRatePct.toFixed(2)}%)
                </option>
              ))}
            </select>
          </label>
          <Field
            label="Property Tax Rate (%/yr)"
            value={taxRate}
            onChange={handleTaxRateChange}
            step={0.01}
          />
          <Field label="Home Insurance ($/yr)" value={insurance} onChange={setInsurance} step={50} />
          <Field
            label="PMI Rate (%/yr, if down payment < 20%)"
            value={pmiRate}
            onChange={setPmiRate}
            step={0.05}
          />

          {/* 고급 설정: 은행 기준 비율 (기본 28/36) */}
          <details className="rounded-lg bg-slate-50 p-3">
            <summary className="cursor-pointer text-sm font-medium text-slate-700">
              Advanced: lender ratios
            </summary>
            <div className="mt-3 space-y-4">
              <Field label="Max housing ratio (%)" value={frontEnd} onChange={setFrontEnd} />
              <Field label="Max total debt ratio (%)" value={backEnd} onChange={setBackEnd} />
            </div>
          </details>
        </section>

        <section className="rounded-xl bg-slate-900 p-5 text-white shadow">
          <p className="text-sm text-slate-300">You can afford a home up to</p>
          <p className="mt-1 text-5xl font-bold">{usd(result.maxHomePrice)}</p>
          <p className="mt-1 text-sm text-slate-400">
            Monthly payment: {usd(b.totalMonthly)} (budget {usd(result.maxMonthlyHousing)})
          </p>
          <p className="mt-1 text-sm text-slate-400">Loan amount: {usd(b.loanAmount)}</p>
          <ul className="mt-6 space-y-2">
            {rows.map(([label, value]) => (
              <li key={label} className="flex justify-between border-b border-slate-700 pb-2">
                <span>{label}</span>
                <span>{usd(value)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-slate-300">{limitText}</p>
          {result.maxHomePrice === 0 && (
            <p className="mt-2 text-sm text-amber-300">
              Based on these inputs, your budget does not cover a monthly housing payment.
              Try raising income or lowering debts.
            </p>
          )}
        </section>
      </div>

      {/* 계산 결과 하단 반응형 애드센스 광고 슬롯 */}
      <AdSlot format="horizontal" />
    </>
  );
}
