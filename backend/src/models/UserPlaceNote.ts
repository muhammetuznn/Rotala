import { Schema, model, Types } from 'mongoose'

const userPlaceNoteSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    cityId: { type: Number, required: true },
    placeId: { type: String, required: true },
    note: { type: String, required: true, default: '' },
    visitedDate: { type: Date },
    wouldVisitAgain: { type: Boolean },
  },
  { timestamps: true },
)

userPlaceNoteSchema.index({ userId: 1, placeId: 1 }, { unique: true })

export const UserPlaceNote = model('UserPlaceNote', userPlaceNoteSchema)
