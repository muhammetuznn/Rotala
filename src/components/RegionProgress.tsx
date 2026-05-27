import { getRegionStats } from '../lib/progress'
import type { UserProgress } from '../types/domain'

type RegionProgressProps = {
  progress: UserProgress
  compact?: boolean
}

export function RegionProgress({ compact = false, progress }: RegionProgressProps) {
  const regions = getRegionStats(progress)

  return (
    <section className={compact ? 'region-panel region-panel--compact' : 'region-panel'}>
      <h2>Bölge ilerlemesi</h2>
      <div className="region-grid">
        {regions.map((region) => (
          <div key={region.region} className="region-row">
            <div>
              <p>{region.region}</p>
              <span>%{region.percentage}</span>
            </div>
            <div className="region-track">
              <i style={{ width: `${region.percentage}%` }} />
            </div>
            <small>
              {region.completed} / {region.total} şehir
            </small>
          </div>
        ))}
      </div>
    </section>
  )
}
