import { create } from 'zustand'
import { playlistAPI } from '../services/api'

const usePlaylistStore = create((set, get) => ({
  playlists: [],
  currentPlaylist: null,
  isLoading: false,
  error: null,

  // 🎵 Fetch all playlists
  fetchPlaylists: async () => {
    set({ isLoading: true })
    try {
      const res = await playlistAPI.getUserPlaylists()
      set({ playlists: res.data.playlists, isLoading: false })
    } catch (err) {
      console.error('[playlistStore] fetchPlaylists', err)
      set({ error: 'Failed to load playlists', isLoading: false })
    }
  },

  // ➕ Create playlist
  createPlaylist: async (name) => {
    try {
      const res = await playlistAPI.createPlaylist(name)
      set((state) => ({
        playlists: [res.data.playlist, ...state.playlists],
      }))
    } catch (err) {
      console.error('[playlistStore] createPlaylist', err)
    }
  },

  // 📂 Load one playlist
  fetchPlaylist: async (id) => {
    set({ isLoading: true })
    try {
      const res = await playlistAPI.getPlaylist(id)
      set({
        currentPlaylist: res.data.playlist,
        isLoading: false,
      })
    } catch (err) {
      console.error('[playlistStore] fetchPlaylist', err)
      set({ isLoading: false })
    }
  },

  // ➕ Add track
  addTrack: async (playlistId, track) => {
    try {
      const res = await playlistAPI.addTrack(playlistId, track)

      set({
        currentPlaylist: res.data.playlist,
        playlists: get().playlists.map((p) =>
          p._id === playlistId ? res.data.playlist : p
        ),
      })
    } catch (err) {
      console.error('[playlistStore] addTrack', err)
    }
  },

  // ❌ Remove track
  removeTrack: async (playlistId, youtubeId) => {
    try {
      const res = await playlistAPI.removeTrack(
        playlistId,
        youtubeId
      )

      set({
        currentPlaylist: res.data.playlist,
      })
    } catch (err) {
      console.error('[playlistStore] removeTrack', err)
    }
  },
}))

export default usePlaylistStore