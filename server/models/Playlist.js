import mongoose from 'mongoose'

const playlistSongSchema = new mongoose.Schema(
  {
    youtubeId: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    artist: {
      type: String,
      default: 'Unknown artist',
      trim: true,
    },
    thumbnail: {
      type: String,
      default: '',
      trim: true,
    },
    duration: {
      type: String,
      default: '',
      trim: true,
    },
    sourceType: {
      type: String,
      default: 'youtube',
      trim: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
)

const playlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Playlist name is required'],
      trim: true,
      minlength: 1,
      maxlength: 80,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    tracks: {
      type: [playlistSongSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString()
        ret.userId = ret.user?.toString?.() ?? ret.user
        ret.songs = ret.tracks
        return ret
      },
    },
    toObject: {
      virtuals: true,
    },
  }
)

playlistSchema.index({ user: 1, createdAt: -1 })
playlistSchema.index({ user: 1, name: 1 })

const Playlist = mongoose.model('Playlist', playlistSchema)

export default Playlist
