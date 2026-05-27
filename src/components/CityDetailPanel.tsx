import { geoMercator, geoPath } from 'd3-geo'
import { Bookmark, Check, ChevronDown, Flag, Heart, Map, MessageSquare, Star, Trash2, X, MapPin } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import {
  getCityExplorePercentage,
  getCityPlaces,
  getDistrictProgress,
  hasVisitedPlaceInCity,
  isCityManuallyVisited,
  isCityVisited,
} from '../lib/progress'
import { districtPercentage, featureCollectionFromFeatures, normalizeTr, provinceFeatureForCity } from '../lib/geo'
import { deletePlaceNote, getNotes, savePlaceNote } from '../services/notesApi'
import { deletePlaceRating, getMyRatings, getPlaceRatingSummary, savePlaceRating, type RatingSummary } from '../services/ratingsApi'
import heroBackground from '../../Assets/background.png'
import type { City, Place, UserProgress } from '../types/domain'
import type { DistrictCollection, ProvinceCollection } from '../types/geo'
import type { UIEvent } from 'react'

type CityDetailPanelProps = {
  city?: City
  progress: UserProgress
  onClose: () => void
  onToggleCityVisited: (cityId: number) => void
  onTogglePlace: (cityId: number, placeId: string) => void
  onSelectDistrict?: (district: string) => void
  districts?: DistrictCollection | null
  provinces?: ProvinceCollection | null
  selectedDistrict?: string
}

const priorityLabel: Record<string, string> = {
  must_see: 'Mutlaka Gör',
  recommended: 'Önerilir',
  hidden_gem: 'Saklı Rota',
}

export function CityDetailPanel({
  city,
  districts,
  onClose,
  onSelectDistrict,
  onToggleCityVisited,
  onTogglePlace,
  progress,
  provinces,
  selectedDistrict,
}: CityDetailPanelProps) {
  const [openDistricts, setOpenDistricts] = useState<string[]>(['Merkez'])
  const [openPlaceIds, setOpenPlaceIds] = useState<string[]>([])
  const [notesByPlace, setNotesByPlace] = useState<Record<string, string>>({})
  const [savedNotesByPlace, setSavedNotesByPlace] = useState<Record<string, string>>({})
  const [editingNotePlaceIds, setEditingNotePlaceIds] = useState<string[]>([])
  const [ratingsByPlace, setRatingsByPlace] = useState<Record<string, number>>({})
  const [summariesByPlace, setSummariesByPlace] = useState<Record<string, RatingSummary>>({})
  const [savingPlaceIds, setSavingPlaceIds] = useState<string[]>([])
  const [placeDataError, setPlaceDataError] = useState('')
  const [districtMapCollapsed, setDistrictMapCollapsed] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const districtSectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const suppressMapCollapseUntilRef = useRef(0)
  const districtProgress = useMemo(() => (city ? getDistrictProgress(city.id, progress) : []), [city, progress])
  const cityPlaces = useMemo(() => (city ? getCityPlaces(city.id) : []), [city])
  const selectedProvince = provinceFeatureForCity(provinces ?? null, city)
  const selectedDistrictFeatures = useMemo(() => {
    if (!districts || !selectedProvince) return []
    return districts.features.filter((district) => district.properties.GID_1 === selectedProvince.properties.GID_1)
  }, [districts, selectedProvince])
  const districtPath = useMemo(() => {
    if (!selectedDistrictFeatures.length) return null
    const collection = featureCollectionFromFeatures(selectedDistrictFeatures)
    const projection = geoMercator().fitSize([330, 190], collection)
    return geoPath(projection)
  }, [selectedDistrictFeatures])
  const scrollToDistrict = useCallback((district: string, collapseMap: boolean) => {
    if (collapseMap) setDistrictMapCollapsed(true)

    window.setTimeout(() => {
      const target = districtSectionRefs.current[normalizeTr(district)]
      const scrollArea = scrollAreaRef.current
      if (!target || !scrollArea) return

      const targetTop = scrollArea.scrollTop + target.getBoundingClientRect().top - scrollArea.getBoundingClientRect().top - 12
      scrollArea.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' })
    }, 80)
  }, [])

  useEffect(() => {
    if (!selectedDistrict) return

    const matchingDistrict = districtProgress.find((district) => normalizeTr(district.district) === normalizeTr(selectedDistrict))
    if (!matchingDistrict) return

    const timeoutId = window.setTimeout(() => {
      setOpenDistricts((current) => (current.includes(matchingDistrict.district) ? current : [...current, matchingDistrict.district]))
      scrollToDistrict(matchingDistrict.district, true)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [districtProgress, scrollToDistrict, selectedDistrict])

  useEffect(() => {
    if (!city || !districtProgress.length) return

    const preferredDistrict = districtProgress.find((district) => district.district === 'Merkez')?.district ?? districtProgress[0]?.district
    if (!preferredDistrict) return

    const timeoutId = window.setTimeout(() => {
      setOpenDistricts([preferredDistrict])
      setDistrictMapCollapsed(false)
    }, 0)
    districtSectionRefs.current = {}

    return () => window.clearTimeout(timeoutId)
  }, [city, districtProgress])

  useEffect(() => {
    if (!city) return

    let cancelled = false
    const timeoutId = window.setTimeout(() => {
      setPlaceDataError('')

      Promise.all([
        getNotes(),
        getMyRatings(),
        Promise.all(cityPlaces.map((place) => getPlaceRatingSummary(place.id).catch(() => null))),
      ])
        .then(([notes, ratings, summaries]) => {
          if (cancelled) return

          const nextNotes = Object.fromEntries(notes.filter((note) => note.cityId === city.id).map((note) => [note.placeId, note.note ?? '']))
          setNotesByPlace(nextNotes)
          setSavedNotesByPlace(nextNotes)
          setRatingsByPlace(
            Object.fromEntries(ratings.filter((rating) => rating.cityId === city.id).map((rating) => [rating.placeId, rating.rating])),
          )
          setSummariesByPlace(
            Object.fromEntries(
              summaries
                .filter((summary): summary is RatingSummary => Boolean(summary?.placeId))
                .map((summary) => [summary.placeId!, summary]),
            ),
          )
        })
        .catch((error: unknown) => {
          if (!cancelled) setPlaceDataError(error instanceof Error ? error.message : 'Not ve puanlar yüklenemedi.')
        })
    }, 0)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [city, cityPlaces])

  if (!city) return null

  const cityVisited = isCityVisited(city, progress)
  const cityManuallyVisited = isCityManuallyVisited(city, progress)
  const cityHasVisitedPlace = hasVisitedPlaceInCity(city.id, progress)
  const explore = getCityExplorePercentage(city.id, progress)
  const completed = cityPlaces.filter((place) => progress.visitedPlaceIds.includes(place.id)).length

  function toggleDistrict(district: string) {
    setOpenDistricts((current) =>
      current.includes(district) ? current.filter((item) => item !== district) : [...current, district],
    )
  }

  function selectDistrictFromMap(district: string) {
    setOpenDistricts((current) => (current.includes(district) ? current : [...current, district]))
    onSelectDistrict?.(district)
    window.setTimeout(() => scrollToDistrict(district, true), 80)
  }

  function handleDetailScroll(event: UIEvent<HTMLDivElement>) {
    if (Date.now() < suppressMapCollapseUntilRef.current) return

    if (event.currentTarget.scrollTop > 170) {
      setDistrictMapCollapsed(true)
    }
  }

  function expandDistrictMap() {
    const scrollArea = scrollAreaRef.current
    if (!scrollArea || !city) return

    suppressMapCollapseUntilRef.current = Date.now() + 900
    const mapTop = document.getElementById(`district-map-${city.id}`)?.offsetTop ?? 0
    scrollArea.scrollTo({ top: Math.max(0, mapTop - 12), behavior: 'smooth' })
    window.setTimeout(() => setDistrictMapCollapsed(false), 120)
  }

  function togglePlaceDetails(placeId: string) {
    setOpenPlaceIds((current) => (current.includes(placeId) ? current.filter((item) => item !== placeId) : [...current, placeId]))
  }

  function setPlaceSaving(placeId: string, saving: boolean) {
    setSavingPlaceIds((current) => (saving ? [...new Set([...current, placeId])] : current.filter((item) => item !== placeId)))
  }

  function setNoteEditing(placeId: string, editing: boolean) {
    setEditingNotePlaceIds((current) => (editing ? [...new Set([...current, placeId])] : current.filter((item) => item !== placeId)))
  }

  async function handleNoteSave(place: Place) {
    const note = notesByPlace[place.id]?.trim() ?? ''
    setPlaceSaving(place.id, true)
    setPlaceDataError('')

    try {
      if (note) {
        await savePlaceNote(place.id, { note })
        setSavedNotesByPlace((current) => ({ ...current, [place.id]: note }))
      } else {
        await deletePlaceNote(place.id)
        setSavedNotesByPlace((current) => {
          const next = { ...current }
          delete next[place.id]
          return next
        })
      }
      setNoteEditing(place.id, false)
    } catch (error) {
      setPlaceDataError(error instanceof Error ? error.message : 'Not kaydedilemedi.')
    } finally {
      setPlaceSaving(place.id, false)
    }
  }

  async function handleNoteDelete(place: Place) {
    setPlaceSaving(place.id, true)
    setPlaceDataError('')

    try {
      await deletePlaceNote(place.id)
      setNotesByPlace((current) => ({ ...current, [place.id]: '' }))
      setSavedNotesByPlace((current) => {
        const next = { ...current }
        delete next[place.id]
        return next
      })
      setNoteEditing(place.id, false)
    } catch (error) {
      setPlaceDataError(error instanceof Error ? error.message : 'Not silinemedi.')
    } finally {
      setPlaceSaving(place.id, false)
    }
  }

  async function handleRatingChange(place: Place, value: string) {
    setPlaceSaving(place.id, true)
    setPlaceDataError('')

    try {
      if (!value) {
        await deletePlaceRating(place.id)
        setRatingsByPlace((current) => {
          const next = { ...current }
          delete next[place.id]
          return next
        })
      } else {
        const rating = Number(value)
        await savePlaceRating(place.id, rating)
        setRatingsByPlace((current) => ({ ...current, [place.id]: rating }))
      }

      const summary = await getPlaceRatingSummary(place.id)
      setSummariesByPlace((current) => ({ ...current, [place.id]: summary }))
    } catch (error) {
      setPlaceDataError(error instanceof Error ? error.message : 'Puan kaydedilemedi.')
    } finally {
      setPlaceSaving(place.id, false)
    }
  }

  return (
    <>
      <button
        aria-label="Şehir detayını kapat"
        className="mobile-scrim"
        onClick={onClose}
        type="button"
      />
      <aside className="city-drawer">
        <div className="drawer-handle" />
        <div className="city-hero" style={{ backgroundImage: `url(${heroBackground})` }}>
          <div className="city-hero-overlay" />
          <div className="city-title">
            <p>{city.region} · Plaka {city.plate}</p>
            <h2>{city.name}</h2>
            <span>
              <MapPin size={15} aria-hidden="true" />
              {cityManuallyVisited
                ? 'Manuel gezildi işaretli'
                : cityHasVisitedPlace
                  ? 'Checklist nedeniyle gezildi sayılıyor'
                  : 'Henüz gezildi işaretlenmedi'}
            </span>
          </div>
          <button
            className="close-detail"
            onClick={onClose}
            title="Paneli kapat"
            type="button"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div
          className="city-detail-scroll"
          onScroll={handleDetailScroll}
          ref={scrollAreaRef}
        >
          <div className="city-progress-panel">
            <div>
              <p>Şehir keşfi</p>
              <strong>%{explore}</strong>
              <span>
                {completed} / {cityPlaces.length} yer tamamlandı
              </span>
            </div>
            <div className="plate-orbit">
              {city.plate}
            </div>
          </div>

          <div className="action-tiles">
            <button className={clsx('action-tile', cityManuallyVisited && 'action-tile--active')} onClick={() => onToggleCityVisited(city.id)} type="button">
              <Check size={18} aria-hidden="true" />
              <span>{cityManuallyVisited ? 'Gezildi' : cityVisited ? 'Gezildi sayılıyor' : 'Gezildi işaretle'}</span>
            </button>
            <button className="action-tile" type="button">
              <Flag size={18} aria-hidden="true" />
              <span>Gitmek istiyorum</span>
            </button>
            <button className="action-tile" type="button">
              <Heart size={18} aria-hidden="true" />
              <span>Favori</span>
            </button>
            <button className="action-tile" type="button">
              <MessageSquare size={18} aria-hidden="true" />
              <span>Not ekle</span>
            </button>
          </div>

          {city && districtPath && selectedDistrictFeatures.length > 0 && (
            <div
              className={clsx(
                'mobile-district-map',
                districtMapCollapsed && 'mobile-district-map--collapsed',
              )}
              id={`district-map-${city.id}`}
            >
              <div className="district-map-head">
                <div>
                  <p>{city.name} ilçe haritası</p>
                  <span>İlçeye dokun, listedeki yerine git.</span>
                </div>
                <b>{city.plate}</b>
              </div>
              <div className="drawer-district-map">
                <svg role="img" viewBox="0 0 330 190" aria-label={`${city.name} ilçe seçim haritası`}>
                  {selectedDistrictFeatures.map((feature) => {
                    const percentage = districtPercentage(feature, city, progress)
                    const fill = percentage >= 100 ? '#c49a4a' : percentage >= 50 ? '#84713f' : percentage > 0 ? '#56685a' : '#263832'
                    const selected = selectedDistrict && normalizeTr(selectedDistrict) === normalizeTr(feature.properties.NAME_2)

                    return (
                      <path
                        aria-label={`${feature.properties.NAME_2} ilçesine git`}
                        className="cursor-pointer transition hover:brightness-95 focus:outline-none"
                        d={districtPath(feature) ?? undefined}
                        fill={fill}
                        key={feature.properties.GID_2}
                        onClick={() => selectDistrictFromMap(feature.properties.NAME_2)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') selectDistrictFromMap(feature.properties.NAME_2)
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
            </div>
          )}

          {city && districtPath && selectedDistrictFeatures.length > 0 && districtMapCollapsed && (
            <button
              className="district-map-fab"
              onClick={expandDistrictMap}
              type="button"
            >
              <Map size={17} aria-hidden="true" />
              <span>Harita</span>
            </button>
          )}

          <div className="place-list">
            {placeDataError && <p className="place-error">{placeDataError}</p>}

            {districtProgress.map((district) => {
              const open = openDistricts.includes(district.district)
              const selected = Boolean(selectedDistrict && normalizeTr(selectedDistrict) === normalizeTr(district.district))

              return (
                <section
                  id={`district-${city.id}-${normalizeTr(district.district)}`}
                  key={district.district}
                  ref={(element) => {
                    districtSectionRefs.current[normalizeTr(district.district)] = element
                  }}
                  className={clsx(
                    'district-section',
                    selected && 'district-section--selected',
                  )}
                >
                  <button
                    className="district-toggle"
                    onClick={() => toggleDistrict(district.district)}
                    type="button"
                  >
                    <span>
                      <span>
                        {district.district}
                        {selected && <em>Haritada seçili</em>}
                      </span>
                      <small>
                        {district.completed} / {district.total} tamamlandı
                      </small>
                    </span>
                    <span>
                      <b>%{district.percentage}</b>
                      <ChevronDown className={clsx('transition', open && 'rotate-180')} size={18} aria-hidden="true" />
                    </span>
                  </button>
                  <div className="district-line">
                    <i style={{ width: `${district.percentage}%` }} />
                  </div>
                  {open && (
                    <div className="district-places">
                      {district.places.map((place) => {
                        const checked = progress.visitedPlaceIds.includes(place.id)
                        const detailsOpen = openPlaceIds.includes(place.id)
                        const summary = summariesByPlace[place.id]
                        const saving = savingPlaceIds.includes(place.id)
                        const savedNote = savedNotesByPlace[place.id]?.trim() ?? ''
                        const editingNote = editingNotePlaceIds.includes(place.id) || !savedNote

                        return (
                          <div className="place-row" key={place.id}>
                            <div className="place-row-main">
                              <button
                                aria-label={checked ? `${place.name} gezildi işaretini kaldır` : `${place.name} gezildi işaretle`}
                                className={clsx(
                                  'outline-indicator',
                                  checked && 'outline-indicator--checked',
                                )}
                                onClick={() => onTogglePlace(city.id, place.id)}
                                type="button"
                              >
                                <Check size={17} aria-hidden="true" />
                              </button>
                              <div className="place-copy">
                                <p className={clsx(checked && 'place-done')}>
                                  {place.name}
                                </p>
                                <span>
                                  {place.district} · {place.category} · {priorityLabel[place.priority] ?? place.priority}
                                </span>
                                <div className="place-meta">
                                  <small>
                                    <Star size={13} aria-hidden="true" />
                                    {summary?.voteCount ? `${summary.averageRating}/10 · ${summary.voteCount} oy` : 'Puan yok'}
                                  </small>
                                  {ratingsByPlace[place.id] && (
                                    <small>Sen: {ratingsByPlace[place.id]}/10</small>
                                  )}
                                  {savedNote && (
                                    <small>
                                      <MessageSquare size={13} aria-hidden="true" />
                                      Not var
                                    </small>
                                  )}
                                </div>
                              </div>
                              <button
                                aria-label="Not ve puan"
                                className="save-place"
                                onClick={() => togglePlaceDetails(place.id)}
                                title="Not ve puan"
                                type="button"
                              >
                                <Bookmark size={16} aria-hidden="true" />
                              </button>
                            </div>

                            {detailsOpen && (
                              <div className="place-details">
                                <div>
                                  <div>
                                    <p className="field-label">
                                    Puan
                                    </p>
                                    <div className="rating-grid">
                                      {Array.from({ length: 10 }, (_, index) => index + 1).map((rating) => (
                                        <button
                                          className={clsx(
                                            'rating-button',
                                            ratingsByPlace[place.id] === rating
                                              ? 'rating-button--active'
                                              : '',
                                          )}
                                          disabled={saving}
                                          key={rating}
                                          onClick={() => void handleRatingChange(place, String(rating))}
                                          type="button"
                                        >
                                          {rating}
                                        </button>
                                      ))}
                                    </div>
                                    {ratingsByPlace[place.id] && (
                                      <button
                                        className="remove-rating"
                                        disabled={saving}
                                        onClick={() => void handleRatingChange(place, '')}
                                        type="button"
                                      >
                                        Puanı kaldır
                                      </button>
                                    )}
                                  </div>

                                  <div>
                                    <div className="flex items-center justify-between gap-3">
                                      <p className="field-label">Yorum / Not</p>
                                      {savedNote && !editingNote && (
                                        <button
                                          className="inline-edit"
                                          disabled={saving}
                                          onClick={() => setNoteEditing(place.id, true)}
                                          type="button"
                                        >
                                          Düzenle
                                        </button>
                                      )}
                                    </div>

                                    {savedNote && !editingNote ? (
                                      <div className="saved-note">
                                        {savedNote}
                                      </div>
                                    ) : (
                                      <label className="block" htmlFor={`${place.id}-note`}>
                                        <textarea
                                          className="note-area"
                                          disabled={saving}
                                          id={`${place.id}-note`}
                                          maxLength={1000}
                                          onChange={(event) =>
                                            setNotesByPlace((current) => ({ ...current, [place.id]: event.target.value }))
                                          }
                                          placeholder="Bu yerle ilgili kendi notunu ekle."
                                          value={notesByPlace[place.id] ?? ''}
                                        />
                                      </label>
                                    )}
                                  </div>
                                </div>

                                <div className="note-actions">
                                  <button
                                    className="delete-note"
                                    disabled={saving}
                                    onClick={() => void handleNoteDelete(place)}
                                    title="Notu sil"
                                    type="button"
                                  >
                                    <Trash2 size={15} aria-hidden="true" />
                                  </button>
                                  {editingNote ? (
                                    <button
                                      className="save-note"
                                      disabled={saving}
                                      onClick={() => void handleNoteSave(place)}
                                      type="button"
                                    >
                                      {saving ? 'Kaydediliyor' : 'Notu kaydet'}
                                    </button>
                                  ) : (
                                    <button
                                      className="secondary-note"
                                      disabled={saving}
                                      onClick={() => setNoteEditing(place.id, true)}
                                      type="button"
                                    >
                                      Yorumu düzenle
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        </div>
      </aside>
    </>
  )
}
