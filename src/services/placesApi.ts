import type { Place } from '../types/domain'
import { apiFetch } from './api/client'

export type ApiPlace = Omit<Place, 'id'> & {
  placeId: string
  city: string
}

export async function getPlaces(cityId?: number) {
  const query = cityId ? `?cityId=${cityId}` : ''
  const response = await apiFetch<{ places: ApiPlace[] }>(`/places${query}`)
  return response.places
}

export async function getPlace(placeId: string) {
  const response = await apiFetch<{ place: ApiPlace }>(`/places/${placeId}`)
  return response.place
}

export async function getCityPlaces(cityId: number) {
  const response = await apiFetch<{ places: ApiPlace[] }>(`/cities/${cityId}/places`)
  return response.places
}
