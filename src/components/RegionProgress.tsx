import { getRegionStats } from '../lib/progress'
import type { UserProgress } from '../types/domain'

type RegionProgressProps = {
  progress: UserProgress
  compact?: boolean
}

export function RegionProgress({ compact = false, progress }: RegionProgressProps) {
  const regions = getRegionStats(progress)

  return (
    <section className={compact ? '' : 'rounded-xl border border-[#e0d1bb] bg-[#fffaf0] p-4 shadow-sm'}>
      <h2 className={compact ? 'text-base font-black text-[#10251f]' : 'text-lg font-black text-[#10251f]'}>Bölge ilerlemesi</h2>
      <div className={compact ? 'mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7' : 'mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2'}>
        {regions.map((region) => (
          <div key={region.region} className={compact ? 'rounded-lg border border-[#eadcc8] bg-white/80 p-2.5' : 'rounded-lg border border-[#eadcc8] bg-white/80 p-3'}>
            <div className="flex items-center justify-between gap-3">
              <p className={compact ? 'truncate text-xs font-black text-[#263a34]' : 'text-sm font-black text-[#263a34]'}>{region.region}</p>
              <p className="text-sm font-black text-[#0f6b67]">%{region.percentage}</p>
            </div>
            <div className={compact ? 'mt-2 h-1.5 overflow-hidden rounded-full bg-[#e8dfd1]' : 'mt-2 h-2 overflow-hidden rounded-full bg-[#e8dfd1]'}>
              <div className="h-full rounded-full bg-[#d88355] transition-all duration-500" style={{ width: `${region.percentage}%` }} />
            </div>
            <p className={compact ? 'mt-1.5 text-[11px] font-bold text-[#66726e]' : 'mt-2 text-xs font-bold text-[#66726e]'}>
              {region.completed} / {region.total} şehir
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
