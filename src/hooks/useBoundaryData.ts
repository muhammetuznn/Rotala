import { useEffect, useState } from 'react'
import type { DistrictCollection, ProvinceCollection } from '../types/geo'

type BoundaryData = {
  provinces: ProvinceCollection | null
  districts: DistrictCollection | null
  loading: boolean
  error: string
}

export function useBoundaryData(): BoundaryData {
  const [provinces, setProvinces] = useState<ProvinceCollection | null>(null)
  const [districts, setDistricts] = useState<DistrictCollection | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true

    Promise.all([
      fetch('/geo/turkey-provinces.geojson').then((response) => response.json()),
      fetch('/geo/turkey-districts.geojson').then((response) => response.json()),
    ])
      .then(([provinceData, districtData]) => {
        if (!alive) return
        setProvinces(provinceData)
        setDistricts(districtData)
      })
      .catch(() => {
        if (!alive) return
        setError('Harita sınır verisi yüklenemedi.')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [])

  return { provinces, districts, loading, error }
}
