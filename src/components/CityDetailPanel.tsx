import { geoMercator, geoPath } from 'd3-geo'
import { Check, ChevronDown, MessageSquare, Star, Trash2, X, MapPin } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
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
import type { City, Place, UserProgress } from '../types/domain'
import type { DistrictCollection, ProvinceCollection } from '../types/geo'

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
  const scrollAreaRef = useRef<HTMLDivElement>(null)
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

  useEffect(() => {
    if (!selectedDistrict) return

    const matchingDistrict = districtProgress.find((district) => normalizeTr(district.district) === normalizeTr(selectedDistrict))
    if (!matchingDistrict) return

    const timeoutId = window.setTimeout(() => {
      setOpenDistricts((current) => (current.includes(matchingDistrict.district) ? current : [...current, matchingDistrict.district]))
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [districtProgress, selectedDistrict])

  useEffect(() => {
    if (!city || !districtProgress.length) return

    const preferredDistrict = districtProgress.find((district) => district.district === 'Merkez')?.district ?? districtProgress[0]?.district
    if (!preferredDistrict) return

    const timeoutId = window.setTimeout(() => setOpenDistricts([preferredDistrict]), 0)

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

    window.setTimeout(() => {
      const target = document.getElementById(`district-${city?.id}-${normalizeTr(district)}`)
      const scrollArea = scrollAreaRef.current
      if (!target || !scrollArea) return

      const stickyOffset = 248
      const targetTop = scrollArea.scrollTop + target.getBoundingClientRect().top - scrollArea.getBoundingClientRect().top - stickyOffset
      scrollArea.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' })
    }, 80)
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
        className="fixed inset-0 z-30 bg-[#10251f]/30 lg:hidden"
        onClick={onClose}
        type="button"
      />
      <aside className="fixed inset-x-0 bottom-0 z-40 max-h-[88dvh] overflow-hidden rounded-t-2xl border border-[#e0d1bb] bg-[#fffaf0] shadow-2xl lg:sticky lg:top-[88px] lg:z-10 lg:max-h-[calc(100dvh-112px)] lg:rounded-xl lg:shadow-sm">
        <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-[#c7d4ce] lg:hidden" />
        <div className="flex items-start justify-between gap-3 border-b border-[#eadcc8] p-4">
          <div className="min-w-0">
            <p className="text-sm font-black uppercase tracking-[0.14em] text-[#b45b38]">{city.region}</p>
            <h2 className="mt-1 text-2xl font-black text-[#10251f]">{city.name}</h2>
            <p className="mt-1 flex items-center gap-1 text-sm font-bold text-[#66726e]">
              <MapPin size={15} aria-hidden="true" />
              {cityManuallyVisited
                ? 'Manuel gezildi işaretli'
                : cityHasVisitedPlace
                  ? 'Checklist nedeniyle gezildi sayılıyor'
                  : 'Henüz gezildi işaretlenmedi'}
            </p>
          </div>
          <button
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#d8cbb8] bg-white text-[#324942] hover:bg-[#f4ead9]"
            onClick={onClose}
            title="Paneli kapat"
            type="button"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div
          className="max-h-[calc(88dvh-92px)] overflow-y-auto p-4 pb-[calc(20px+env(safe-area-inset-bottom))] lg:max-h-[calc(100dvh-206px)]"
          ref={scrollAreaRef}
        >
          <div className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-xl bg-[#f0eadf] p-4">
            <div>
              <p className="text-sm font-bold text-[#66726e]">Şehir keşfi</p>
              <p className="mt-1 text-3xl font-black text-[#10251f]">%{explore}</p>
              <p className="mt-1 text-sm font-bold text-[#66726e]">
                {completed} / {cityPlaces.length} yer tamamlandı
              </p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-xl font-black text-[#0f6b67] shadow-sm">
              {city.plate}
            </div>
          </div>

          <button
            className={clsx(
              'mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-md px-4 text-base font-black shadow-sm transition',
              cityManuallyVisited ? 'bg-[#fff0ec] text-[#a33d24]' : 'bg-[#0f6b67] text-white hover:bg-[#0b5c58]',
            )}
            onClick={() => onToggleCityVisited(city.id)}
            type="button"
          >
            <Check size={18} aria-hidden="true" />
            {cityManuallyVisited ? 'Şehir gezildi işaretini kaldır' : cityVisited ? 'Şehri ayrıca gezildi işaretle' : 'Bu şehre gittim'}
          </button>

          {city && districtPath && selectedDistrictFeatures.length > 0 && (
            <div className="sticky top-0 z-20 -mx-4 mt-4 border-y border-[#eadcc8] bg-[#fffaf0]/95 px-4 py-3 shadow-sm backdrop-blur lg:hidden">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-[#10251f]">{city.name} ilçe haritası</p>
                  <p className="text-xs font-bold text-[#66726e]">İlçeye dokun, listedeki yerine git.</p>
                </div>
                <span className="rounded-lg bg-white px-2 py-1 text-sm font-black text-[#0f6b67]">{city.plate}</span>
              </div>
              <div className="overflow-hidden rounded-xl border border-[#dfe8e3] bg-[#f7fbf8]">
                <svg className="block h-auto w-full" role="img" viewBox="0 0 330 190" aria-label={`${city.name} ilçe seçim haritası`}>
                  {selectedDistrictFeatures.map((feature) => {
                    const percentage = districtPercentage(feature, city, progress)
                    const fill = percentage >= 100 ? '#d9a441' : percentage >= 50 ? '#0f6b67' : percentage > 0 ? '#8fc7a8' : '#d8e0da'
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
            </div>
          )}

          <div className="mt-5 space-y-3">
            {placeDataError && <p className="rounded-md bg-[#fff0ec] px-3 py-2 text-sm font-semibold text-[#a33d24]">{placeDataError}</p>}

            {districtProgress.map((district) => {
              const open = openDistricts.includes(district.district)
              const selected = Boolean(selectedDistrict && normalizeTr(selectedDistrict) === normalizeTr(district.district))

              return (
                <section
                  id={`district-${city.id}-${normalizeTr(district.district)}`}
                  key={district.district}
                  className={clsx(
                    'overflow-hidden rounded-xl border bg-white',
                    selected ? 'border-[#0f6b67] ring-2 ring-[#b8dac8]' : 'border-[#eadcc8]',
                  )}
                >
                  <button
                    className={clsx('flex min-h-16 w-full items-center justify-between gap-3 px-3 py-3 text-left', selected && 'bg-[#edf7f2]')}
                    onClick={() => toggleDistrict(district.district)}
                    type="button"
                  >
                    <span>
                      <span className="block text-base font-black text-[#213a32]">
                        {district.district}
                        {selected && <span className="ml-2 text-xs font-black uppercase tracking-wide text-[#0f6b67]">Haritada seçili</span>}
                      </span>
                      <span className="mt-1 block text-sm font-bold text-[#66726e]">
                        {district.completed} / {district.total} tamamlandı
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="text-sm font-black text-[#0f6b67]">%{district.percentage}</span>
                      <ChevronDown className={clsx('transition', open && 'rotate-180')} size={18} aria-hidden="true" />
                    </span>
                  </button>
                  <div className="mx-3 mb-3 h-1.5 overflow-hidden rounded-full bg-[#e8dfd1]">
                    <div className="h-full rounded-full bg-[#d88355] transition-all duration-500" style={{ width: `${district.percentage}%` }} />
                  </div>
                  {open && (
                    <div className="border-t border-[#eadcc8]">
                      {district.places.map((place) => {
                        const checked = progress.visitedPlaceIds.includes(place.id)
                        const detailsOpen = openPlaceIds.includes(place.id)
                        const summary = summariesByPlace[place.id]
                        const saving = savingPlaceIds.includes(place.id)
                        const savedNote = savedNotesByPlace[place.id]?.trim() ?? ''
                        const editingNote = editingNotePlaceIds.includes(place.id) || !savedNote

                        return (
                          <div className="border-b border-[#f0e4d2] px-3 py-3 last:border-b-0" key={place.id}>
                            <div className="flex min-h-14 items-start gap-3">
                              <button
                                aria-label={checked ? `${place.name} gezildi işaretini kaldır` : `${place.name} gezildi işaretle`}
                                className={clsx(
                                  'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition',
                                  checked ? 'border-[#0f6b67] bg-[#0f6b67] text-white' : 'border-[#cdd8d2] bg-[#fbfcfb] text-transparent',
                                )}
                                onClick={() => onTogglePlace(city.id, place.id)}
                                type="button"
                              >
                                <Check size={17} aria-hidden="true" />
                              </button>
                              <div className="min-w-0 flex-1">
                                <p className={clsx('text-sm font-black text-[#243a34]', checked && 'line-through opacity-60')}>
                                  {place.name}
                                </p>
                                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#7a8782]">
                                  {place.district} · {place.category} · {priorityLabel[place.priority] ?? place.priority}
                                </p>
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-black text-[#66726e]">
                                  <span className="inline-flex items-center gap-1 rounded-md bg-[#f3f0e9] px-2 py-1">
                                    <Star size={13} aria-hidden="true" />
                                    {summary?.voteCount ? `${summary.averageRating}/10 · ${summary.voteCount} oy` : 'Puan yok'}
                                  </span>
                                  {ratingsByPlace[place.id] && (
                                    <span className="rounded-md bg-[#edf7f2] px-2 py-1 text-[#0f6b67]">Sen: {ratingsByPlace[place.id]}/10</span>
                                  )}
                                  {savedNote && (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-[#fff7eb] px-2 py-1 text-[#a05a1f]">
                                      <MessageSquare size={13} aria-hidden="true" />
                                      Not var
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                aria-label="Not ve puan"
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#d8cbb8] bg-white text-[#324942] hover:bg-[#f4ead9]"
                                onClick={() => togglePlaceDetails(place.id)}
                                title="Not ve puan"
                                type="button"
                              >
                                <MessageSquare size={16} aria-hidden="true" />
                              </button>
                            </div>

                            {detailsOpen && (
                              <div className="mt-3 rounded-xl bg-[#f7f1e8] p-3">
                                <div className="grid gap-3">
                                  <div>
                                    <p className="text-xs font-black uppercase tracking-wide text-[#66726e]">
                                    Puan
                                    </p>
                                    <div className="mt-2 grid grid-cols-5 gap-2">
                                      {Array.from({ length: 10 }, (_, index) => index + 1).map((rating) => (
                                        <button
                                          className={clsx(
                                            'h-10 rounded-lg border text-sm font-black transition',
                                            ratingsByPlace[place.id] === rating
                                              ? 'border-[#0f6b67] bg-[#0f6b67] text-white'
                                              : 'border-[#d8cbb8] bg-white text-[#263a34] hover:bg-[#f4ead9]',
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
                                        className="mt-2 text-xs font-black text-[#a33d24]"
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
                                      <p className="text-xs font-black uppercase tracking-wide text-[#66726e]">Yorum / Not</p>
                                      {savedNote && !editingNote && (
                                        <button
                                          className="text-xs font-black text-[#0f6b67]"
                                          disabled={saving}
                                          onClick={() => setNoteEditing(place.id, true)}
                                          type="button"
                                        >
                                          Düzenle
                                        </button>
                                      )}
                                    </div>

                                    {savedNote && !editingNote ? (
                                      <div className="mt-2 rounded-xl border border-[#eadcc8] bg-white/70 px-3 py-2 text-sm font-semibold leading-6 text-[#4f5d56]">
                                        {savedNote}
                                      </div>
                                    ) : (
                                      <label className="block" htmlFor={`${place.id}-note`}>
                                        <textarea
                                          className="mt-2 min-h-24 w-full resize-y rounded-lg border border-[#d6ddda] bg-white px-3 py-2 text-sm font-semibold normal-case text-[#243a34] outline-none ring-[#0f6b67] focus:ring-2"
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

                                <div className="mt-3 flex items-center justify-end gap-2">
                                  <button
                                    className="flex h-9 w-9 items-center justify-center rounded-md border border-[#e2c6bd] text-[#a33d24] hover:bg-[#fff0ec]"
                                    disabled={saving}
                                    onClick={() => void handleNoteDelete(place)}
                                    title="Notu sil"
                                    type="button"
                                  >
                                    <Trash2 size={15} aria-hidden="true" />
                                  </button>
                                  {editingNote ? (
                                    <button
                                      className="h-10 rounded-lg bg-[#0f6b67] px-4 text-sm font-black text-white hover:bg-[#0b5c58] disabled:opacity-60"
                                      disabled={saving}
                                      onClick={() => void handleNoteSave(place)}
                                      type="button"
                                    >
                                      {saving ? 'Kaydediliyor' : 'Notu kaydet'}
                                    </button>
                                  ) : (
                                    <button
                                      className="h-10 rounded-lg border border-[#d8cbb8] bg-white px-4 text-sm font-black text-[#4f5d56]"
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
