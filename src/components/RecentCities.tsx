import { Clock3 } from 'lucide-react'
import { cities } from '../data/cities'
import type { UserProgress } from '../types/domain'

type RecentCitiesProps = {
  progress: UserProgress
}

export function RecentCities({ progress }: RecentCitiesProps) {
  const recent = progress.recentCityIds
    .map((cityId) => cities.find((city) => city.id === cityId))
    .filter(Boolean)

  return (
    <section className="recent-panel">
      <h2>
        <Clock3 size={18} aria-hidden="true" />
        Son işaretlenenler
      </h2>
      {recent.length ? (
        <div className="recent-list">
          {recent.map((city) => (
            <span key={city!.id}>
              {city!.name}
            </span>
          ))}
        </div>
      ) : (
        <p>İlk şehrini işaretlediğinde burada görünür.</p>
      )}
    </section>
  )
}
