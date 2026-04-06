import mongoose from 'mongoose'

const artistSchema = new mongoose.Schema(
  {},
  { collection: 'artists', timestamps: true, strict: false },
)

export default mongoose.models.Artist || mongoose.model('Artist', artistSchema)
