import { Router } from 'express'
import { City } from '../models/City.js'
import { Place } from '../models/Place.js'
import { UserPlaceRating } from '../models/UserPlaceRating.js'
import { HttpError } from '../utils/httpError.js'

const router = Router()

router.get('/', async (_req, res, next) => {
  try {
    const cities = await City.find().sort({ cityId: 1 }).lean()
    res.json({ cities })
  } catch (error) {
    next(error)
  }
})

router.get('/:cityId', async (req, res, next) => {
  try {
    const city = await City.findOne({ cityId: Number(req.params.cityId) }).lean()
    if (!city) throw new HttpError(404, 'Şehir bulunamadı.')
    res.json({ city })
  } catch (error) {
    next(error)
  }
})

router.get('/:cityId/places', async (req, res, next) => {
  try {
    const places = await Place.find({ cityId: Number(req.params.cityId) }).sort({ district: 1, name: 1 }).lean()
    res.json({ places })
  } catch (error) {
    next(error)
  }
})

router.get('/:cityId/rating-summary', async (req, res, next) => {
  try {
    const cityId = Number(req.params.cityId)
    const [summary] = await UserPlaceRating.aggregate([
      { $match: { cityId } },
      { $group: { _id: '$cityId', averageRating: { $avg: '$rating' }, voteCount: { $sum: 1 } } },
    ])

    res.json({
      cityId,
      averageRating: summary ? Math.round(summary.averageRating * 10) / 10 : null,
      voteCount: summary?.voteCount ?? 0,
    })
  } catch (error) {
    next(error)
  }
})

export default router
