// 감당 가능한 집값(Home Affordability) 계산 로직
// 28/36 규칙: 월 소득의 28% 이내가 주거비, 월 소득의 36% 이내가 (주거비 + 기존 부채)
// 기존 calculateMortgage를 그대로 재사용하므로 계산 규칙이 한 곳에만 있습니다.

import { calculateMortgage, type MortgageResult } from './mortgage';

export interface AffordabilityInput {
  annualIncome: number;       // 세전 연소득 ($)
  monthlyDebt: number;        // 월 부채 합계 ($) - 카드, 자동차 할부, 학자금 등 (주택 비용 제외)
  downPayment: number;        // 계약금 ($, 고정 금액)
  annualRatePct: number;      // 연 이자율 (%)
  years: number;              // 대출 기간 (년)
  propertyTaxRatePct: number; // 연 재산세율 (%)
  annualInsurance: number;    // 연 주택보험료 ($)
  pmiRatePct: number;         // PMI 연 비율 (%)
  frontEndPct?: number;       // 주거비 비율 한도 (%), 기본 28
  backEndPct?: number;        // 총부채 비율 한도 (%), 기본 36
}

export type LimitedBy = 'housing-ratio' | 'debt-ratio';

export interface AffordabilityResult {
  maxHomePrice: number;          // 살 수 있는 최대 집값 ($, 1달러 단위 내림)
  maxMonthlyHousing: number;     // 월 주거비 한도 ($)
  limitedBy: LimitedBy;          // 어느 기준이 한도를 정했는지
  breakdown: MortgageResult;     // 그 집값일 때의 월 납입액 내역
}

// 보안/안정성: 이진 탐색 반복 횟수는 고정 (무한 루프 방지)
const ITERATIONS = 40;
// 비정상적으로 큰 입력 방지 상한
const MAX_AMOUNT = 1_000_000_000;

// 숫자를 0 이상 상한 이하로 보정 (NaN, Infinity, 음수 방지)
const clamp = (v: number | undefined, fallback: number, max = MAX_AMOUNT): number => {
  if (typeof v !== 'number' || !Number.isFinite(v)) return fallback;
  return Math.min(Math.max(0, v), max);
};

export function calculateAffordability(input: AffordabilityInput): AffordabilityResult {
  const annualIncome = clamp(input.annualIncome, 0);
  const monthlyDebt = clamp(input.monthlyDebt, 0);
  const downPayment = clamp(input.downPayment, 0);
  const frontEnd = clamp(input.frontEndPct, 28, 100);
  const backEnd = clamp(input.backEndPct, 36, 100);

  const monthlyIncome = annualIncome / 12;

  // 한도 두 가지 계산 후 작은 쪽을 적용 (같으면 housing-ratio로 표시)
  const housingLimit = (monthlyIncome * frontEnd) / 100;
  const debtLimit = Math.max(0, (monthlyIncome * backEnd) / 100 - monthlyDebt);
  const limitedBy: LimitedBy = housingLimit <= debtLimit ? 'housing-ratio' : 'debt-ratio';
  const maxMonthlyHousing = Math.min(housingLimit, debtLimit);

  // 집값을 넣으면 월 납입액을 돌려주는 함수 (기존 계산기 재사용)
  const paymentFor = (homePrice: number): MortgageResult =>
    calculateMortgage({
      homePrice,
      downPayment,
      annualRatePct: input.annualRatePct,
      years: input.years,
      propertyTaxRatePct: input.propertyTaxRatePct,
      annualInsurance: input.annualInsurance,
      pmiRatePct: input.pmiRatePct,
    });

  // 이진 탐색 범위: 0 ~ (연소득의 20배 + 계약금)
  let low = 0;
  let high = annualIncome * 20 + downPayment;

  if (paymentFor(high).totalMonthly <= maxMonthlyHousing) {
    // 상한에서도 한도 이내이면 상한이 답 (예: 이자율 0% 등 특수한 경우)
    low = high;
  } else {
    for (let i = 0; i < ITERATIONS; i++) {
      const mid = (low + high) / 2;
      if (paymentFor(mid).totalMonthly <= maxMonthlyHousing) low = mid;
      else high = mid;
    }
  }

  // 1달러 단위로 내림 (내림하면 월 납입액은 항상 한도 이내)
  const maxHomePrice = Math.floor(low);

  // 월 주거비 한도 자체를 못 맞추면(보험료만으로 초과 등) 집값 0
  const fits = paymentFor(maxHomePrice).totalMonthly <= maxMonthlyHousing;
  const finalPrice = fits ? maxHomePrice : 0;

  return {
    maxHomePrice: finalPrice,
    maxMonthlyHousing,
    limitedBy,
    breakdown: paymentFor(finalPrice),
  };
}

