import { Schema, model, Types } from 'mongoose'

const userPlaceRatingSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    cityId: { type: Number, required: true, index: true },
    placeId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 10 },
  },
  { timestamps: true },
)

userPlaceRatingSchema.index({ userId: 1, placeId: 1 }, { unique: true })

export const UserPlaceRating = model('UserPlaceRating', userPlaceRatingSchema)
