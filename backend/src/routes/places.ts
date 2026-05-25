import { Router } from 'express'
import { Place } from '../models/Place.js'
import { UserPlaceRating } from '../models/UserPlaceRating.js'
import { HttpError } from '../utils/httpError.js'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    const filter = req.query.cityId ? { cityId: Number(req.query.cityId) } : {}
    const places = await Place.find(filter).sort({ cityId: 1, district: 1, name: 1 }).lean()
    res.json({ places })
  } catch (error) {
    next(error)
  }
})

router.get('/:placeId', async (req, res, next) => {
  try {
    const place = await Place.findOne({ placeId: req.params.placeId }).lean()
    if (!place) throw new HttpError(404, 'Gezilecek yer bulunamadı.')
    res.json({ place })
  } catch (error) {
    next(error)
  }
})

router.get('/:placeId/rating-summary', async (req, res, next) => {
  try {
    const placeId = req.params.placeId
    const [summary] = await UserPlaceRating.aggregate([
      { $match: { placeId } },
      { $group: { _id: '$placeId', averageRating: { $avg: '$rating' }, voteCount: { $sum: 1 } } },
    ])

    res.json({
      placeId,
      averageRating: summary ? Math.round(summary.averageRating * 10) / 10 : null,
      voteCount: summary?.voteCount ?? 0,
    })
  } catch (error) {
    next(error)
  }
})

export default router
