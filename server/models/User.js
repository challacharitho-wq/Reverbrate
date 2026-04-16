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
    likedSongs: [
      {
        youtubeId: {
          type: String,
          default: '',
          trim: true,
        },
        title: {
          type: String,
          default: '',
          trim: true,
        },
        artist: {
          type: String,
          default: '',
          trim: true,
        },
        thumbnail: {
          type: String,
          default: '',
          trim: true,
        },
        likedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    preferredArtists: [
      {
        type: String,
        trim: true,
      },
    ],
    onboardingDone: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: 'users' },
)

export default mongoose.models.User || mongoose.model('User', userSchema)
