// =========================================================================
// 카운티 데이터 변환 스크립트
//
// 입력 : data-source/data-1tqFb.csv  (Tax Foundation, 2024 ACS 5년 추정치)
// 출력 : src/data/counties/<주-slug>.json  (주별로 나눈 파일 51개)
//
// 실행 : node scripts/build-counties.mjs
//
// 안전 규칙
// - 원본 CSV는 읽기만 하고 수정하지 않습니다.
// - 외부 네트워크 호출을 하지 않습니다.
// - 숫자가 아니거나 범위를 벗어난 행은 건너뛰고 마지막에 목록으로 보고합니다.
// - 값을 추측해서 채우지 않습니다.
// =========================================================================

import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const INPUT = join(ROOT, 'data-source', 'data-1tqFb.csv');
const OUT_DIR = join(ROOT, 'src', 'data', 'counties');
const STATES_TS = join(ROOT, 'src', 'data', 'states.ts');

// 이름 -> URL용 slug (소문자, 영문/숫자와 하이픈만)
function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // 악센트 제거 (Doña -> Dona)
    .toLowerCase()
    .replace(/['’.]/g, '') // 아포스트로피, 마침표 제거 (St. Mary's -> st marys)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// 간단한 CSV 한 줄 분해 (따옴표로 감싼 필드 지원)
function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else cur += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',') { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

// states.ts에서 허용된 주 slug 51개를 읽어옵니다. (주 이름이 목록과 맞는지 검증용)
const knownStateSlugs = new Set(
  [...readFileSync(STATES_TS, 'utf8').matchAll(/slug:\s*'([a-z-]+)'/g)].map((m) => m[1])
);
if (knownStateSlugs.size !== 51) {
  console.error(`states.ts에서 주 slug 51개를 읽지 못했습니다 (읽은 개수: ${knownStateSlugs.size})`);
  process.exit(1);
}

const lines = readFileSync(INPUT, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/).filter((l) => l.trim() !== '');
const header = parseCsvLine(lines[0]).map((h) => h.trim());
const col = (name) => header.findIndex((h) => h.startsWith(name));
const idx = {
  fips: col('FIPS_code'),
  county: col('County'),
  state: col('State'),
  tax: col('Median Property Taxes Paid'),
  rate: col('Effective tax rate'),
  change: col('Inflation-adjusted change'),
};
if (Object.values(idx).some((i) => i < 0)) {
  console.error('CSV 헤더가 예상과 다릅니다:', header);
  process.exit(1);
}

const byState = new Map(); // 주 slug -> 카운티 배열
const skipped = []; // 건너뛴 행과 이유

for (let n = 1; n < lines.length; n++) {
  const f = parseCsvLine(lines[n]).map((v) => v.trim());
  const fips = f[idx.fips];
  const name = f[idx.county];
  const stateName = f[idx.state];
  const tax = Number(f[idx.tax]);
  const rate = Number(f[idx.rate]);
  const changeRaw = f[idx.change];
  // 변화율은 부가 정보입니다. 'n/a', '-', 빈 값은 "자료 없음"(null)으로 처리합니다.
  const change = ['', 'n/a', '-'].includes(changeRaw.toLowerCase()) ? null : Number(changeRaw);

  const stateSlug = slugify(stateName);
  const label = `${name}, ${stateName} (FIPS ${fips})`;

  // ---- 검증 ----
  if (!/^\d{5}$/.test(fips)) { skipped.push(`${label}: FIPS 형식 오류`); continue; }
  if (!name) { skipped.push(`${label}: 카운티 이름 없음`); continue; }
  if (!knownStateSlugs.has(stateSlug)) { skipped.push(`${label}: 알 수 없는 주`); continue; }
  if (!Number.isFinite(tax) || tax <= 0 || tax > 100000) { skipped.push(`${label}: 중위 세금 이상 (${f[idx.tax]})`); continue; }
  if (!Number.isFinite(rate) || rate <= 0 || rate > 5) { skipped.push(`${label}: 세율 이상 (${f[idx.rate]})`); continue; }
  if (change !== null && (!Number.isFinite(change) || Math.abs(change) > 100)) { skipped.push(`${label}: 변화율 이상 (${changeRaw})`); continue; }

  if (!byState.has(stateSlug)) byState.set(stateSlug, []);
  byState.get(stateSlug).push({
    fips,
    name,
    slug: slugify(name),
    medianTax: tax,
    ratePct: rate,
    changePct: change,
  });
}

// ---- 같은 주 안에서 slug가 겹치면 FIPS를 붙여 구분 ----
let dupFixed = 0;
for (const list of byState.values()) {
  const count = new Map();
  for (const c of list) count.set(c.slug, (count.get(c.slug) ?? 0) + 1);
  for (const c of list) {
    if (count.get(c.slug) > 1) { c.slug = `${c.slug}-${c.fips}`; dupFixed++; }
  }
  list.sort((a, b) => a.name.localeCompare(b.name));
}

// ---- 파일 쓰기 (출력 폴더만 비우고 다시 만듭니다) ----
rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });
let total = 0;
for (const [stateSlug, list] of [...byState.entries()].sort()) {
  writeFileSync(join(OUT_DIR, `${stateSlug}.json`), JSON.stringify(list));
  total += list.length;
}

// ---- 요약 보고 ----
console.log(`입력 행: ${lines.length - 1}`);
console.log(`변환 성공: ${total}  /  건너뜀: ${skipped.length}  /  slug 중복 보정: ${dupFixed}`);
console.log(`생성된 주 파일: ${byState.size}개 -> ${OUT_DIR}`);
if (skipped.length) { console.log('--- 건너뛴 항목 ---'); skipped.forEach((s) => console.log(s)); }
for (const [s, l] of [...byState.entries()].sort()) console.log(`${s.padEnd(22)} ${l.length}`);
