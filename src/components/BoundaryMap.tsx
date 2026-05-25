import { geoMercator, geoPath } from 'd3-geo'
import { useMemo } from 'react'
import clsx from 'clsx'
import { getCityExplorePercentage, getCityTone, getDistrictProgress, isCityVisited } from '../lib/progress'
import { cityFromProvince, districtPercentage, featureCollectionFromFeatures, normalizeTr, provinceFeatureForCity } from '../lib/geo'
import type { City, UserProgress } from '../types/domain'
import type { DistrictCollection, ProvinceCollection, ProvinceFeature } from '../types/geo'

type BoundaryMapProps = {
  districts: DistrictCollection | null
  loading: boolean
  onSelectCity: (city: City) => void
  onSelectDistrict: (district: string) => void
  progress: UserProgress
  provinces: ProvinceCollection | null
  selectedCity?: City
  selectedDistrict?: string
}

const toneClass = {
  empty: 'fill-[#d8e0da]',
  visited: 'fill-[#8fc7a8]',
  active: 'fill-[#4f9f83]',
  complete: 'fill-[#d9a441]',
}

const priorityLabel: Record<string, string> = {
  must_see: 'Mutlaka Gör',
  recommended: 'Önerilir',
  hidden_gem: 'Saklı Rota',
}

export function BoundaryMap({
  districts,
  loading,
  onSelectCity,
  onSelectDistrict,
  progress,
  provinces,
  selectedCity,
  selectedDistrict,
}: BoundaryMapProps) {
  const selectedProvince = provinceFeatureForCity(provinces, selectedCity)
  const selectedDistricts = useMemo(() => {
    if (!districts || !selectedProvince) return []
    return districts.features.filter((district) => district.properties.GID_1 === selectedProvince.properties.GID_1)
  }, [districts, selectedProvince])

  const provincePath = useMemo(() => {
    if (!provinces) return null
    const projection = geoMercator().fitSize([900, 360], provinces)
    return geoPath(projection)
  }, [provinces])

  const districtPath = useMemo(() => {
    if (!selectedDistricts.length) return null
    const collection = featureCollectionFromFeatures(selectedDistricts)
    const projection = geoMercator().fitSize([330, 210], collection)
    return geoPath(projection)
  }, [selectedDistricts])
  const selectedDistrictProgress = useMemo(() => {
    if (!selectedCity || !selectedDistrict) return undefined
    return getDistrictProgress(selectedCity.id, progress).find((district) => normalizeTr(district.district) === normalizeTr(selectedDistrict))
  }, [progress, selectedCity, selectedDistrict])

  return (
    <section id="map" className="rounded-xl border border-[#e0d1bb] bg-[#fffaf0] p-3 shadow-sm md:p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-[#10251f]">Türkiye Haritası</h2>
          <p className="text-sm font-semibold text-[#66726e]">İllere dokun, haritanda iz bırak.</p>
        </div>
        <div className="hidden items-center gap-2 text-xs font-bold text-[#64736e] sm:flex">
          <span className="h-3 w-3 rounded-full bg-[#d8e0da]" /> Başlamadı
          <span className="h-3 w-3 rounded-full bg-[#8fc7a8]" /> Gezildi
          <span className="h-3 w-3 rounded-full bg-[#0f6b67]" /> Yoğun
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-[#e8f0ea]">
        {loading || !provincePath || !provinces ? (
          <div className="grid aspect-[5/2] place-items-center text-sm font-black text-[#66726e]">Harita verisi yükleniyor</div>
        ) : (
          <svg className="block h-auto w-full" role="img" viewBox="0 0 900 360" aria-label="Rotala gerçek Türkiye il sınırları haritası">
            {provinces.features.map((feature) => {
              const city = cityFromProvince(feature as ProvinceFeature)
              if (!city) return null

              const tone = getCityTone(city, progress)
              const selected = selectedCity?.id === city.id
              const cityVisited = isCityVisited(city, progress)
              const explore = getCityExplorePercentage(city.id, progress)
              const centroid = provincePath.centroid(feature)
              const labelWidth = Math.max(54, city.name.length * 7.5 + 18)
              const labelX = Math.min(900 - labelWidth / 2 - 4, Math.max(labelWidth / 2 + 4, centroid[0]))
              const labelY = Math.min(348, Math.max(16, centroid[1] - 18))

              return (
                <g
                  key={feature.properties.GID_1}
                  onClick={() => onSelectCity(city)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') onSelectCity(city)
                  }}
                  role="button"
                  tabIndex={0}
                  className="group cursor-pointer focus:outline-none"
                  aria-label={`${city.name} seç. ${cityVisited ? 'Gezildi' : 'Gezilmedi'}, keşif yüzde ${explore}`}
                >
                  <path
                    className={clsx(
                      toneClass[tone],
                      'origin-center stroke-white stroke-[1.6] transition duration-150 group-hover:scale-[1.045] group-hover:brightness-95 group-focus:scale-[1.045]',
                      selected && 'stroke-[#10251f] stroke-[3]',
                    )}
                    d={provincePath(feature) ?? undefined}
                    style={{ transformBox: 'fill-box' }}
                  />
                  <text
                    aria-hidden="true"
                    className="pointer-events-none select-none fill-[#10251f] text-[13px] font-black"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    x={centroid[0]}
                    y={centroid[1]}
                  >
                    {city.plate}
                  </text>
                  <g className="pointer-events-none opacity-0 transition group-hover:opacity-100 group-focus:opacity-100">
                    <rect
                      fill="#10251f"
                      height="22"
                      rx="6"
                      width={labelWidth}
                      x={labelX - labelWidth / 2}
                      y={labelY - 11}
                    />
                    <text
                      className="select-none fill-white text-[12px] font-black"
                      dominantBaseline="middle"
                      textAnchor="middle"
                      x={labelX}
                      y={labelY}
                    >
                      {city.name}
                    </text>
                  </g>
                </g>
              )
            })}
          </svg>
        )}
      </div>

      {selectedCity && selectedDistricts.length > 0 && districtPath && (
        <div className="mt-3 grid gap-3 lg:grid-cols-[190px_minmax(0,1fr)]">
          <div>
            <p className="text-sm font-black text-[#10251f]">{selectedCity.name} ilçeleri</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-[#66726e]">
              İlçeye tıklayınca o ilçedeki gezilecek yerler açılır.
            </p>
            {selectedDistrict && (
              <div className="mt-3 rounded-lg bg-[#eef6ef] p-3">
                <p className="text-sm font-black text-[#0f6b67]">{selectedDistrict}</p>
                <p className="mt-1 text-xs font-bold text-[#60716a]">
                  {selectedDistrictProgress
                    ? `${selectedDistrictProgress.completed} / ${selectedDistrictProgress.total} yer tamamlandı`
                    : 'Bu ilçe için dataset kaydı yok'}
                </p>
              </div>
            )}
          </div>
          <div className="overflow-hidden rounded-lg border border-[#dfe8e3] bg-[#f7fbf8]">
            <svg className="block h-auto w-full" role="img" viewBox="0 0 330 210" aria-label={`${selectedCity.name} gerçek ilçe sınırları`}>
              {selectedDistricts.map((feature) => {
                const percentage = districtPercentage(feature, selectedCity, progress)
                const fill = percentage >= 100 ? '#d9a441' : percentage >= 50 ? '#0f6b67' : percentage > 0 ? '#8fc7a8' : '#d8e0da'
                const selected = selectedDistrict && normalizeTr(selectedDistrict) === normalizeTr(feature.properties.NAME_2)

                return (
                  <path
                    aria-label={`${feature.properties.NAME_2} ilçesini seç. İlerleme yüzde ${percentage}`}
                    className="cursor-pointer transition hover:brightness-95 focus:outline-none"
                    d={districtPath(feature) ?? undefined}
                    fill={fill}
                    key={feature.properties.GID_2}
                    onClick={() => onSelectDistrict(feature.properties.NAME_2)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') onSelectDistrict(feature.properties.NAME_2)
                    }}
                    role="button"
                    stroke={selected ? '#10251f' : '#ffffff'}
                    strokeWidth={selected ? '2.75' : '1'}
                    tabIndex={0}
                  >
                    <title>
                      {feature.properties.NAME_2} - %{percentage}
                    </title>
                  </path>
                )
              })}
            </svg>
          </div>
          {selectedDistrictProgress && (
            <div className="lg:col-start-2">
              <div className="grid gap-2 sm:grid-cols-2">
                {selectedDistrictProgress.places.map((place) => {
                  const checked = progress.visitedPlaceIds.includes(place.id)

                  return (
                    <div
                      className={clsx(
                        'rounded-md border px-3 py-2 text-sm',
                        checked ? 'border-[#b8dac8] bg-[#edf7f2] text-[#0f6b67]' : 'border-[#dfe8e3] bg-white text-[#263a34]',
                      )}
                      key={place.id}
                    >
                      <p className="font-black">{place.name}</p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#71807a]">
                        {place.category} · {priorityLabel[place.priority] ?? place.priority}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
