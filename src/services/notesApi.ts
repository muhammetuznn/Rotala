import { apiFetch } from './api/client'

export type PlaceNoteInput = {
  note: string
  visitedDate?: string | null
  wouldVisitAgain?: boolean | null
}

export type PlaceNote = PlaceNoteInput & {
  cityId: number
  placeId: string
}

export async function getNotes() {
  const response = await apiFetch<{ notes: PlaceNote[] }>('/me/notes')
  return response.notes
}

export async function getPlaceNote(placeId: string) {
  const response = await apiFetch<{ note: PlaceNote | null }>(`/me/places/${placeId}/note`)
  return response.note
}

export async function savePlaceNote(placeId: string, input: PlaceNoteInput) {
  const response = await apiFetch<{ note: PlaceNote }>(`/me/places/${placeId}/note`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
  return response.note
}

export async function deletePlaceNote(placeId: string) {
  await apiFetch<void>(`/me/places/${placeId}/note`, { method: 'DELETE' })
}
