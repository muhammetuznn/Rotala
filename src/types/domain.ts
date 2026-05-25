export type RegionName =
  | 'Marmara'
  | 'Ege'
  | 'Akdeniz'
  | 'İç Anadolu'
  | 'Karadeniz'
  | 'Doğu Anadolu'
  | 'Güneydoğu Anadolu'

export type PlaceCategory = string

export type PlacePriority = 'must_see' | 'recommended' | 'hidden_gem'

export type City = {
  id: number
  name: string
  slug: string
  plate: string
  region: RegionName
  x: number
  y: number
}

export type Place = {
  id: string
  cityId: number
  plateCode: string
  name: string
  district: string
  category: PlaceCategory
  priority: PlacePriority
}

export type UserProgress = {
  visitedCityIds: number[]
  visitedPlaceIds: string[]
  recentCityIds: number[]
}

export type DistrictProgress = {
  district: string
  total: number
  completed: number
  percentage: number
  places: Place[]
}
