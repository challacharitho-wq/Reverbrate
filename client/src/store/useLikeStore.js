import { create } from 'zustand'
import { likeAPI } from '../services/api.js'

function buildLikedIds(songs) {
  return new Set(
    (songs || [])
      .map((song) => song.youtubeId)
      .filter(Boolean),
  )
}

const useLikeStore = create((set, get) => ({
  likedSongs: [],
  likedIds: new Set(),
  isLoading: false,

  fetchLikes: async () => {
    set({ isLoading: true })
    try {
      const { data } = await likeAPI.getLikes()
      const songs = data?.songs || []
      set({
        likedSongs: songs,
        likedIds: buildLikedIds(songs),
        isLoading: false,
      })
      return songs
    } catch (err) {
      console.error('[likeStore] fetchLikes failed', err)
      set({ isLoading: false })
      return []
    }
  },

  toggleLike: async (track) => {
    const payload = {
      youtubeId: track.youtubeId || track.id,
      title: track.title,
      artist: track.artist,
      thumbnail: track.thumbnail || track.albumArt || '',
    }

    const { data } = await likeAPI.toggleLike(payload)
    const songs = data?.songs || get().likedSongs

    set({
      likedSongs: songs,
      likedIds: buildLikedIds(songs),
    })

    return Boolean(data?.liked)
  },
}))

export default useLikeStore
