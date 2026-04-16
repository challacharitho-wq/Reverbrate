import { create } from 'zustand'
import { musicAPI, historyService } from '../services/api.js'

function parseDurationString(str) {
  if (!str || typeof str !== 'string') return 180
  const parts = str.split(':').map((p) => parseInt(p, 10))
  if (parts.some((n) => isNaN(n))) return 180
  if (parts.length === 1) return parts[0]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return parts[0] * 3600 + parts[1] * 60 + parts[2]
}

const usePlayerStore = create((set, get) => ({

  // ─── Core State ──────────────────────────────────────
  currentTrack  : null,
  richTrack     : null,
  isEnriching   : false,
  isPlaying     : false,
  progress      : 0,
  duration      : 0,
  volume        : 0.8,
  isShuffle     : false,
  repeatMode    : 'none',   // 'none' | 'all' | 'one'
  queue         : [],
  queueIndex    : 0,

  // ─── Extended State ───────────────────────────────────
  currentTime   : 0,
  youtubeId     : null,
  sourceType    : null,     // 'youtube' | 'upload' | null
  isBuffering   : false,
  howlerInstance: null,

  // ─── Setters ──────────────────────────────────────────
  setRichTrack     : (data) => set({ richTrack: data }),
  setEnriching     : (val)  => set({ isEnriching: val }),
  setCurrentTime   : (time) => set({ currentTime: time }),
  setDuration      : (dur)  => set({ duration: dur }),
  setBuffering     : (val)  => set({ isBuffering: val }),
  setYoutubeId     : (id)   => set({ youtubeId: id }),
  setSourceType    : (type) => set({ sourceType: type }),
  setIsPlaying     : (val)  => set({ isPlaying: val }),
  setHowlerInstance: (inst) => set({ howlerInstance: inst }),
  setVolume        : (val)  =>
    set({ volume: Math.min(1, Math.max(0, val)) }),

  // ─── Basic Playback ───────────────────────────────────
  play: (track) => {
    const durationSeconds =
      track.durationSeconds ?? parseDurationString(track.duration)
    set({
      currentTrack : track,
      isPlaying    : true,
      progress     : 0,
      currentTime  : 0,
      duration     : durationSeconds > 0 ? durationSeconds : 180,
      queue        : track.queue ?? get().queue,
    })
  },

  pause  : () => set({ isPlaying: false }),
  resume : () => set({ isPlaying: true }),

  seek: (position) =>
    set({ progress: Math.min(1, Math.max(0, position)) }),

  toggleShuffle: () =>
    set((s) => ({ isShuffle: !s.isShuffle })),

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

  // ─── Queue Navigation ─────────────────────────────────
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

    // Auto-route source type
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

  // ─── YouTube Track ────────────────────────────────────
  playYouTubeTrack: async (track) => {
    const { play, queue, queueIndex } = get()
    const trackId = track.youtubeId || track.id
    const foundIndex = queue.findIndex(
      (item) => (item.youtubeId || item.trackId || item.id || item._id) === trackId,
    )

    // Start playback immediately — don't wait for enrichment
    play(track)
    set({
      youtubeId  : track.youtubeId || track.id,
      sourceType : 'youtube',
      isEnriching: true,
      richTrack  : null,
      queueIndex : foundIndex >= 0 ? foundIndex : queueIndex,
    })

    // Fire-and-forget history
    historyService
      .add(
        track.youtubeId || track.id,
        'youtube',
        track.title,
        track.artist,
        track.thumbnail || ''
      )
      .then(() => console.log('[history] saved'))
      .catch((e) => console.error('[history] failed', e))

    // Enrich with metadata in background
    try {
      const res = await musicAPI.getTrackDetails(
        track.youtubeId || track.id,
        track.title,
        track.artist,
        track.thumbnail
      )
      const enriched = res.data.track
      set((state) => ({
        richTrack   : enriched,
        isEnriching : false,
        currentTrack: {
          ...state.currentTrack,
          ...enriched,
          albumArt:
            enriched.albumArt || state.currentTrack?.thumbnail,
        },
      }))
    } catch (err) {
      console.error('[usePlayerStore] enrichment failed', err)
      set({ isEnriching: false })
    }
  },

  // ─── Uploaded Track ───────────────────────────────────
  playUploadedTrack: (track) => {
    const { queue, queueIndex } = get()
    const trackId = track._id || track.id
    const foundIndex = queue.findIndex(
      (item) => (item._id || item.id || item.trackId || item.youtubeId) === trackId,
    )
    const durationSeconds =
      track.durationSeconds ??
      parseDurationString(track.duration)

    set({
      currentTrack : track,
      sourceType   : 'upload',
      isPlaying    : true,
      progress     : 0,
      currentTime  : 0,
      duration     : durationSeconds > 0 ? durationSeconds : 180,
      richTrack    : null,
      youtubeId    : null,
      queueIndex   : foundIndex >= 0 ? foundIndex : queueIndex,
    })

    // Fire-and-forget history
    historyService
      .add(
        track._id || track.id,
        'upload',
        track.title,
        track.artist,
        track.thumbnail || track.coverUrl || ''
      )
      .then(() => console.log('[history] saved'))
      .catch((e) => console.error('[history] failed', e))
  },
}))

export default usePlayerStore
