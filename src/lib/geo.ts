import type { Feature, FeatureCollection } from 'geojson'
import { cities } from '../data/cities'
import { getDistrictProgress } from './progress'
import type { DistrictFeature, ProvinceCollection, ProvinceFeature } from '../types/geo'
import type { City, UserProgress } from '../types/domain'

export function plateFromIso(iso?: string) {
  if (!iso || iso === 'NA') return ''
  return iso.replace('TR-', '').padStart(2, '0')
}

const provinceNameToPlate: Record<string, string> = {
  adiyaman: '02',
  afyon: '03',
  agri: '04',
  aydin: '09',
  balikesir: '10',
  bartin: '74',
  bingol: '12',
  canakkale: '17',
  cankiri: '18',
  corum: '19',
  diyarbakir: '21',
  duzce: '81',
  elazig: '23',
  eskisehir: '26',
  gumushane: '29',
  igdir: '76',
  istanbul: '34',
  izmir: '35',
  kmaras: '46',
  karabuk: '78',
  kinkkale: '71',
  kirikkale: '71',
  kirklareli: '39',
  kirsehir: '40',
  kutahya: '43',
  mugla: '48',
  mus: '49',
  nevsehir: '50',
  nigde: '51',
  sanliurfa: '63',
  sirnak: '73',
  tekirdag: '59',
  usak: '64',
  zinguldak: '67',
  zonguldak: '67',
}

function plateFromProvinceFeature(feature: ProvinceFeature) {
  return plateFromIso(feature.properties.ISO_1) || provinceNameToPlate[normalizeTr(feature.properties.NAME_1)] || ''
}

export function cityFromProvince(feature: ProvinceFeature) {
  const plate = plateFromProvinceFeature(feature)
  return cities.find((city) => city.plate === plate)
}

export function provinceFeatureForCity(provinces: ProvinceCollection | null, city?: City) {
  if (!provinces || !city) return undefined
  return provinces.features.find((feature) => plateFromProvinceFeature(feature) === city.plate)
}

export function featureCollectionFromFeatures(features: Feature[]): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features,
  }
}

export function normalizeTr(text: string) {
  return text
    .toLocaleLowerCase('tr')
    .replaceAll('ı', 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

export function districtPercentage(feature: DistrictFeature, city: City, progress: UserProgress) {
  const target = normalizeTr(feature.properties.NAME_2)
  const district = getDistrictProgress(city.id, progress).find((item) => normalizeTr(item.district) === target)
  return district?.percentage ?? 0
}
