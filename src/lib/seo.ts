import { useEffect } from 'react';

// =========================================================================
// 동적 검색엔진 최적화(SEO) 유틸리티
// - 외부 무거운 라이브러리 없이 브라우저의 <title>, <meta name="description">,
//   <link rel="canonical">, Open Graph 태그를 페이지마다 안전하게 변경합니다.
// =========================================================================

// 사이트의 정식 도메인 주소 (끝에 슬래시 없음)
export const SITE_ORIGIN = 'https://mortgage.bangjang.net';
export const SITE_NAME = 'MortgageSmart';

export interface PageSeoInput {
  title: string;       // 브라우저 탭 및 검색 결과 제목
  description: string; // 검색 결과 요약 설명문
  path: string;        // 현재 페이지 경로 (예: "/mortgage/texas")
}

// <meta> 태그 하나를 찾아서 content 속성을 바꿔 주는 보조 함수
function setMetaTag(attrName: 'name' | 'property', attrValue: string, content: string) {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attrName}="${attrValue}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

// <link rel="canonical"> 태그를 찾아서 정식 URL(href)을 바꿔 주는 보조 함수
function setCanonicalLink(url: string) {
  if (typeof document === 'undefined') return;
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

// 각 페이지 컴포넌트 안에서 호출하는 커스텀 훅(Hook)입니다.
export function usePageSeo({ title, description, path }: PageSeoInput) {
  useEffect(() => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const canonicalUrl = `${SITE_ORIGIN}${cleanPath}`;

    // 1. 브라우저 탭 제목 변경
    document.title = title;

    // 2. 검색엔진 및 SNS 공유용 메타태그 변경
    setMetaTag('name', 'title', title);
    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'twitter:title', title);
    setMetaTag('property', 'twitter:description', description);

    // 3. 정식 URL(Canonical) 설정
    setCanonicalLink(canonicalUrl);
  }, [title, description, path]);
}

