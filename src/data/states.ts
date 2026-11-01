// =========================================================================
// 50개 주 + 워싱턴 DC 실효 재산세율 데이터
//
// 출처: Tax Foundation, "Property Taxes by State and County, 2026" (2026-03-16 발행)
//       https://taxfoundation.org/data/all/state/property-taxes-by-state-county/
// 원자료: US Census Bureau, 2024 American Community Survey (B25082, B25090)
//
// 실효 재산세율 = 주택 소유자가 실제로 낸 재산세 / 주택 가치 (거주용 주택 기준, 2024년)
// 주의: 같은 주 안에서도 카운티마다 세율 차이가 크므로 "주 평균 추정치"입니다.
// =========================================================================

export interface StateData {
  slug: string;               // URL에 쓰는 이름 (예: "texas") - 소문자와 하이픈만 사용
  name: string;               // 표시 이름 (예: "Texas")
  abbr: string;               // 주 약어 (예: "TX")
  propertyTaxRatePct: number; // 실효 재산세율 (%) - 집값 대비 연간 세금 비율
}

// 데이터 기준 연도와 출처 (페이지 하단 문구에서 재사용)
export const PROPERTY_TAX_DATA_YEAR = 2024;
export const PROPERTY_TAX_SOURCE = 'Tax Foundation (US Census Bureau, 2024 American Community Survey)';

// 알파벳 순으로 정렬 (화면 목록에 그대로 사용)
export const STATES: StateData[] = [
  { slug: 'alabama', name: 'Alabama', abbr: 'AL', propertyTaxRatePct: 0.37 },
  { slug: 'alaska', name: 'Alaska', abbr: 'AK', propertyTaxRatePct: 0.94 },
  { slug: 'arizona', name: 'Arizona', abbr: 'AZ', propertyTaxRatePct: 0.48 },
  { slug: 'arkansas', name: 'Arkansas', abbr: 'AR', propertyTaxRatePct: 0.56 },
  { slug: 'california', name: 'California', abbr: 'CA', propertyTaxRatePct: 0.7 },
  { slug: 'colorado', name: 'Colorado', abbr: 'CO', propertyTaxRatePct: 0.5 },
  { slug: 'connecticut', name: 'Connecticut', abbr: 'CT', propertyTaxRatePct: 1.54 },
  { slug: 'delaware', name: 'Delaware', abbr: 'DE', propertyTaxRatePct: 0.54 },
  { slug: 'district-of-columbia', name: 'District of Columbia', abbr: 'DC', propertyTaxRatePct: 0.6 },
  { slug: 'florida', name: 'Florida', abbr: 'FL', propertyTaxRatePct: 0.78 },
  { slug: 'georgia', name: 'Georgia', abbr: 'GA', propertyTaxRatePct: 0.79 },
  { slug: 'hawaii', name: 'Hawaii', abbr: 'HI', propertyTaxRatePct: 0.29 },
  { slug: 'idaho', name: 'Idaho', abbr: 'ID', propertyTaxRatePct: 0.5 },
  { slug: 'illinois', name: 'Illinois', abbr: 'IL', propertyTaxRatePct: 1.88 },
  { slug: 'indiana', name: 'Indiana', abbr: 'IN', propertyTaxRatePct: 0.76 },
  { slug: 'iowa', name: 'Iowa', abbr: 'IA', propertyTaxRatePct: 1.33 },
  { slug: 'kansas', name: 'Kansas', abbr: 'KS', propertyTaxRatePct: 1.21 },
  { slug: 'kentucky', name: 'Kentucky', abbr: 'KY', propertyTaxRatePct: 0.74 },
  { slug: 'louisiana', name: 'Louisiana', abbr: 'LA', propertyTaxRatePct: 0.55 },
  { slug: 'maine', name: 'Maine', abbr: 'ME', propertyTaxRatePct: 0.98 },
  { slug: 'maryland', name: 'Maryland', abbr: 'MD', propertyTaxRatePct: 0.92 },
  { slug: 'massachusetts', name: 'Massachusetts', abbr: 'MA', propertyTaxRatePct: 1.0 },
  { slug: 'michigan', name: 'Michigan', abbr: 'MI', propertyTaxRatePct: 1.19 },
  { slug: 'minnesota', name: 'Minnesota', abbr: 'MN', propertyTaxRatePct: 1.0 },
  { slug: 'mississippi', name: 'Mississippi', abbr: 'MS', propertyTaxRatePct: 0.58 },
  { slug: 'missouri', name: 'Missouri', abbr: 'MO', propertyTaxRatePct: 0.89 },
  { slug: 'montana', name: 'Montana', abbr: 'MT', propertyTaxRatePct: 0.61 },
  { slug: 'nebraska', name: 'Nebraska', abbr: 'NE', propertyTaxRatePct: 1.44 },
  { slug: 'nevada', name: 'Nevada', abbr: 'NV', propertyTaxRatePct: 0.5 },
  { slug: 'new-hampshire', name: 'New Hampshire', abbr: 'NH', propertyTaxRatePct: 1.5 },
  { slug: 'new-jersey', name: 'New Jersey', abbr: 'NJ', propertyTaxRatePct: 1.88 },
  { slug: 'new-mexico', name: 'New Mexico', abbr: 'NM', propertyTaxRatePct: 0.63 },
  { slug: 'new-york', name: 'New York', abbr: 'NY', propertyTaxRatePct: 1.3 },
  { slug: 'north-carolina', name: 'North Carolina', abbr: 'NC', propertyTaxRatePct: 0.66 },
  { slug: 'north-dakota', name: 'North Dakota', abbr: 'ND', propertyTaxRatePct: 0.92 },
  { slug: 'ohio', name: 'Ohio', abbr: 'OH', propertyTaxRatePct: 1.36 },
  { slug: 'oklahoma', name: 'Oklahoma', abbr: 'OK', propertyTaxRatePct: 0.79 },
  { slug: 'oregon', name: 'Oregon', abbr: 'OR', propertyTaxRatePct: 0.81 },
  { slug: 'pennsylvania', name: 'Pennsylvania', abbr: 'PA', propertyTaxRatePct: 1.26 },
  { slug: 'rhode-island', name: 'Rhode Island', abbr: 'RI', propertyTaxRatePct: 1.12 },
  { slug: 'south-carolina', name: 'South Carolina', abbr: 'SC', propertyTaxRatePct: 0.49 },
  { slug: 'south-dakota', name: 'South Dakota', abbr: 'SD', propertyTaxRatePct: 1.0 },
  { slug: 'tennessee', name: 'Tennessee', abbr: 'TN', propertyTaxRatePct: 0.52 },
  { slug: 'texas', name: 'Texas', abbr: 'TX', propertyTaxRatePct: 1.4 },
  { slug: 'utah', name: 'Utah', abbr: 'UT', propertyTaxRatePct: 0.48 },
  { slug: 'vermont', name: 'Vermont', abbr: 'VT', propertyTaxRatePct: 1.51 },
  { slug: 'virginia', name: 'Virginia', abbr: 'VA', propertyTaxRatePct: 0.78 },
  { slug: 'washington', name: 'Washington', abbr: 'WA', propertyTaxRatePct: 0.75 },
  { slug: 'west-virginia', name: 'West Virginia', abbr: 'WV', propertyTaxRatePct: 0.51 },
  { slug: 'wisconsin', name: 'Wisconsin', abbr: 'WI', propertyTaxRatePct: 1.32 },
  { slug: 'wyoming', name: 'Wyoming', abbr: 'WY', propertyTaxRatePct: 0.53 },
];

