import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson'

export type BoundaryGeometry = Polygon | MultiPolygon

export type ProvinceProperties = {
  GID_1: string
  NAME_1: string
  ISO_1: string
}

export type DistrictProperties = {
  GID_1: string
  GID_2: string
  NAME_1: string
  NAME_2: string
}

export type ProvinceFeature = Feature<BoundaryGeometry, ProvinceProperties>
export type DistrictFeature = Feature<BoundaryGeometry, DistrictProperties>

export type ProvinceCollection = FeatureCollection<BoundaryGeometry, ProvinceProperties>
export type DistrictCollection = FeatureCollection<BoundaryGeometry, DistrictProperties>
