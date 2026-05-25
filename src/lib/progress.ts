import { cities, regions } from '../data/cities'
import { places } from '../data/places'
import type { City, DistrictProgress, RegionName, UserProgress } from '../types/domain'

export const emptyProgress: UserProgress = {
  visitedCityIds: [],
  visitedPlaceIds: [],
  recentCityIds: [],
}

export function asPercentage(completed: number, total: number) {
  if (!total) return 0
  return Math.round((completed / total) * 100)
}

export function getCityPlaces(cityId: number) {
  return places.filter((place) => place.cityId === cityId)
}

export function isCityVisited(city: City, progress: UserProgress) {
  return isCityManuallyVisited(city, progress) || hasVisitedPlaceInCity(city.id, progress)
}

export function isCityManuallyVisited(city: City, progress: UserProgress) {
  return progress.visitedCityIds.includes(city.id)
}

export function hasVisitedPlaceInCity(cityId: number, progress: UserProgress) {
  return getCityPlaces(cityId).some((place) => progress.visitedPlaceIds.includes(place.id))
}

export function getCityExplorePercentage(cityId: number, progress: UserProgress) {
  const cityPlaces = getCityPlaces(cityId)
  const completed = cityPlaces.filter((place) => progress.visitedPlaceIds.includes(place.id)).length
  return asPercentage(completed, cityPlaces.length)
}

export function getDistrictProgress(cityId: number, progress: UserProgress): DistrictProgress[] {
  const byDistrict = new Map<string, DistrictProgress>()

  for (const place of getCityPlaces(cityId)) {
    const current = byDistrict.get(place.district) ?? {
      district: place.district,
      total: 0,
      completed: 0,
      percentage: 0,
      places: [],
    }

    current.total += 1
    current.completed += progress.visitedPlaceIds.includes(place.id) ? 1 : 0
    current.percentage = asPercentage(current.completed, current.total)
    current.places.push(place)
    byDistrict.set(place.district, current)
  }

  return Array.from(byDistrict.values()).sort((a, b) => a.district.localeCompare(b.district, 'tr'))
}

export function getTurkeyStats(progress: UserProgress) {
  const visitedCities = cities.filter((city) => isCityVisited(city, progress))
  const visitedPlaceCount = places.filter((place) => progress.visitedPlaceIds.includes(place.id)).length

  return {
    cityCount: cities.length,
    placeCount: places.length,
    visitedCityCount: visitedCities.length,
    visitedPlaceCount,
    cityPercentage: asPercentage(visitedCities.length, cities.length),
    explorePercentage: asPercentage(visitedPlaceCount, places.length),
  }
}

export function getRegionStats(progress: UserProgress) {
  return regions.map((region) => {
    const regionCities = cities.filter((city) => city.region === region)
    const completed = regionCities.filter((city) => isCityVisited(city, progress)).length

    return {
      region: region as RegionName,
      total: regionCities.length,
      completed,
      percentage: asPercentage(completed, regionCities.length),
    }
  })
}

export function markCityVisited(progress: UserProgress, cityId: number): UserProgress {
  const visitedCityIds = Array.from(new Set([...progress.visitedCityIds, cityId]))
  const recentCityIds = [cityId, ...progress.recentCityIds.filter((id) => id !== cityId)].slice(0, 5)

  return { ...progress, visitedCityIds, recentCityIds }
}

export function unmarkCityVisited(progress: UserProgress, cityId: number): UserProgress {
  return {
    ...progress,
    visitedCityIds: progress.visitedCityIds.filter((id) => id !== cityId),
    recentCityIds: progress.recentCityIds.filter((id) => id !== cityId || hasVisitedPlaceInCity(cityId, progress)),
  }
}

export function toggleCityVisited(progress: UserProgress, cityId: number): UserProgress {
  return progress.visitedCityIds.includes(cityId) ? unmarkCityVisited(progress, cityId) : markCityVisited(progress, cityId)
}

export function togglePlace(progress: UserProgress, cityId: number, placeId: string): UserProgress {
  const isAddingPlace = !progress.visitedPlaceIds.includes(placeId)
  const visitedPlaceIds = isAddingPlace ? [...progress.visitedPlaceIds, placeId] : progress.visitedPlaceIds.filter((id) => id !== placeId)

  if (!isAddingPlace) {
    return { ...progress, visitedPlaceIds }
  }

  const recentCityIds = [cityId, ...progress.recentCityIds.filter((id) => id !== cityId)].slice(0, 5)
  return { ...progress, visitedPlaceIds, recentCityIds }
}

export function getCityTone(city: City, progress: UserProgress) {
  const explore = getCityExplorePercentage(city.id, progress)
  const visited = isCityVisited(city, progress)

  if (explore >= 75) return 'complete'
  if (explore >= 35) return 'active'
  if (visited) return 'visited'
  return 'empty'
}
