import mongoose from 'mongoose'

const playlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    tracks: [
      {
        youtubeId: String,
        title: String,
        artist: String,
        thumbnail: String,
      },
    ],
  },
  {
    timestamps: true,
  }
)

const Playlist = mongoose.model('Playlist', playlistSchema)

export default Playlist