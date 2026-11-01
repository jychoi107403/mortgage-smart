// =========================================================================
// 전체 페이지 Sitemap 자동 생성 스크립트
//
// 입력 : src/data/states.ts, src/data/counties/*.json
// 출력 : public/sitemap.xml
//
// 실행 : node scripts/build-sitemap.mjs
// =========================================================================

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const STATES_TS = join(ROOT, 'src', 'data', 'states.ts');
const COUNTIES_DIR = join(ROOT, 'src', 'data', 'counties');
const OUT_FILE = join(ROOT, 'public', 'sitemap.xml');

const SITE_ORIGIN = 'https://mortgage.bangjang.net';
const LASTMOD = '2026-11-01';

// 1. 고정 페이지 목록
const staticPaths = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/mortgage', priority: '0.9', changefreq: 'monthly' },
  { path: '/affordability', priority: '0.9', changefreq: 'monthly' },
  { path: '/about', priority: '0.5', changefreq: 'yearly' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { path: '/terms', priority: '0.3', changefreq: 'yearly' },
];

// 2. 51개 주 페이지 추출
const stateSlugs = [
  ...readFileSync(STATES_TS, 'utf8').matchAll(/slug:\s*'([a-z-]+)'/g),
].map((m) => m[1]);

const statePaths = stateSlugs.map((slug) => ({
  path: `/mortgage/${slug}`,
  priority: '0.8',
  changefreq: 'monthly',
}));

// 3. 3,131개 카운티 페이지 추출
const countyPaths = [];
for (const file of readdirSync(COUNTIES_DIR).sort()) {
  if (!file.endsWith('.json')) continue;
  const stateSlug = file.replace(/\.json$/, '');
  const list = JSON.parse(readFileSync(join(COUNTIES_DIR, file), 'utf8'));
  for (const c of list) {
    countyPaths.push({
      path: `/mortgage/${stateSlug}/${c.slug}`,
      priority: '0.6',
      changefreq: 'monthly',
    });
  }
}

const allEntries = [...staticPaths, ...statePaths, ...countyPaths];

// XML 생성
const xmlLines = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...allEntries.map(
    (u) =>
      `  <url><loc>${SITE_ORIGIN}${u.path}</loc><lastmod>${LASTMOD}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`
  ),
  '</urlset>',
  '',
];

writeFileSync(OUT_FILE, xmlLines.join('\n'), 'utf8');
console.log(
  `sitemap.xml 생성 완료: 총 ${allEntries.length}개 URL (고정 ${staticPaths.length} + 주 ${statePaths.length} + 카운티 ${countyPaths.length})`
);

