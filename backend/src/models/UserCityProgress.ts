import { Schema, model, Types } from 'mongoose'

const userCityProgressSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    cityId: { type: Number, required: true },
    hasVisitedCity: { type: Boolean, required: true, default: true },
    visitedAt: { type: Date, default: Date.now },
    note: { type: String, default: '' },
  },
  { timestamps: true },
)

userCityProgressSchema.index({ userId: 1, cityId: 1 }, { unique: true })

export const UserCityProgress = model('UserCityProgress', userCityProgressSchema)
