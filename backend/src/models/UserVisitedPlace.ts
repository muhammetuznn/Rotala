import { Schema, model, Types } from 'mongoose'

const userVisitedPlaceSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    cityId: { type: Number, required: true },
    placeId: { type: String, required: true },
    visitedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

userVisitedPlaceSchema.index({ userId: 1, placeId: 1 }, { unique: true })

export const UserVisitedPlace = model('UserVisitedPlace', userVisitedPlaceSchema)
