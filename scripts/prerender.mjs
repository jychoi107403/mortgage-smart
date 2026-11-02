// =========================================================================
// 3,188개 전체 페이지 정적 HTML 사전 생성(Pre-rendering / SSG) 스크립트
//
// 목적:
// - 구글/빙/AI 검색 로봇이 자바스크립트를 실행하지 않아도 접속 즉시(0.01초)
//   각 주·카운티 페이지의 고유 <title>, <meta description>, <link canonical>,
//   FAQPage JSON-LD 스키마, 본문 요약 텍스트를 100% 읽어가도록 정적 HTML을 생성합니다.
//
// 실행 시점: `vite build` 직후 (`dist/index.html`을 템플릿으로 사용)
// =========================================================================

import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const STATES_TS = join(ROOT, 'src', 'data', 'states.ts');
const COUNTIES_DIR = join(ROOT, 'src', 'data', 'counties');

const SITE_ORIGIN = 'https://mortgage.bangjang.net';

// HTML 특수문자 이스케이프 (보안 및 마크업 깨짐 방지)
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const usd = (n) => '$' + Math.round(n).toLocaleString('en-US');

// 1. 기본 템플릿(dist/index.html) 읽기
const baseHtml = readFileSync(join(DIST, 'index.html'), 'utf8');

// 2. states.ts에서 51개 주 정보 파싱
const stateMatches = [
  ...readFileSync(STATES_TS, 'utf8').matchAll(
    /\{\s*slug:\s*'([^']+)',\s*name:\s*'([^']+)',\s*abbr:\s*'([^']+)',\s*propertyTaxRatePct:\s*([0-9.]+)\s*\}/g
  ),
];
const states = stateMatches.map((m) => ({
  slug: m[1],
  name: m[2],
  abbr: m[3],
  ratePct: Number(m[4]),
}));

if (states.length !== 51) {
  console.error(`주 데이터 파싱 실패: ${states.length}개`);
  process.exit(1);
}

// 페이지별 HTML 파일 생성 함수
function writePageHtml({ routePath, title, description, heading, summaryHtml, faqItems }) {
  const canonical = `${SITE_ORIGIN}${routePath}`;
  let html = baseHtml;

  // <title> 교체
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);

  // meta title / description / canonical / og 태그 교체
  html = html.replace(
    /<meta\s+name="title"\s+content="[^"]*"\s*\/>/,
    `<meta name="title" content="${esc(title)}" />`
  );
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    `<meta name="description" content="${esc(description)}" />`
  );
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/,
    `<link rel="canonical" href="${esc(canonical)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:url" content="${esc(canonical)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:title" content="${esc(title)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${esc(description)}" />`
  );
  html = html.replace(
    /<meta\s+property="twitter:title"\s+content="[^"]*"\s*\/>/,
    `<meta property="twitter:title" content="${esc(title)}" />`
  );
  html = html.replace(
    /<meta\s+property="twitter:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="twitter:description" content="${esc(description)}" />`
  );

  // FAQPage JSON-LD 스키마가 있으면 </head> 직전에 삽입
  if (faqItems && faqItems.length > 0) {
    const faqJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      })),
    };
    const scriptTag = `    <script type="application/ld+json">${JSON.stringify(faqJsonLd)}</script>\n  </head>`;
    html = html.replace('</head>', scriptTag);
  }

  // <div id="root"></div> 안에 초기 정적 본문 삽입 (React 마운트 시 자동 교체됨)
  const seoBody = `<div id="root"><main class="mx-auto max-w-4xl p-6"><h1 class="text-3xl font-bold text-slate-900">${esc(heading)}</h1>${summaryHtml}</main></div>`;
  html = html.replace('<div id="root"></div>', seoBody);

  // 출력 경로 결정 ('/' 이면 dist/index.html, 그 외에는 dist/<routePath>/index.html)
  const outDir = routePath === '/' ? DIST : join(DIST, ...routePath.replace(/^\//, '').split('/'));
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), html, 'utf8');
}

let count = 0;

// 3. 고정 페이지 생성
const fixedPages = [
  {
    routePath: '/',
    title: 'Mortgage Payment Calculator 2026 - Property Tax, Insurance & PMI',
    description:
      'Free US mortgage payment calculator with accurate 50-state and 3,131-county effective property tax rates, home insurance, PMI, and amortization schedule.',
    heading: 'Mortgage Payment Calculator',
    summaryHtml:
      '<p class="mt-2 text-slate-600">See your true monthly mortgage payment including county-level property tax, homeowners insurance, PMI, and amortization schedule across all 50 US states.</p>',
  },
  {
    routePath: '/mortgage',
    title: 'Mortgage Calculator by State (2026 Property Tax Rates) | MortgageSmart',
    description:
      'Compare average effective property tax rates across all 50 US states and DC, and estimate your true monthly mortgage payment.',
    heading: 'Mortgage Calculator by State',
    summaryHtml:
      '<p class="mt-2 text-slate-600">Choose your state to see a mortgage payment estimate with its statewide average effective property tax rate and county breakdown.</p>',
  },
  {
    routePath: '/affordability',
    title: 'Home Affordability Calculator (28/36 Rule & Property Tax) | MortgageSmart',
    description:
      'Calculate how much house you can afford based on your annual income, monthly debts, down payment, and state property tax rate.',
    heading: 'Home Affordability Calculator',
    summaryHtml:
      '<p class="mt-2 text-slate-600">Find out how much house you can afford using the 28/36 debt-to-income lender guideline, down payment, and local property tax rates.</p>',
  },
  {
    routePath: '/about',
    title: 'About MortgageSmart & Methodology | MortgageSmart',
    description:
      'Learn how MortgageSmart calculates monthly mortgage payments, amortization schedules, home affordability, and county property taxes.',
    heading: 'About MortgageSmart & Methodology',
    summaryHtml:
      '<p class="mt-2 text-slate-600">MortgageSmart combines standard mortgage amortization formulas with US Census Bureau and Tax Foundation effective property tax data.</p>',
  },
  {
    routePath: '/privacy',
    title: 'Privacy Policy | MortgageSmart',
    description:
      'Privacy Policy for MortgageSmart. Learn how we protect your privacy, handle browser-only mortgage calculations, and use cookies.',
    heading: 'Privacy Policy',
    summaryHtml:
      '<p class="mt-2 text-slate-600">All mortgage and affordability calculations run 100% in your browser. No personal financial inputs are transmitted or stored.</p>',
  },
  {
    routePath: '/terms',
    title: 'Terms of Use & Financial Disclaimer | MortgageSmart',
    description:
      'Terms of Use and Financial Disclaimer for MortgageSmart. All mortgage and property tax estimates are for educational purposes only.',
    heading: 'Terms of Use & Financial Disclaimer',
    summaryHtml:
      '<p class="mt-2 text-slate-600">All calculators and property tax figures on MortgageSmart are estimates for educational purposes only and do not constitute financial advice.</p>',
  },
];

for (const p of fixedPages) {
  writePageHtml(p);
  count++;
}

// 4. 51개 주 페이지 및 3,131개 카운티 페이지 생성
for (const state of states) {
  const annualTax400k = Math.round((400000 * state.ratePct) / 100);
  const monthlyTax400k = Math.round(annualTax400k / 12);

  writePageHtml({
    routePath: `/mortgage/${state.slug}`,
    title: `${state.name} Mortgage & Property Tax Calculator (${state.ratePct.toFixed(2)}% Avg Rate)`,
    description: `Calculate your monthly mortgage payment in ${state.name} with the ${state.ratePct.toFixed(2)}% average effective property tax rate, insurance, PMI, and county-by-county breakdown.`,
    heading: `${state.name} Mortgage Calculator`,
    summaryHtml: `<p class="mt-2 text-slate-600">Estimate your monthly mortgage payment in ${esc(state.name)}. The statewide average effective property tax rate is ${state.ratePct.toFixed(2)}% (about ${usd(annualTax400k)}/year on a $400,000 home).</p>`,
    faqItems: [
      {
        q: `What is the average property tax rate in ${state.name}?`,
        a: `The statewide average effective property tax rate on owner-occupied housing in ${state.name} is ${state.ratePct.toFixed(2)}% (2024 US Census ACS data).`,
      },
      {
        q: `How much is property tax on a $400,000 home in ${state.name}?`,
        a: `At the ${state.name} average rate of ${state.ratePct.toFixed(2)}%, a $400,000 home has an estimated property tax of about ${usd(annualTax400k)} per year (around ${usd(monthlyTax400k)} per month).`,
      },
    ],
  });
  count++;

  // 해당 주의 카운티 JSON 읽기
  const counties = JSON.parse(readFileSync(join(COUNTIES_DIR, `${state.slug}.json`), 'utf8'));
  for (const c of counties) {
    const diff = Math.round((c.ratePct - state.ratePct) * 100) / 100;
    const diffText =
      diff === 0
        ? `the same as the ${state.name} average`
        : `${Math.abs(diff).toFixed(2)} percentage points ${diff > 0 ? 'higher' : 'lower'} than the ${state.name} average`;
    const cAnnualTax = Math.round((400000 * c.ratePct) / 100);
    const cMonthlyTax = Math.round(cAnnualTax / 12);
    const medianTaxText = c.medianTax >= 10001 ? 'over $10,000' : usd(c.medianTax);

    writePageHtml({
      routePath: `/mortgage/${state.slug}/${c.slug}`,
      title: `${c.name}, ${state.abbr} Mortgage & Property Tax Calculator (${c.ratePct.toFixed(2)}% Rate)`,
      description: `Estimate your monthly mortgage payment in ${c.name}, ${state.name}. Effective property tax rate is ${c.ratePct.toFixed(2)}% (${diffText}). Median annual tax paid is ${medianTaxText}.`,
      heading: `${c.name}, ${state.name} Mortgage Calculator`,
      summaryHtml: `<p class="mt-2 text-slate-600">Homeowners in ${esc(c.name)}, ${esc(state.name)} pay an effective property tax rate of ${c.ratePct.toFixed(2)}%, which is ${esc(diffText)} (${state.ratePct.toFixed(2)}%). The median annual property tax bill is ${esc(medianTaxText)}.</p>`,
      faqItems: [
        {
          q: `What is the property tax rate in ${c.name}, ${state.name}?`,
          a: `The effective property tax rate on owner-occupied housing in ${c.name}, ${state.name} is ${c.ratePct.toFixed(2)}%, which is ${diffText} (${state.ratePct.toFixed(2)}%).`,
        },
        {
          q: `How much is property tax on a $400,000 home in ${c.name}, ${state.abbr}?`,
          a: `At an effective rate of ${c.ratePct.toFixed(2)}%, a $400,000 home in ${c.name} has an estimated annual property tax of about ${usd(cAnnualTax)} (around ${usd(cMonthlyTax)} per month). The median annual property tax bill in ${c.name} is ${medianTaxText}.`,
        },
      ],
    });
    count++;
  }
}

console.log(`정적 HTML 사전 생성(SSG) 완료: 총 ${count}개 페이지 생성됨`);

