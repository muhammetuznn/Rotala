import { Search } from 'lucide-react'
import { cities } from '../data/cities'
import type { City } from '../types/domain'

type CityPickerProps = {
  selectedCity?: City
  onSelectCity: (city: City) => void
}

export function CityPicker({ selectedCity, onSelectCity }: CityPickerProps) {
  return (
    <label className="mt-3 block rounded-lg border border-[#dfe8e3] bg-white p-3 shadow-sm md:hidden">
      <span className="mb-2 flex items-center gap-2 text-sm font-black text-[#263a34]">
        <Search size={16} aria-hidden="true" />
        Şehir seç
      </span>
      <select
        className="h-12 w-full rounded-md border border-[#d6ddda] bg-[#fbfdfb] px-3 text-base font-bold text-[#1f332c] outline-none"
        onChange={(event) => {
          const city = cities.find((item) => item.id === Number(event.target.value))
          if (city) onSelectCity(city)
        }}
        value={selectedCity?.id ?? ''}
      >
        <option value="" disabled>
          Şehir ara veya seç
        </option>
        {cities.map((city) => (
          <option key={city.id} value={city.id}>
            {city.plate} - {city.name}
          </option>
        ))}
      </select>
    </label>
  )
}
