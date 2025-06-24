// backend/models/Room.ts
import mongoose from 'mongoose'

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  canvasData: { type: Object, default: {} },
  isPrivate: { type: Boolean, default: false },
})

export const Room = mongoose.model('Room', roomSchema)
