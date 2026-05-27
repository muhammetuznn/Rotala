import { cities } from '../data/cities'
import type { City } from '../types/domain'

type CityPickerProps = {
  selectedCity?: City
  onSelectCity: (city: City) => void
}

export function CityPicker({ selectedCity, onSelectCity }: CityPickerProps) {
  return (
    <label className="city-picker">
      <span>Şehir ara veya seç</span>
      <select
        onChange={(event) => {
          const city = cities.find((item) => item.id === Number(event.target.value))
          if (city) onSelectCity(city)
        }}
        value={selectedCity?.id ?? ''}
      >
        <option value="" disabled>
          Haritadan tıkla veya seç
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
