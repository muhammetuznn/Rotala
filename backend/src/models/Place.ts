import { Schema, model } from 'mongoose'

const placeSchema = new Schema(
  {
    placeId: { type: String, required: true, unique: true },
    cityId: { type: Number, required: true, index: true },
    plateCode: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    priority: { type: String, required: true },
  },
  { timestamps: true },
)

export const Place = model('Place', placeSchema)
