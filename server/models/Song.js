import mongoose from 'mongoose'

const songSchema = new mongoose.Schema(
  {},
  { collection: 'songs', timestamps: true, strict: false },
)

export default mongoose.models.Song || mongoose.model('Song', songSchema)
