import type { City } from '../types/domain'
import { apiFetch } from './api/client'

export type ApiCity = {
  cityId: number
  plateCode: string
  name: string
  region: City['region']
}

export async function getCities() {
  const response = await apiFetch<{ cities: ApiCity[] }>('/cities')
  return response.cities
}

export async function getCity(cityId: number) {
  const response = await apiFetch<{ city: ApiCity }>(`/cities/${cityId}`)
  return response.city
}
