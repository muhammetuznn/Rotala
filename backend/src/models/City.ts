import { Schema, model } from 'mongoose'

const citySchema = new Schema(
  {
    cityId: { type: Number, required: true, unique: true },
    plateCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    region: { type: String, required: true },
  },
  { timestamps: true },
)

export const City = model('City', citySchema)
