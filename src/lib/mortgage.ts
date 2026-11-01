// 모기지 계산 로직 (화면과 분리해서 테스트하기 쉽게 만듭니다)

export interface MortgageInput {
  homePrice: number;        // 집값 ($)
  downPayment: number;      // 계약금 ($)
  annualRatePct: number;    // 연 이자율 (%) 예: 6.5
  years: number;            // 대출 기간 (년)
  propertyTaxRatePct: number; // 연 재산세율 (집값 대비 %) 예: 1.1
  annualInsurance: number;  // 연 주택보험료 ($)
  pmiRatePct: number;       // PMI 연 비율 (대출금 대비 %) 예: 0.7
}

export interface MortgageResult {
  loanAmount: number;
  principalAndInterest: number; // 월 원리금
  propertyTax: number;          // 월 재산세
  insurance: number;            // 월 보험료
  pmi: number;                  // 월 PMI (계약금 20% 미만일 때만)
  totalMonthly: number;         // 월 총 납입액
}

export function calculateMortgage(input: MortgageInput): MortgageResult {
  // 입력값이 이상할 때(음수 등)를 대비해 0 이상으로 보정합니다.
  const homePrice = Math.max(0, input.homePrice);
  const downPayment = Math.min(Math.max(0, input.downPayment), homePrice);
  const loanAmount = homePrice - downPayment;

  const n = Math.max(1, Math.round(input.years * 12)); // 총 개월 수
  const r = Math.max(0, input.annualRatePct) / 100 / 12; // 월 이율

  // 월 원리금: M = P * r(1+r)^n / ((1+r)^n - 1), 이자율 0%이면 단순 나눗셈
  const principalAndInterest =
    loanAmount === 0
      ? 0
      : r === 0
      ? loanAmount / n
      : (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

  const propertyTax = (homePrice * (Math.max(0, input.propertyTaxRatePct) / 100)) / 12;
  const insurance = Math.max(0, input.annualInsurance) / 12;

  // 계약금이 집값의 20% 미만이면 PMI 부과
  const needsPmi = homePrice > 0 && downPayment / homePrice < 0.2;
  const pmi = needsPmi ? (loanAmount * (Math.max(0, input.pmiRatePct) / 100)) / 12 : 0;

  return {
    loanAmount,
    principalAndInterest,
    propertyTax,
    insurance,
    pmi,
    totalMonthly: principalAndInterest + propertyTax + insurance + pmi,
  };
}

