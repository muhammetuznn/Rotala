import clsx from 'clsx'
import { geoMercator, geoPath } from 'd3-geo'
import { useMemo, useRef, useState } from 'react'
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
  empty: 'map-empty',
  visited: 'map-visited',
  active: 'map-active',
  complete: 'map-complete',
}

const priorityLabel: Record<string, string> = {
  must_see: 'Mutlaka Gör',
  recommended: 'Önerilir',
  hidden_gem: 'Saklı Rota',
}

const visitedCityColors = ['#f0b85d', '#d96f55', '#40b8aa', '#a98be4', '#e7c84f', '#5fb2d6', '#d985b8', '#8fd36f']

function getVisitedCityColor(cityId: number) {
  return visitedCityColors[cityId % visitedCityColors.length]
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
  const [pressedCityId, setPressedCityId] = useState<number | undefined>()
  const pressTimerRef = useRef<number | undefined>(undefined)
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

  function beginCityPress(cityId: number) {
    window.clearTimeout(pressTimerRef.current)
    pressTimerRef.current = window.setTimeout(() => setPressedCityId(cityId), 120)
  }

  function endCityPress() {
    window.clearTimeout(pressTimerRef.current)
    pressTimerRef.current = undefined
    window.setTimeout(() => setPressedCityId(undefined), 120)
  }

  return (
    <section id="map" className={clsx('map-panel', selectedCity && 'map-panel--city-selected')}>
      <div className="map-panel-head">
        <div className="map-legend">
          <span><i className="legend-empty" />Başlamadı</span>
          <span><i className="legend-gold" />İz bırakıldı</span>
        </div>
      </div>

      <div className="turkey-map-shell">
        {loading || !provincePath || !provinces ? (
          <div className="map-loading">Harita verisi yükleniyor</div>
        ) : (
          <svg className="turkey-map" role="img" viewBox="0 0 900 360" aria-label="Rotala gerçek Türkiye il sınırları haritası">
            {provinces.features.map((feature) => {
              const city = cityFromProvince(feature as ProvinceFeature)
              if (!city) return null

              const tone = getCityTone(city, progress)
              const selected = selectedCity?.id === city.id
              const pressed = pressedCityId === city.id
              const cityVisited = isCityVisited(city, progress)
              const explore = getCityExplorePercentage(city.id, progress)
              const centroid = provincePath.centroid(feature)
              const visitedFill = cityVisited ? getVisitedCityColor(city.id) : undefined
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
                  onPointerCancel={endCityPress}
                  onPointerDown={() => beginCityPress(city.id)}
                  onPointerLeave={endCityPress}
                  onPointerUp={endCityPress}
                  role="button"
                  tabIndex={0}
                  className="group cursor-pointer focus:outline-none"
                  aria-label={`${city.name} seç. ${cityVisited ? 'Gezildi' : 'Gezilmedi'}, keşif yüzde ${explore}`}
                >
                  <path
                    className="province-hit-area"
                    d={provincePath(feature) ?? undefined}
                    fill="none"
                    pointerEvents="stroke"
                    stroke="transparent"
                    strokeWidth="14"
                  />
                  <path
                    className={clsx(
                      toneClass[tone],
                      'province-shape',
                      selected && 'province-shape--selected',
                      pressed && 'province-shape--pressed',
                    )}
                    d={provincePath(feature) ?? undefined}
                    style={{
                      fill: visitedFill,
                      stroke: visitedFill ? '#fff0c8' : undefined,
                      transformBox: 'fill-box',
                    }}
                  />
                  <text
                    aria-hidden="true"
                    className="plate-label"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    x={centroid[0]}
                    y={centroid[1]}
                  >
                    {city.plate}
                  </text>
                  <g className="pointer-events-none opacity-0 transition group-hover:opacity-100 group-focus:opacity-100">
                    <rect
                      className="map-tooltip-bg"
                      height="22"
                      rx="6"
                      width={labelWidth}
                      x={labelX - labelWidth / 2}
                      y={labelY - 11}
                    />
                    <text
                      className="map-tooltip-text"
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
        <div className="district-preview">
          <div>
            <p className="district-preview-title">{selectedCity.name} ilçeleri</p>
            <p>
              İlçeye tıklayınca o ilçedeki gezilecek yerler açılır.
            </p>
            {selectedDistrict && (
              <div className="district-note">
                <p>{selectedDistrict}</p>
                <span>
                  {selectedDistrictProgress
                    ? `${selectedDistrictProgress.completed} / ${selectedDistrictProgress.total} yer tamamlandı`
                    : 'Bu ilçe için dataset kaydı yok'}
                </span>
              </div>
            )}
          </div>
          <div className="district-map-shell">
            <svg className="district-map" role="img" viewBox="0 0 330 210" aria-label={`${selectedCity.name} gerçek ilçe sınırları`}>
              {selectedDistricts.map((feature) => {
                const percentage = districtPercentage(feature, selectedCity, progress)
                const fill = percentage >= 100 ? '#c49a4a' : percentage >= 50 ? '#84713f' : percentage > 0 ? '#56685a' : '#263832'
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
                    stroke={selected ? '#d8ad5b' : '#11241f'}
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
            <div className="district-places-preview">
              <div>
                {selectedDistrictProgress.places.map((place) => {
                  const checked = progress.visitedPlaceIds.includes(place.id)

                  return (
                    <div
                      className={clsx(
                        'mini-place',
                        checked && 'mini-place--done',
                      )}
                      key={place.id}
                    >
                      <p>{place.name}</p>
                      <span>
                        {place.category} · {priorityLabel[place.priority] ?? place.priority}
                      </span>
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
