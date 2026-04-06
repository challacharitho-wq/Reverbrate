import mongoose from 'mongoose'

const youtubeTrackSchema = new mongoose.Schema(
  {
    youtubeId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    title: {
      type: String
    },

    artist: {
      type: String
    },

    thumbnail: {
      type: String
    },

    albumArt: {
      type: String
    },

    albumName: {
      type: String
    },

    releaseDate: {
      type: String
    },

    lyrics: {
      type: String
    },

    hasLyrics: {
      type: Boolean,
      default: false
    },

    artistBio: {
      type: String
    },

    artistImage: {
      type: String
    },

    artistListeners: {
      type: String
    },

    artistTags: {
      type: [String],
      default: []
    },

    similarArtists: [
      {
        name: String,
        image: String
      }
    ],

    cachedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
)

const YouTubeTrack = mongoose.model('YouTubeTrack', youtubeTrackSchema)

export default YouTubeTrack