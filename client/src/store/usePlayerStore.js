import { create } from 'zustand'
import { musicAPI, historyService } from '../services/api.js'
import { parseDurationToSeconds } from '../utils/formatDuration.js'

function resolveDurationSeconds(track) {
  const candidates = [
    track?.durationSeconds,
    track?.duration,
    track?.lengthSeconds,
    track?.length,
  ]

  for (const candidate of candidates) {
    const seconds = parseDurationToSeconds(candidate)
    if (seconds > 0) return seconds
  }

  return 0
}

const usePlayerStore = create((set, get) => ({
  currentTrack: null,
  richTrack: null,
  isEnriching: false,
  isPlaying: false,
  progress: 0,
  duration: 0,
  volume: 0.8,
  isShuffle: false,
  repeatMode: 'none',
  queue: [],
  queueIndex: 0,

  currentTime: 0,
  youtubeId: null,
  sourceType: null,
  isBuffering: false,
  howlerInstance: null,
  playerControls: null,

  setRichTrack: (data) => set({ richTrack: data }),
  setEnriching: (val) => set({ isEnriching: val }),
  setCurrentTime: (time) =>
    set((state) => ({
      currentTime: time,
      progress: state.duration > 0 ? Math.min(1, Math.max(0, time / state.duration)) : 0,
    })),
  setDuration: (dur) =>
    set((state) => ({
      duration: dur,
      progress: dur > 0 ? Math.min(1, Math.max(0, state.currentTime / dur)) : 0,
      currentTrack: state.currentTrack
        ? {
            ...state.currentTrack,
            durationSeconds: dur > 0 ? dur : state.currentTrack.durationSeconds,
          }
        : state.currentTrack,
    })),
  setBuffering: (val) => set({ isBuffering: val }),
  setYoutubeId: (id) => set({ youtubeId: id }),
  setSourceType: (type) => set({ sourceType: type }),
  setIsPlaying: (val) => set({ isPlaying: val }),
  setHowlerInstance: (inst) => set({ howlerInstance: inst }),
  setPlayerControls: (controls) => set({ playerControls: controls }),
  setVolume: (val) => set({ volume: Math.min(1, Math.max(0, val)) }),

  play: (track) => {
    const durationSeconds = resolveDurationSeconds(track)

    set({
      currentTrack: track,
      isPlaying: true,
      progress: 0,
      currentTime: 0,
      duration: durationSeconds,
      queue: track.queue ?? get().queue,
    })
  },

  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),

  seek: (position) => set({ progress: Math.min(1, Math.max(0, position)) }),

  toggleShuffle: () => set((s) => ({ isShuffle: !s.isShuffle })),

  cycleRepeat: () =>
    set((s) => ({
      repeatMode:
        s.repeatMode === 'none' ? 'all'
        : s.repeatMode === 'all' ? 'one'
        : 'none',
    })),

  togglePlayPause: () => {
    const { currentTrack, isPlaying } = get()
    if (!currentTrack) return
    set({ isPlaying: !isPlaying })
  },

  setQueue: (tracks, startIndex = 0) => {
    const safeQueue = Array.isArray(tracks) ? tracks : []
    const safeIndex = safeQueue.length
      ? Math.min(Math.max(0, startIndex), safeQueue.length - 1)
      : 0

    set({
      queue: safeQueue,
      queueIndex: safeIndex,
    })
  },

  playNext: () => {
    const { queue, queueIndex, repeatMode, isShuffle } = get()
    if (!queue.length) return

    let next
    if (isShuffle) {
      next = Math.floor(Math.random() * queue.length)
    } else if (repeatMode === 'one') {
      next = queueIndex
    } else {
      next = (queueIndex + 1) % queue.length
      if (next === 0 && repeatMode === 'none') return
    }

    const track = queue[next]
    if (!track) return

    set({ queueIndex: next })

    if (track.sourceType === 'upload' || track.fileUrl) {
      get().playUploadedTrack(track)
    } else {
      get().playYouTubeTrack(track)
    }
  },

  playPrev: () => {
    const { queue, queueIndex } = get()
    if (!queue.length) return

    const prev = (queueIndex - 1 + queue.length) % queue.length
    const track = queue[prev]
    if (!track) return

    set({ queueIndex: prev })

    if (track.sourceType === 'upload' || track.fileUrl) {
      get().playUploadedTrack(track)
    } else {
      get().playYouTubeTrack(track)
    }
  },

  playYouTubeTrack: async (track) => {
    const { play, queue, queueIndex } = get()
    const trackId = track.youtubeId || track.id
    const foundIndex = queue.findIndex(
      (item) => (item.youtubeId || item.trackId || item.id || item._id) === trackId,
    )

    play(track)
    set({
      youtubeId: track.youtubeId || track.id,
      sourceType: 'youtube',
      isPlaying: true,
      isEnriching: true,
      richTrack: null,
      queueIndex: foundIndex >= 0 ? foundIndex : queueIndex,
    })

    historyService
      .add(
        track.youtubeId || track.id,
        'youtube',
        track.title,
        track.artist,
        track.thumbnail || '',
      )
      .catch(() => {})

    try {
      const res = await musicAPI.getTrackDetails(
        track.youtubeId || track.id,
        track.title,
        track.artist,
        track.thumbnail,
      )
      const enriched = res.data.track

      set((state) => ({
        richTrack: enriched,
        isEnriching: false,
        currentTrack: {
          ...state.currentTrack,
          ...enriched,
          albumArt: enriched.albumArt || state.currentTrack?.thumbnail,
          durationSeconds:
            enriched.durationSeconds ||
            state.currentTrack?.durationSeconds ||
            resolveDurationSeconds(enriched),
        },
      }))
    } catch {
      set({ isEnriching: false })
    }
  },

  playUploadedTrack: (track) => {
    const { queue, queueIndex } = get()
    const trackId = track._id || track.id
    const foundIndex = queue.findIndex(
      (item) => (item._id || item.id || item.trackId || item.youtubeId) === trackId,
    )
    const durationSeconds = resolveDurationSeconds(track)

    set({
      currentTrack: track,
      sourceType: 'upload',
      isPlaying: true,
      progress: 0,
      currentTime: 0,
      duration: durationSeconds,
      richTrack: null,
      youtubeId: null,
      queueIndex: foundIndex >= 0 ? foundIndex : queueIndex,
    })

    historyService
      .add(
        track._id || track.id,
        'upload',
        track.title,
        track.artist,
        track.thumbnail || track.coverUrl || '',
      )
      .catch(() => {})
  },
}))

export default usePlayerStore
