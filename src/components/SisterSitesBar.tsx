import { SISTER_SITES } from '../data/sisterSites';

// =========================================================================
// 7개 자매 사이트 상호 이동 바 (Top Network Bar & Footer Network Hub)
// =========================================================================

interface SisterSitesBarProps {
  currentSiteId: string;
}

export function SisterSitesTopBar({ currentSiteId }: SisterSitesBarProps) {
  return (
    <div className="bg-slate-900 text-slate-300 border-b border-slate-800 text-xs">
      <div className="mx-auto max-w-5xl px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
          US Smart Finance Network:
        </span>
        <nav
          aria-label="Sister Finance Calculators"
          className="flex flex-wrap items-center gap-1.5 sm:gap-2"
        >
          {SISTER_SITES.map((site) => {
            const isCurrent = site.id === currentSiteId;
            return (
              <a
                key={site.id}
                href={site.url}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                  isCurrent
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
                title={`${site.fullTitle} (${site.rankLabel})`}
              >
                <span>{site.badgeIcon}</span>
                <span>{site.shortTitle}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export function SisterSitesFooterHub({ currentSiteId }: SisterSitesBarProps) {
  return (
    <div className="mt-6 border-t border-slate-200 pt-6">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
        US Smart Finance Calculator Network (All 7 Sister Sites)
      </h3>
      <p className="mt-1 text-xs text-slate-500">
        Explore our complete suite of free US financial, tax, retirement, and real estate calculators:
      </p>
      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {SISTER_SITES.map((site) => {
          const isCurrent = site.id === currentSiteId;
          return (
            <a
              key={site.id}
              href={site.url}
              className={`group block rounded-lg border p-3 transition ${
                isCurrent
                  ? 'border-blue-500 bg-blue-50/60'
                  : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-900 group-hover:text-blue-600 text-xs">
                  {site.badgeIcon} {site.brandName}
                </span>
                <span
                  className={`rounded-sm px-1.5 py-0.5 text-[10px] font-semibold ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isCurrent ? 'Current Site' : site.rankLabel}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-600 leading-snug">
                {site.description}
              </p>
            </a>
          );
        })}
      </div>
    </div>
  );
}

