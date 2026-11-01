// 상환 일정표(Amortization) 계산 로직
// 화면과 분리해 두면 테스트하기 쉽습니다.

// 한 달 치 상환 내역
export interface ScheduleRow {
  month: number;     // 회차 (1부터 시작)
  payment: number;   // 이번 달 총 납입액 (원금 + 이자)
  principal: number; // 이번 달 갚은 원금
  interest: number;  // 이번 달 낸 이자
  balance: number;   // 납입 후 남은 대출 잔액
}

export interface ScheduleResult {
  rows: ScheduleRow[];       // 월별 상세
  totalInterest: number;     // 총 이자
  totalMonths: number;       // 실제 상환에 걸린 개월 수
}

export interface ExtraPaymentEffect {
  base: ScheduleResult;      // 추가 상환 없을 때
  withExtra: ScheduleResult; // 추가 상환 있을 때
  interestSaved: number;     // 절감되는 이자
  monthsSaved: number;       // 단축되는 개월 수
}

// 보안/안정성을 위한 상한값 (비정상적으로 큰 입력으로 브라우저가 멈추는 것을 방지)
const MAX_YEARS = 50;
const MAX_MONTHS = MAX_YEARS * 12;

export function buildSchedule(
  loanAmount: number,
  annualRatePct: number,
  years: number,
  extraMonthly = 0
): ScheduleResult {
  // 입력값 보정: 음수, NaN 방지 + 기간 상한
  const loan = Number.isFinite(loanAmount) ? Math.max(0, loanAmount) : 0;
  const rate = Number.isFinite(annualRatePct) ? Math.max(0, annualRatePct) : 0;
  const extra = Number.isFinite(extraMonthly) ? Math.max(0, extraMonthly) : 0;
  const n = Math.min(MAX_MONTHS, Math.max(1, Math.round((Number.isFinite(years) ? years : 0) * 12)));
  const r = rate / 100 / 12; // 월 이율

  if (loan === 0) return { rows: [], totalInterest: 0, totalMonths: 0 };

  // 월 원리금 공식: M = P * r(1+r)^n / ((1+r)^n - 1), 이자율 0%이면 단순 나눗셈
  const basePayment =
    r === 0 ? loan / n : (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

  const rows: ScheduleRow[] = [];
  let balance = loan;
  let totalInterest = 0;

  // 잔액이 0이 될 때까지 반복 (추가 상환이 있으면 n보다 일찍 끝남)
  for (let month = 1; month <= n && balance > 0.005; month++) {
    const interest = balance * r;
    // 이번 달 낼 원금 = (기본 납입액 - 이자) + 추가 상환액
    let principal = basePayment - interest + extra;
    // 마지막 달은 남은 잔액만큼만 갚도록 보정 (잔액이 음수가 되는 것 방지)
    if (principal > balance || month === n) principal = balance;

    balance = Math.max(0, balance - principal);
    totalInterest += interest;
    rows.push({ month, payment: principal + interest, principal, interest, balance });
  }

  return { rows, totalInterest, totalMonths: rows.length };
}

// 추가 상환이 있을 때와 없을 때를 비교
export function compareExtraPayment(
  loanAmount: number,
  annualRatePct: number,
  years: number,
  extraMonthly: number
): ExtraPaymentEffect {
  const base = buildSchedule(loanAmount, annualRatePct, years, 0);
  const withExtra = buildSchedule(loanAmount, annualRatePct, years, extraMonthly);
  return {
    base,
    withExtra,
    interestSaved: base.totalInterest - withExtra.totalInterest,
    monthsSaved: base.totalMonths - withExtra.totalMonths,
  };
}

// 월별 상세를 연도별로 묶어서 요약 (표시용)
export interface YearSummary {
  year: number;      // 1년차, 2년차 ...
  principal: number; // 그 해에 갚은 원금 합계
  interest: number;  // 그 해에 낸 이자 합계
  endBalance: number;// 그 해 말 잔액
}

export function summarizeByYear(rows: ScheduleRow[]): YearSummary[] {
  const map = new Map<number, YearSummary>();
  for (const row of rows) {
    const year = Math.ceil(row.month / 12);
    const cur = map.get(year) ?? { year, principal: 0, interest: 0, endBalance: 0 };
    cur.principal += row.principal;
    cur.interest += row.interest;
    cur.endBalance = row.balance;
    map.set(year, cur);
  }
  return Array.from(map.values());
}

