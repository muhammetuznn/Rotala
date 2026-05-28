import { useMemo, useRef, useState } from 'react'
import { Download, Smartphone } from 'lucide-react'
import { geoMercator, geoPath } from 'd3-geo'
import { cities } from '../data/cities'
import storyPosterBackground from '../assets/story-poster-cappadocia.png'
import { cityFromProvince } from '../lib/geo'
import { getTurkeyStats, isCityVisited } from '../lib/progress'
import type { UserProgress } from '../types/domain'
import type { ProvinceCollection, ProvinceFeature } from '../types/geo'

type StoryPosterProps = {
  progress: UserProgress
  provinces: ProvinceCollection | null
}

type ShareTarget = 'instagram' | 'facebook'

const posterStyle = `
  .poster-title { font-family: "Cormorant Garamond", Georgia, serif; font-size: 114px; font-weight: 700; letter-spacing: 0; fill: #fff1d6; }
  .poster-title-soft { font-family: "Cormorant Garamond", Georgia, serif; font-size: 88px; font-weight: 600; letter-spacing: 0; fill: rgba(255, 241, 214, 0.86); }
  .poster-brand { font-family: "Cormorant Garamond", Georgia, serif; font-size: 42px; font-weight: 700; fill: #f1e4c8; }
  .poster-kicker { font-family: Inter, Arial, sans-serif; font-size: 17px; font-weight: 850; letter-spacing: 5.8px; text-transform: uppercase; fill: #f1bd68; }
  .poster-body { font-family: Inter, Arial, sans-serif; font-size: 28px; font-weight: 650; fill: rgba(255, 242, 220, 0.78); }
  .poster-small { font-family: Inter, Arial, sans-serif; font-size: 19px; font-weight: 850; letter-spacing: 2.8px; text-transform: uppercase; fill: rgba(255, 239, 210, 0.58); }
  .poster-stat-label { font-family: Inter, Arial, sans-serif; font-size: 18px; font-weight: 850; letter-spacing: 3.1px; text-transform: uppercase; fill: rgba(255, 239, 210, 0.58); }
  .poster-stat-value { font-family: "Cormorant Garamond", Georgia, serif; font-size: 78px; font-weight: 700; fill: #fff1d6; }
  .poster-city { font-family: Inter, Arial, sans-serif; font-size: 10.5px; font-weight: 850; fill: rgba(255, 241, 214, 0.44); }
  .poster-city--visited { font-size: 9.5px; fill: rgba(5, 18, 18, 0.68); }
`

const visitedPosterColors = ['#f0b85d', '#d96f55', '#40b8aa', '#a98be4', '#e7c84f', '#5fb2d6']
const appShareUrl = 'https://rotala.online'
const appShareLabel = 'rotala.online'
const androidApkUrl = '/downloads/Rotala.apk'

async function blobToDataUrl(blob: Blob) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

async function inlineSvgImages(svg: SVGSVGElement) {
  const clone = svg.cloneNode(true) as SVGSVGElement
  const images = Array.from(clone.querySelectorAll('image'))

  await Promise.all(images.map(async (image) => {
    const href = image.getAttribute('href') ?? image.getAttribute('xlink:href')
    if (!href || href.startsWith('data:')) return
    const response = await fetch(href)
    const dataUrl = await blobToDataUrl(await response.blob())
    image.setAttribute('href', dataUrl)
  }))

  return clone
}

async function svgToPngBlob(svg: SVGSVGElement) {
  const serialized = new XMLSerializer().serializeToString(await inlineSvgImages(svg))
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

function openShareFallback(target: ShareTarget) {
  if (target === 'instagram') {
    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer')
    return
  }

  if (target === 'facebook') {
    const shareUrl = new URL('https://www.facebook.com/sharer/sharer.php')
    shareUrl.searchParams.set('u', appShareUrl)
    window.open(shareUrl.toString(), '_blank', 'noopener,noreferrer')
  }
}

function SocialGlyph({ target }: { target: ShareTarget }) {
  if (target === 'instagram') {
    return (
      <span className="social-glyph social-glyph--instagram" aria-hidden="true">
        <span />
      </span>
    )
  }

  if (target === 'facebook') {
    return <span className="social-glyph social-glyph--facebook" aria-hidden="true" />
  }

  return null
}

export function StoryPoster({ progress, provinces }: StoryPosterProps) {
  const posterRef = useRef<SVGSVGElement | null>(null)
  const [busyAction, setBusyAction] = useState<'download' | ShareTarget | null>(null)
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

  async function handleShare(target: ShareTarget) {
    setBusyAction(target)
    try {
      const blob = await createPosterBlob()
      const file = new File([blob], 'rotala-iz-biraktin.png', { type: 'image/png' })
      const text = `Türkiye haritan %${stats.cityPercentage} renkleniyor. Sen de kendi haritanı oluştur: ${appShareUrl} #RotaladaİzBırak`

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          text,
          title: 'Rotala keşif posterin',
          url: appShareUrl,
        })
      } else {
        downloadBlob(blob, 'rotala-iz-biraktin.png')
        openShareFallback(target)
      }
    } finally {
      setBusyAction(null)
    }
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
              <stop offset="0" stopColor="#092524" />
              <stop offset="0.48" stopColor="#102b27" />
              <stop offset="1" stopColor="#1f150d" />
            </linearGradient>
            <linearGradient id="posterGold" x1="0" x2="1">
              <stop offset="0" stopColor="#e6c87a" />
              <stop offset="0.52" stopColor="#c99b48" />
              <stop offset="1" stopColor="#9d6e31" />
            </linearGradient>
            <pattern id="posterGrid" width="54" height="54" patternUnits="userSpaceOnUse">
              <path d="M 54 0 L 0 0 0 54" fill="none" stroke="#fff1d6" strokeOpacity="0.035" strokeWidth="1" />
            </pattern>
          </defs>
          <style>{posterStyle}</style>

          <rect width="1080" height="1920" fill="url(#posterBackground)" />
          <image href={storyPosterBackground} width="1080" height="1920" preserveAspectRatio="xMidYMid slice" opacity="0.78" />
          <rect width="1080" height="1920" fill="#031313" opacity="0.48" />
          <rect width="1080" height="1920" fill="url(#posterGrid)" opacity="0.7" />
          <path d="M80 126H1000V1794H80Z" fill="none" stroke="#fff1d6" strokeOpacity="0.13" strokeWidth="2" />
          <path d="M128 84H952" stroke="#f0b85d" strokeOpacity="0.5" strokeWidth="3" />
          <path d="M128 1836H952" stroke="#fff1d6" strokeOpacity="0.17" strokeWidth="2" />

          <g transform="translate(132 170)">
            <circle cx="38" cy="38" r="38" fill="#d8c8a7" fillOpacity="0.08" stroke="#d8c8a7" strokeOpacity="0.26" strokeWidth="2" />
            <text x="38" y="51" textAnchor="middle" className="poster-brand">R</text>
            <text x="96" y="33" className="poster-brand">Rotala</text>
            <text x="98" y="65" className="poster-small">Hikaye atlası</text>
          </g>

          <text x="132" y="396" className="poster-kicker">Türkiye seninle renklenir</text>
          <text x="132" y="508" className="poster-title">Yollar</text>
          <text x="132" y="604" className="poster-title-soft">seni çağırdı.</text>
          <text x="132" y="666" className="poster-body">Sen gittikçe harita hikayeye dönüştü.</text>

          <g transform="translate(70 754)">
            {mapPath && provinces ? (
              <g transform="translate(0 26)">
                {provinces.features.map((feature) => {
                  const city = cityFromProvince(feature as ProvinceFeature)
                  if (!city) return null
                  const visited = visitedCityIds.has(city.id)
                  const centroid = mapPath.centroid(feature)
                  const visitedFill = visitedPosterColors[city.id % visitedPosterColors.length]

                  return (
                    <g key={feature.properties.GID_1}>
                      <path
                        d={mapPath(feature) ?? undefined}
                        fill={visited ? visitedFill : 'rgba(20, 47, 43, 0.62)'}
                        stroke={visited ? '#fff0c8' : '#6c8076'}
                        strokeOpacity={visited ? 0.58 : 0.3}
                        strokeWidth={visited ? 1.45 : 0.9}
                      />
                      <text className={`poster-city${visited ? ' poster-city--visited' : ''}`} dominantBaseline="middle" textAnchor="middle" x={centroid[0]} y={centroid[1] + 1}>
                        {city.plate}
                      </text>
                      {visited && (
                        <g transform={`translate(${centroid[0]} ${centroid[1] - 13})`}>
                          <circle r="9" fill="#fff1d6" fillOpacity="0.2" />
                          <circle r="5.2" fill="#fff1d6" stroke={visitedFill} strokeOpacity="0.86" strokeWidth="1.5" />
                          <circle r="1.7" fill="#071611" fillOpacity="0.72" />
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

          <g transform="translate(112 1394)">
            <text x="0" y="0" className="poster-kicker">Keşif izlerin</text>
            <text x="0" y="80" className="poster-stat-value">{stats.visitedCityCount} şehir</text>
            <text x="0" y="132" className="poster-body">Her işaret yeni bir anı.</text>
          </g>

          <g transform="translate(112 1604)">
            <rect x="0" y="0" width="856" height="156" rx="8" fill="#06110e" fillOpacity="0.56" stroke="#fff1d6" strokeOpacity="0.16" />
            <g transform="translate(42 48)">
              <text className="poster-stat-label" x="0" y="0">Türkiye</text>
              <text className="poster-stat-value" x="0" y="72">{stats.visitedCityCount} / 81</text>
            </g>
            <g transform="translate(560 48)">
              <text className="poster-stat-label" x="0" y="0">Keşif</text>
              <text className="poster-stat-value" x="0" y="72">%{stats.cityPercentage}</text>
            </g>
          </g>

          <text x="540" y="1790" textAnchor="middle" className="poster-small">Rotala ile iz bırak</text>
          <g transform="translate(274 1818)">
            <rect width="532" height="72" rx="36" fill="#fff1d6" fillOpacity="0.1" stroke="#f0b85d" strokeOpacity="0.54" strokeWidth="2" />
            <text x="266" y="47" textAnchor="middle" className="poster-body">{appShareLabel}</text>
          </g>
          <text x="540" y="1916" textAnchor="middle" className="poster-small">haritana buradan başla</text>
        </svg>
      </div>

      <div className="story-actions" aria-label="Poster paylaşım aksiyonları">
        <button className="story-action story-action--primary" onClick={handleDownload} type="button" disabled={busyAction !== null}>
          <Download size={17} aria-hidden="true" />
          <span>{busyAction === 'download' ? 'Hazırlanıyor' : 'Posteri indir'}</span>
        </button>
        <button className="story-action story-action--instagram" onClick={() => handleShare('instagram')} type="button" disabled={busyAction !== null}>
          <SocialGlyph target="instagram" />
          <span>{busyAction === 'instagram' ? 'Açılıyor' : 'Instagram'}</span>
        </button>
        <button className="story-action story-action--facebook" onClick={() => handleShare('facebook')} type="button" disabled={busyAction !== null}>
          <SocialGlyph target="facebook" />
          <span>{busyAction === 'facebook' ? 'Açılıyor' : 'Facebook'}</span>
        </button>
        <a className="story-action story-action--android" href={androidApkUrl} download="Rotala.apk">
          <Smartphone size={17} aria-hidden="true" />
          <span>Android APK indir</span>
        </a>
      </div>
    </section>
  )
}
