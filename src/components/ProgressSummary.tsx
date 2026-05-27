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
        'progress-atlas',
        compact && 'progress-atlas--compact',
      )}
    >
      <div className="progress-ring" aria-hidden="true" />
      <div className="progress-copy">
        <div>
          <p className="micro-label">Türkiye gezi haritan</p>
          <h2>%{stats.cityPercentage}</h2>
          <p>Türkiye’nin %{stats.cityPercentage}’sini keşfettin.</p>
        </div>
        <div className="route-seal">
          <Route aria-hidden="true" />
        </div>
      </div>

      <div className="atlas-line">
        <span style={{ width: `${stats.cityPercentage}%` }} />
      </div>

      <p className="wait-count">{stats.cityCount - stats.visitedCityCount} şehir seni bekliyor.</p>

      <div className="metric-row">
        <Metric icon={<Map size={18} />} label="Şehir" value={`${stats.visitedCityCount} / ${stats.cityCount}`} />
        <Metric icon={<Landmark size={18} />} label="Yer" value={`${stats.visitedPlaceCount} / ${stats.placeCount}`} />
      </div>
    </section>
  )
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="metric-tile">
      <div>{icon}</div>
      <p>{value}</p>
      <span>{label}</span>
    </div>
  )
}
