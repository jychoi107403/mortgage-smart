import { useEffect, useRef } from 'react';

// =========================================================================
// 반응형 구글 애드센스(AdSense) 광고 슬롯 컴포넌트
// - 구글 애드센스 정책에 맞는 'ADVERTISEMENT' 안내 라벨 표시
// - 게시자 ID: ca-pub-1774804957511077
// - 최소 높이(min-h-[90px])를 확보하여 화면 흔들림(CLS) 방지
// =========================================================================

export interface AdSlotProps {
  slotId?: string;
  format?: 'auto' | 'horizontal' | 'rectangle';
  className?: string;
}

export default function AdSlot({
  slotId = '1234567890',
  format = 'auto',
  className = '',
}: AdSlotProps) {
  const insRef = useRef<HTMLModElement | null>(null);

  useEffect(() => {
    try {
      const el = insRef.current;
      // 이미 초기화된 광고 슬롯이면 중복 push하지 않습니다.
      if (!el || el.getAttribute('data-adsbygoogle-status')) return;
      const win = window as unknown as { adsbygoogle?: unknown[] };
      if (typeof window !== 'undefined' && Array.isArray(win.adsbygoogle)) {
        win.adsbygoogle.push({});
      }
    } catch {
      // 광고 차단기(AdBlock) 사용 환경 등에서도 앱이 멈추지 않도록 무시합니다.
    }
  }, []);

  return (
    <aside
      aria-label="Advertisement"
      className={`my-6 flex flex-col items-center justify-center ${className}`}
    >
      <span className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        ADVERTISEMENT
      </span>
      <div className="flex min-h-[90px] w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-200 bg-slate-100/70 p-2 text-center">
        <ins
          ref={insRef}
          className="adsbygoogle block w-full"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-1774804957511077"
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
}

