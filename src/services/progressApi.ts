import type { UserProgress } from '../types/domain'
import { apiFetch } from './api/client'

export async function loadProgress(): Promise<UserProgress> {
  return apiFetch<UserProgress>('/me/progress')
}

export async function markCityVisited(cityId: number) {
  await apiFetch<void>(`/me/cities/${cityId}/visited`, { method: 'POST' })
}

export async function unmarkCityVisited(cityId: number) {
  await apiFetch<void>(`/me/cities/${cityId}/visited`, { method: 'DELETE' })
}

export async function markPlaceVisited(placeId: string) {
  await apiFetch<void>(`/me/places/${placeId}/visited`, { method: 'POST' })
}

export async function unmarkPlaceVisited(placeId: string) {
  await apiFetch<void>(`/me/places/${placeId}/visited`, { method: 'DELETE' })
}

export async function syncProgress(previous: UserProgress, next: UserProgress) {
  const previousCities = new Set(previous.visitedCityIds)
  const nextCities = new Set(next.visitedCityIds)
  const previousPlaces = new Set(previous.visitedPlaceIds)
  const nextPlaces = new Set(next.visitedPlaceIds)

  const requests: Promise<void>[] = []

  for (const cityId of nextCities) {
    if (!previousCities.has(cityId)) requests.push(markCityVisited(cityId))
  }

  for (const cityId of previousCities) {
    if (!nextCities.has(cityId)) requests.push(unmarkCityVisited(cityId))
  }

  for (const placeId of nextPlaces) {
    if (!previousPlaces.has(placeId)) requests.push(markPlaceVisited(placeId))
  }

  for (const placeId of previousPlaces) {
    if (!nextPlaces.has(placeId)) requests.push(unmarkPlaceVisited(placeId))
  }

  await Promise.all(requests)
}
