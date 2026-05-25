import { connectDb } from '../config/db.js'
import { City } from '../models/City.js'
import { Place } from '../models/Place.js'
import { cities } from '../../../src/data/cities.ts'
import { places } from '../../../src/data/places.ts'

await connectDb()

const cityNameById = new Map(cities.map((city) => [city.id, city.name]))

await City.bulkWrite(
  cities.map((city) => ({
    updateOne: {
      filter: { cityId: city.id },
      update: {
        $set: {
          cityId: city.id,
          plateCode: city.plate,
          name: city.name,
          region: city.region,
        },
      },
      upsert: true,
    },
  })),
)

await City.deleteMany({ cityId: { $nin: cities.map((city) => city.id) } })

await Place.bulkWrite(
  places.map((place) => ({
    updateOne: {
      filter: { placeId: place.id },
      update: {
        $set: {
          placeId: place.id,
          cityId: place.cityId,
          plateCode: place.plateCode,
          city: cityNameById.get(place.cityId) ?? '',
          district: place.district,
          name: place.name,
          category: place.category,
          priority: place.priority,
        },
      },
      upsert: true,
    },
  })),
)

await Place.deleteMany({ placeId: { $nin: places.map((place) => place.id) } })

console.log(`Seed tamamlandı: ${cities.length} şehir, ${places.length} yer upsert edildi.`)
process.exit(0)
