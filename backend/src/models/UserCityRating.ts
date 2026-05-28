import { Schema, model, Types } from 'mongoose'

const userCityRatingSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    cityId: { type: Number, required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 10 },
  },
  { timestamps: true },
)

userCityRatingSchema.index({ userId: 1, cityId: 1 }, { unique: true })

export const UserCityRating = model('UserCityRating', userCityRatingSchema)
