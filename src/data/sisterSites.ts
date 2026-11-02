// =========================================================================
// Smart Finance Network (7개 자매 사이트 통합 네트워크 목록)
// =========================================================================

export interface SisterSiteItem {
  id: string;
  rankLabel: string;
  brandName: string;
  shortTitle: string;
  fullTitle: string;
  url: string;
  badgeIcon: string;
  description: string;
}

export const SISTER_SITES: SisterSiteItem[] = [
  {
    id: 'mortgage-smart',
    rankLabel: 'Core 1',
    brandName: 'MortgageSmart',
    shortTitle: 'Mortgage & Property Tax',
    fullTitle: 'US Mortgage & County Property Tax Calculator',
    url: 'https://mortgage.bangjang.net',
    badgeIcon: '🏠',
    description: '50-state & 3,131-county mortgage payment, PMI, and property tax calculator.',
  },
  {
    id: 'paycheck-smart',
    rankLabel: 'Core 2',
    brandName: 'PaycheckSmart',
    shortTitle: 'US Paycheck & W-2 Tax',
    fullTitle: 'US Take-Home Paycheck & Federal/State Tax Calculator',
    url: 'https://paycheck.bangjang.net',
    badgeIcon: '💵',
    description: 'Instant W-2 salary, hourly paycheck, and state income tax estimator.',
  },
  {
    id: 'auto-loan-smart',
    rankLabel: 'Rank #1',
    brandName: 'AutoLoanSmart',
    shortTitle: 'Auto Loan & OTD Price',
    fullTitle: 'US Auto Loan & Out-the-Door (OTD) Car Price Calculator',
    url: 'https://autoloan.bangjang.net',
    badgeIcon: '🚗',
    description: 'State auto sales tax, trade-in tax credit, DMV fees, and monthly car loan calculator.',
  },
  {
    id: 'tax-1099-smart',
    rankLabel: 'Rank #2',
    brandName: 'Tax1099Smart',
    shortTitle: '1099 Self-Employment Tax',
    fullTitle: 'US 1099 Freelancer & Quarterly Estimated Tax Calculator',
    url: 'https://1099tax.bangjang.net',
    badgeIcon: '💼',
    description: '15.3% self-employment tax, QBI deduction, write-offs, and IRS quarterly tax calculator.',
  },
  {
    id: 'retire-401k-smart',
    rankLabel: 'Rank #3',
    brandName: 'Retire401kSmart',
    shortTitle: '401(k) & Early Withdrawal',
    fullTitle: 'US 401(k) Retirement & Early Withdrawal Penalty Calculator',
    url: 'https://401k.bangjang.net',
    badgeIcon: '🏦',
    description: 'Calculate 401(k) cash-out penalties, federal/state tax withholding, and retirement growth.',
  },
  {
    id: 'heloc-tax-smart',
    rankLabel: 'Rank #4',
    brandName: 'HelocTaxSmart',
    shortTitle: 'HELOC & Property Tax Appeal',
    fullTitle: 'US HELOC Borrowing Limit & Property Tax Appeal Calculator',
    url: 'https://heloc.bangjang.net',
    badgeIcon: '🔑',
    description: 'Home equity line of credit (CLTV) calculator and property assessment appeal savings tool.',
  },
  {
    id: 'rental-roi-smart',
    rankLabel: 'Rank #5',
    brandName: 'RentalRoiSmart',
    shortTitle: 'Rental ROI & DSCR Loan',
    fullTitle: 'US Rental Property Cash Flow, Cap Rate & DSCR Calculator',
    url: 'https://rentalroi.bangjang.net',
    badgeIcon: '🏢',
    description: 'Real estate investment cash-on-cash return, cap rate, and DSCR loan qualification calculator.',
  },
];

