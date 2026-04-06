import mongoose from 'mongoose'

const historySchema = new mongoose.Schema(
  {},
  { collection: 'histories', timestamps: true, strict: false },
)

export default mongoose.models.History || mongoose.model('History', historySchema)
