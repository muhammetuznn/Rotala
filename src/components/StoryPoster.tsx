import { useMemo, useRef, useState } from 'react'
import { Check, Download, Link, Share2 } from 'lucide-react'
import { geoMercator, geoPath } from 'd3-geo'
import { cities } from '../data/cities'
import { cityFromProvince } from '../lib/geo'
import { getTurkeyStats, isCityVisited } from '../lib/progress'
import type { UserProgress } from '../types/domain'
import type { ProvinceCollection, ProvinceFeature } from '../types/geo'

type StoryPosterProps = {
  progress: UserProgress
  provinces: ProvinceCollection | null
}

const posterStyle = `
  .poster-title { font-family: "Cormorant Garamond", Georgia, serif; font-size: 134px; font-weight: 700; letter-spacing: 0; fill: #f1e4c8; }
  .poster-brand { font-family: "Cormorant Garamond", Georgia, serif; font-size: 44px; font-weight: 700; fill: #f1e4c8; }
  .poster-kicker { font-family: Inter, Arial, sans-serif; font-size: 22px; font-weight: 800; letter-spacing: 5px; text-transform: uppercase; fill: #c49a4a; }
  .poster-body { font-family: Inter, Arial, sans-serif; font-size: 34px; font-weight: 700; fill: #c9bea6; }
  .poster-small { font-family: Inter, Arial, sans-serif; font-size: 24px; font-weight: 800; letter-spacing: 2.6px; text-transform: uppercase; fill: #958b78; }
  .poster-stat-label { font-family: Inter, Arial, sans-serif; font-size: 23px; font-weight: 800; letter-spacing: 2.5px; text-transform: uppercase; fill: #9f9582; }
  .poster-stat-value { font-family: "Cormorant Garamond", Georgia, serif; font-size: 78px; font-weight: 700; fill: #efe1bf; }
  .poster-city { font-family: Inter, Arial, sans-serif; font-size: 17px; font-weight: 900; fill: rgba(241, 228, 200, 0.78); }
`

async function svgToPngBlob(svg: SVGSVGElement) {
  const serialized = new XMLSerializer().serializeToString(svg)
  const blob = new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image()
      element.onload = () => resolve(element)
      element.onerror = reject
      element.src = url
    })

    const canvas = document.createElement('canvas')
    canvas.width = 1080
    canvas.height = 1920
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas kullanılamıyor')

    context.drawImage(image, 0, 0, 1080, 1920)

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((pngBlob) => {
        if (pngBlob) resolve(pngBlob)
        else reject(new Error('Poster oluşturulamadı'))
      }, 'image/png', 0.96)
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export function StoryPoster({ progress, provinces }: StoryPosterProps) {
  const posterRef = useRef<SVGSVGElement | null>(null)
  const [copied, setCopied] = useState(false)
  const [busyAction, setBusyAction] = useState<'download' | 'share' | null>(null)
  const stats = useMemo(() => getTurkeyStats(progress), [progress])
  const mapPath = useMemo(() => {
    if (!provinces) return null
    const projection = geoMercator().fitSize([940, 520], provinces)
    return geoPath(projection)
  }, [provinces])

  const visitedCityIds = useMemo(() => {
    return new Set(cities.filter((city) => isCityVisited(city, progress)).map((city) => city.id))
  }, [progress])

  async function createPosterBlob() {
    if (!posterRef.current) throw new Error('Poster hazır değil')
    return svgToPngBlob(posterRef.current)
  }

  async function handleDownload() {
    setBusyAction('download')
    try {
      downloadBlob(await createPosterBlob(), 'rotala-iz-biraktin.png')
    } finally {
      setBusyAction(null)
    }
  }

  async function handleShare() {
    setBusyAction('share')
    try {
      const blob = await createPosterBlob()
      const file = new File([blob], 'rotala-iz-biraktin.png', { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          text: `Türkiye'nin %${stats.cityPercentage}'sini keşfettim. #RotaladaİzBırak`,
          title: 'Rotala iz posterim',
        })
      } else {
        downloadBlob(blob, 'rotala-iz-biraktin.png')
      }
    } finally {
      setBusyAction(null)
    }
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <section className="story-share-panel" aria-label="Instagram hikaye posteri önizlemesi">
      <div className="story-preview-frame">
        <svg
          ref={posterRef}
          className="story-poster"
          role="img"
          viewBox="0 0 1080 1920"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Rotala Instagram hikaye paylaşım posteri"
        >
          <defs>
            <linearGradient id="posterBackground" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#10241e" />
              <stop offset="0.54" stopColor="#071611" />
              <stop offset="1" stopColor="#030806" />
            </linearGradient>
            <radialGradient id="posterGoldGlow" cx="49%" cy="41%" r="46%">
              <stop offset="0" stopColor="#c49a4a" stopOpacity="0.18" />
              <stop offset="0.62" stopColor="#c49a4a" stopOpacity="0.06" />
              <stop offset="1" stopColor="#c49a4a" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="posterGold" x1="0" x2="1">
              <stop offset="0" stopColor="#dfbd73" />
              <stop offset="1" stopColor="#b17c38" />
            </linearGradient>
            <pattern id="posterGrid" width="54" height="54" patternUnits="userSpaceOnUse">
              <path d="M 54 0 L 0 0 0 54" fill="none" stroke="#d8c8a7" strokeOpacity="0.055" strokeWidth="1" />
            </pattern>
            <filter id="posterShadow" colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="24" stdDeviation="22" floodColor="#000000" floodOpacity="0.36" />
            </filter>
          </defs>
          <style>{posterStyle}</style>

          <rect width="1080" height="1920" fill="url(#posterBackground)" />
          <rect width="1080" height="1920" fill="url(#posterGrid)" opacity="0.9" />
          <rect width="1080" height="1920" fill="url(#posterGoldGlow)" />
          <path d="M84 128H996V1792H84Z" fill="none" stroke="#d8c8a7" strokeOpacity="0.13" strokeWidth="2" />
          <path d="M128 84H952" stroke="#c49a4a" strokeOpacity="0.55" strokeWidth="3" />

          <g transform="translate(132 170)">
            <circle cx="38" cy="38" r="38" fill="#d8c8a7" fillOpacity="0.1" stroke="#d8c8a7" strokeOpacity="0.3" strokeWidth="2" />
            <text x="38" y="51" textAnchor="middle" className="poster-brand">R</text>
            <text x="96" y="33" className="poster-brand">Rotala</text>
            <text x="98" y="65" className="poster-small">Premium seyahat atlası</text>
          </g>

          <text x="132" y="400" className="poster-kicker">Türkiye atlasın</text>
          <text x="132" y="526" className="poster-title">İz bıraktın.</text>
          <text x="132" y="588" className="poster-body">Keşfettiklerin senin hikayen.</text>

          <g transform="translate(70 682)" filter="url(#posterShadow)">
            <rect x="0" y="0" width="940" height="600" rx="8" fill="#06110e" fillOpacity="0.38" stroke="#d8c8a7" strokeOpacity="0.1" />
            {mapPath && provinces ? (
              <g transform="translate(0 40)">
                {provinces.features.map((feature) => {
                  const city = cityFromProvince(feature as ProvinceFeature)
                  if (!city) return null
                  const visited = visitedCityIds.has(city.id)
                  const centroid = mapPath.centroid(feature)

                  return (
                    <g key={feature.properties.GID_1}>
                      <path
                        d={mapPath(feature) ?? undefined}
                        fill={visited ? 'url(#posterGold)' : '#22342f'}
                        stroke={visited ? '#f0cf86' : '#4e6259'}
                        strokeOpacity={visited ? 0.72 : 0.42}
                        strokeWidth={visited ? 2.2 : 1.1}
                      />
                      <text className="poster-city" dominantBaseline="middle" textAnchor="middle" x={centroid[0]} y={centroid[1]}>
                        {city.plate}
                      </text>
                      {visited && (
                        <g transform={`translate(${centroid[0]} ${centroid[1] - 26})`}>
                          <path d="M0 -18C-12 -18 -21 -9 -21 2C-21 18 0 34 0 34C0 34 21 18 21 2C21 -9 12 -18 0 -18Z" fill="#f1bc62" stroke="#fff1bf" strokeOpacity="0.72" strokeWidth="2" />
                          <circle cx="0" cy="2" r="6" fill="#071611" fillOpacity="0.78" />
                        </g>
                      )}
                    </g>
                  )
                })}
              </g>
            ) : (
              <text x="470" y="300" textAnchor="middle" className="poster-body">Harita hazırlanıyor</text>
            )}
          </g>

          <text x="132" y="1378" className="poster-body">Türkiye’nin %{stats.cityPercentage}’sini keşfettin.</text>
          <text x="132" y="1432" className="poster-small">Yolculuğun devam ediyor.</text>

          <g transform="translate(112 1508)">
            <rect x="0" y="0" width="856" height="180" rx="8" fill="#0b1c17" fillOpacity="0.82" stroke="#d8c8a7" strokeOpacity="0.16" />
            <g transform="translate(48 44)">
              <text className="poster-stat-label" x="0" y="0">Şehir</text>
              <text className="poster-stat-value" x="0" y="84">{stats.visitedCityCount} / 81</text>
            </g>
            <g transform="translate(358 44)">
              <text className="poster-stat-label" x="0" y="0">Keşif</text>
              <text className="poster-stat-value" x="0" y="84">%{stats.cityPercentage}</text>
            </g>
            <g transform="translate(620 44)">
              <text className="poster-stat-label" x="0" y="0">İz</text>
              <text className="poster-stat-value" x="0" y="84">{stats.visitedCityCount}</text>
            </g>
          </g>

          <text x="540" y="1780" textAnchor="middle" className="poster-body">{stats.visitedCityCount} / 81 şehir keşfedildi</text>
          <text x="540" y="1842" textAnchor="middle" className="poster-small">#RotaladaİzBırak</text>
        </svg>
      </div>

      <div className="story-actions" aria-label="Poster paylaşım aksiyonları">
        <button onClick={handleDownload} type="button" disabled={busyAction !== null}>
          <Download size={17} aria-hidden="true" />
          <span>{busyAction === 'download' ? 'Hazırlanıyor' : 'Posteri indir'}</span>
        </button>
        <button onClick={handleShare} type="button" disabled={busyAction !== null}>
          <Share2 size={17} aria-hidden="true" />
          <span>{busyAction === 'share' ? 'Açılıyor' : 'Hikaye olarak paylaş'}</span>
        </button>
        <button onClick={handleCopyLink} type="button">
          {copied ? <Check size={17} aria-hidden="true" /> : <Link size={17} aria-hidden="true" />}
          <span>{copied ? 'Kopyalandı' : 'Bağlantıyı kopyala'}</span>
        </button>
      </div>
    </section>
  )
}
