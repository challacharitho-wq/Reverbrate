import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    avatar: {
      type: String,
      default: '',
    },
    subscription: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: 'users' },
)

export default mongoose.models.User || mongoose.model('User', userSchema)
