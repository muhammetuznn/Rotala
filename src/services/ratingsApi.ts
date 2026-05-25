import { apiFetch } from './api/client'

export type RatingSummary = {
  placeId?: string
  cityId?: number
  averageRating: number | null
  voteCount: number
}

export type UserPlaceRating = {
  cityId: number
  placeId: string
  rating: number
}

export async function savePlaceRating(placeId: string, rating: number) {
  const response = await apiFetch<{ rating: UserPlaceRating }>(`/me/places/${placeId}/rating`, {
    method: 'PUT',
    body: JSON.stringify({ rating }),
  })
  return response.rating
}

export async function deletePlaceRating(placeId: string) {
  await apiFetch<void>(`/me/places/${placeId}/rating`, { method: 'DELETE' })
}

export async function getMyRatings() {
  const response = await apiFetch<{ ratings: UserPlaceRating[] }>('/me/ratings')
  return response.ratings
}

export async function getPlaceRatingSummary(placeId: string) {
  return apiFetch<RatingSummary>(`/places/${placeId}/rating-summary`)
}

export async function getCityRatingSummary(cityId: number) {
  return apiFetch<RatingSummary>(`/cities/${cityId}/rating-summary`)
}
