import { Landmark, Map, Route } from 'lucide-react'
import type { ReactNode } from 'react'
import clsx from 'clsx'
import type { UserProgress } from '../types/domain'
import { getTurkeyStats } from '../lib/progress'

type ProgressSummaryProps = {
  progress: UserProgress
  compact?: boolean
}

export function ProgressSummary({ compact = false, progress }: ProgressSummaryProps) {
  const stats = getTurkeyStats(progress)

  return (
    <section
      id="progress"
      className={clsx(
        'relative overflow-hidden rounded-xl border border-[#e0d1bb] bg-[#fffaf0] shadow-sm',
        compact ? 'p-4' : 'p-5',
      )}
    >
      <div className="pointer-events-none absolute -right-10 -top-8 h-32 w-32 rounded-full border-[18px] border-[#e8b35a]/20" />
      <div className="pointer-events-none absolute bottom-4 right-5 h-16 w-28 rounded-[50%] border-2 border-dashed border-[#0f6b67]/20" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.14em] text-[#bd6a3d]">Türkiye gezi haritan</p>
          <h2 className={clsx('mt-2 font-black leading-none text-[#10251f]', compact ? 'text-4xl' : 'text-5xl')}>%{stats.cityPercentage}</h2>
          <p className={clsx('mt-2 font-bold text-[#5d675f]', compact ? 'text-sm' : 'text-base')}>Türkiye'nin izleri yavaş yavaş doluyor.</p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0f6b67] text-white">
          <Route aria-hidden="true" />
        </div>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#e8dfd1]">
        <div className="h-full rounded-full bg-[#0f6b67] transition-all duration-500" style={{ width: `${stats.cityPercentage}%` }} />
      </div>

      <div className={clsx('mt-4 grid grid-cols-2', compact ? 'gap-2' : 'gap-3')}>
        <Metric icon={<Map size={18} />} label="Şehir" value={`${stats.visitedCityCount} / ${stats.cityCount}`} />
        <Metric icon={<Landmark size={18} />} label="Yer" value={`${stats.visitedPlaceCount} / ${stats.placeCount}`} />
      </div>
      <p className="mt-4 rounded-lg bg-[#f0eadf] px-3 py-2 text-sm font-bold text-[#4d5e58]">
        Keşif devam ediyor: %{stats.explorePercentage}
      </p>
    </section>
  )
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#eadcc8] bg-white/80 p-3">
      <div className="flex items-center gap-2 text-[#0f6b67]">{icon}</div>
      <p className="mt-2 text-xl font-black text-[#162923]">{value}</p>
      <p className="text-sm font-semibold text-[#65736e]">{label}</p>
    </div>
  )
}
