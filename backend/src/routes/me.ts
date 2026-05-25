import { Router } from 'express'
import { z } from 'zod'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'
import { Place } from '../models/Place.js'
import { UserCityProgress } from '../models/UserCityProgress.js'
import { UserPlaceNote } from '../models/UserPlaceNote.js'
import { UserPlaceRating } from '../models/UserPlaceRating.js'
import { UserVisitedPlace } from '../models/UserVisitedPlace.js'
import { HttpError } from '../utils/httpError.js'

const router = Router()
router.use(requireAuth)

const noteSchema = z.object({
  note: z.string().max(5000).default(''),
  visitedDate: z.coerce.date().optional().nullable(),
  wouldVisitAgain: z.boolean().optional().nullable(),
})

const ratingSchema = z.object({
  rating: z.number().int().min(1).max(10),
})

async function findPlace(placeId: string) {
  const place = await Place.findOne({ placeId }).lean()
  if (!place) throw new HttpError(404, 'Gezilecek yer bulunamadı.')
  return place
}

function userIdFrom(req: AuthenticatedRequest) {
  if (!req.user) throw new HttpError(401, 'Oturum gerekli.')
  return req.user.id
}

function paramAsString(value: string | string[] | undefined) {
  if (!value || Array.isArray(value)) throw new HttpError(400, 'Geçersiz parametre.')
  return value
}

async function ensureCityVisited(userId: string, cityId: number) {
  await UserCityProgress.updateOne(
    { userId, cityId },
    { $set: { hasVisitedCity: true }, $setOnInsert: { visitedAt: new Date() } },
    { upsert: true },
  )
}

router.get('/progress', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = userIdFrom(req)
    const [cityRows, placeRows] = await Promise.all([
      UserCityProgress.find({ userId, hasVisitedCity: true }).sort({ visitedAt: -1 }).lean(),
      UserVisitedPlace.find({ userId }).sort({ visitedAt: -1 }).lean(),
    ])

    const recentCityIds = Array.from(new Set([...cityRows, ...placeRows].sort((a, b) => +b.visitedAt - +a.visitedAt).map((row) => row.cityId))).slice(0, 5)

    res.json({
      visitedCityIds: cityRows.map((row) => row.cityId).sort((a, b) => a - b),
      visitedPlaceIds: placeRows.map((row) => row.placeId),
      recentCityIds,
    })
  } catch (error) {
    next(error)
  }
})

router.post('/cities/:cityId/visited', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = userIdFrom(req)
    const cityId = Number(req.params.cityId)
    await ensureCityVisited(userId, cityId)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

router.delete('/cities/:cityId/visited', async (req: AuthenticatedRequest, res, next) => {
  try {
    await UserCityProgress.deleteOne({ userId: userIdFrom(req), cityId: Number(req.params.cityId) })
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

router.post('/places/:placeId/visited', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = userIdFrom(req)
    const place = await findPlace(paramAsString(req.params.placeId))

    await UserVisitedPlace.updateOne(
      { userId, placeId: place.placeId },
      { $set: { cityId: place.cityId }, $setOnInsert: { visitedAt: new Date() } },
      { upsert: true },
    )

    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

router.delete('/places/:placeId/visited', async (req: AuthenticatedRequest, res, next) => {
  try {
    await UserVisitedPlace.deleteOne({ userId: userIdFrom(req), placeId: paramAsString(req.params.placeId) })
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

router.get('/notes', async (req: AuthenticatedRequest, res, next) => {
  try {
    const notes = await UserPlaceNote.find({ userId: userIdFrom(req) }).sort({ updatedAt: -1 }).lean()
    res.json({ notes })
  } catch (error) {
    next(error)
  }
})

router.get('/places/:placeId/note', async (req: AuthenticatedRequest, res, next) => {
  try {
    const note = await UserPlaceNote.findOne({ userId: userIdFrom(req), placeId: paramAsString(req.params.placeId) }).lean()
    res.json({ note })
  } catch (error) {
    next(error)
  }
})

router.put('/places/:placeId/note', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = userIdFrom(req)
    const place = await findPlace(paramAsString(req.params.placeId))
    const input = noteSchema.parse(req.body)
    const note = await UserPlaceNote.findOneAndUpdate(
      { userId, placeId: place.placeId },
      { $set: { cityId: place.cityId, note: input.note, visitedDate: input.visitedDate, wouldVisitAgain: input.wouldVisitAgain } },
      { new: true, upsert: true },
    ).lean()

    res.json({ note })
  } catch (error) {
    next(error)
  }
})

router.delete('/places/:placeId/note', async (req: AuthenticatedRequest, res, next) => {
  try {
    await UserPlaceNote.deleteOne({ userId: userIdFrom(req), placeId: paramAsString(req.params.placeId) })
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

router.put('/places/:placeId/rating', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = userIdFrom(req)
    const place = await findPlace(paramAsString(req.params.placeId))
    const input = ratingSchema.parse(req.body)
    const rating = await UserPlaceRating.findOneAndUpdate(
      { userId, placeId: place.placeId },
      { $set: { cityId: place.cityId, rating: input.rating } },
      { new: true, upsert: true },
    ).lean()

    res.json({ rating })
  } catch (error) {
    next(error)
  }
})

router.delete('/places/:placeId/rating', async (req: AuthenticatedRequest, res, next) => {
  try {
    await UserPlaceRating.deleteOne({ userId: userIdFrom(req), placeId: paramAsString(req.params.placeId) })
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

router.get('/ratings', async (req: AuthenticatedRequest, res, next) => {
  try {
    const ratings = await UserPlaceRating.find({ userId: userIdFrom(req) }).sort({ updatedAt: -1 }).lean()
    res.json({ ratings })
  } catch (error) {
    next(error)
  }
})

export default router
