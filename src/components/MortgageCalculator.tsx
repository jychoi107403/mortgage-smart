import { useMemo, useState } from 'react';
import { calculateMortgage } from '../lib/mortgage';
import AmortizationTable from './AmortizationTable';
import AdSlot from './AdSlot';

// 금액을 $1,234 형태로 보여주는 함수
const usd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

// 숫자 입력칸 하나를 그리는 작은 컴포넌트
function Field(props: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
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
    </label>
  );
}

// 모기지 계산기 화면
// - initialTaxRatePct: 주 페이지에서 그 주의 재산세율을 미리 채워 넣을 때 사용 (없으면 기본 1.1%)
// - title / description: 페이지마다 제목과 설명을 바꿀 때 사용
export default function MortgageCalculator(props: {
  initialTaxRatePct?: number;
  title?: string;
  description?: string;
}) {
  // 사용자가 입력하는 값들 (기본값은 예시)
  const [homePrice, setHomePrice] = useState(400000);
  const [downPayment, setDownPayment] = useState(80000);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(30);
  const [taxRate, setTaxRate] = useState(props.initialTaxRatePct ?? 1.1);
  const [insurance, setInsurance] = useState(1800);
  const [pmiRate, setPmiRate] = useState(0.7);

  // 입력이 바뀔 때마다 자동으로 다시 계산
  const result = useMemo(
    () =>
      calculateMortgage({
        homePrice,
        downPayment,
        annualRatePct: rate,
        years,
        propertyTaxRatePct: taxRate,
        annualInsurance: insurance,
        pmiRatePct: pmiRate,
      }),
    [homePrice, downPayment, rate, years, taxRate, insurance, pmiRate]
  );

  const rows: [string, number][] = [
    ['Principal & Interest', result.principalAndInterest],
    ['Property Tax', result.propertyTax],
    ['Home Insurance', result.insurance],
    ['PMI', result.pmi],
  ];

  return (
    <>
      <h1 className="text-3xl font-bold text-slate-900">
        {props.title ?? 'Mortgage Payment Calculator'}
      </h1>
      <p className="mt-2 text-slate-600">
        {props.description ??
          'See your true monthly payment including property tax, insurance and PMI.'}
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="space-y-4 rounded-xl bg-white p-5 shadow">
          <Field label="Home Price ($)" value={homePrice} onChange={setHomePrice} step={1000} />
          <Field label="Down Payment ($)" value={downPayment} onChange={setDownPayment} step={1000} />
          <Field label="Interest Rate (%)" value={rate} onChange={setRate} step={0.01} />
          <Field label="Loan Term (years)" value={years} onChange={setYears} />
          <Field label="Property Tax Rate (%/yr)" value={taxRate} onChange={setTaxRate} step={0.01} />
          <Field label="Home Insurance ($/yr)" value={insurance} onChange={setInsurance} step={50} />
          <Field label="PMI Rate (%/yr, if down payment < 20%)" value={pmiRate} onChange={setPmiRate} step={0.05} />
        </section>

        <section className="rounded-xl bg-slate-900 p-5 text-white shadow">
          <p className="text-sm text-slate-300">Estimated monthly payment</p>
          <p className="mt-1 text-5xl font-bold">{usd(result.totalMonthly)}</p>
          <p className="mt-1 text-sm text-slate-400">Loan amount: {usd(result.loanAmount)}</p>
          <ul className="mt-6 space-y-2">
            {rows.map(([label, value]) => (
              <li key={label} className="flex justify-between border-b border-slate-700 pb-2">
                <span>{label}</span>
                <span>{usd(value)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* 계산 결과 카드와 상환 일정표 사이의 반응형 애드센스 광고 슬롯 */}
      <AdSlot format="horizontal" />

      <AmortizationTable loanAmount={result.loanAmount} annualRatePct={rate} years={years} />
    </>
  );
}
