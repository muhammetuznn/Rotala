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
    <section className="rounded-xl border border-[#e0d1bb] bg-[#fffaf0] p-4 shadow-sm">
      <h2 className="flex items-center gap-2 text-lg font-black text-[#10251f]">
        <Clock3 size={18} aria-hidden="true" />
        Son işaretlenenler
      </h2>
      {recent.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {recent.map((city) => (
            <span key={city!.id} className="rounded-lg bg-[#edf7f2] px-3 py-2 text-sm font-black text-[#0f6b67]">
              {city!.name}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm font-semibold leading-6 text-[#66726e]">İlk şehrini işaretlediğinde burada görünür.</p>
      )}
    </section>
  )
}
