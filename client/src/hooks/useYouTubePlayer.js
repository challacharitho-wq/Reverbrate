import { useEffect, useRef, useState } from 'react'
import usePlayerStore from '../store/usePlayerStore'

let ytPlayer = null
let isAPILoading = false

const useYouTubePlayer = () => {
  const [isReady, setIsReady] = useState(false)
  const pendingVideoRef = useRef(null)
  const currentVideoRef = useRef(null)

  const {
    setBuffering,
    setCurrentTime,
    setDuration,
    setIsPlaying,
    playNext,
    youtubeId,
    isPlaying,
    sourceType,
    volume,
  } = usePlayerStore()

  // ─── Load YouTube IFrame API ──────────────────────
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      createPlayer()
      return
    }
    if (isAPILoading) return
    isAPILoading = true

    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.body.appendChild(tag)

    window.onYouTubeIframeAPIReady = () => {
      createPlayer()
    }
  }, [])

  const createPlayer = () => {
    if (ytPlayer) return

    const container = document.createElement('div')
    container.id = 'yt-player-hidden'
    Object.assign(container.style, {
      position : 'fixed',
      bottom   : '-9999px',
      left     : '0',
      width    : '1px',
      height   : '1px',
      opacity  : '0',
      pointerEvents: 'none',
    })
    document.body.appendChild(container)

    ytPlayer = new window.YT.Player('yt-player-hidden', {
      height  : '1',
      width   : '1',
      videoId : '',
      playerVars: {
        autoplay       : 1,
        controls       : 0,
        disablekb      : 1,
        fs             : 0,
        iv_load_policy : 3,
        modestbranding : 1,
        rel            : 0,
        playsinline    : 1,  // ← critical for mobile + some browsers
      },
      events: {
        onReady: (event) => {
          setIsReady(true)
          event.target.setVolume(
            usePlayerStore.getState().volume * 100
          )

          // Play any track that was queued before player was ready
          if (pendingVideoRef.current) {
            ytPlayer.loadVideoById(pendingVideoRef.current)
            currentVideoRef.current = pendingVideoRef.current
            pendingVideoRef.current = null
          }
        },

        onStateChange: (event) => {
          const state = event.data
          const S = window.YT.PlayerState

          if (state === S.PLAYING) {
            setBuffering(false)
            setIsPlaying(true)
          }
          if (state === S.PAUSED) {
            setIsPlaying(false)
          }
          if (state === S.BUFFERING) {
            setBuffering(true)
          }
          if (state === S.ENDED) {
            setIsPlaying(false)
            playNext()
          }
        },

        onError: (event) => {
          console.error('[YouTube] Player error:', event.data)
          setBuffering(false)
          setIsPlaying(false)
        },
      },
    })

    startTracking()
  }

  const startTracking = () => {
    setInterval(() => {
      if (!ytPlayer?.getCurrentTime) return
      try {
        const current  = ytPlayer.getCurrentTime() || 0
        const duration = ytPlayer.getDuration()    || 0
        setCurrentTime(current)
        if (duration > 0) setDuration(duration)
      } catch (_) {}
    }, 500)
  }

  // ─── KEY FIX: Watch youtubeId changes ────────────
  // When store's youtubeId changes → load it in player
  useEffect(() => {
    if (!youtubeId || sourceType !== 'youtube') return
    if (youtubeId === currentVideoRef.current) return

    currentVideoRef.current = youtubeId

    if (!isReady || !ytPlayer) {
      // Player not ready yet — queue it
      pendingVideoRef.current = youtubeId
      return
    }

    ytPlayer.loadVideoById(youtubeId)
  }, [youtubeId, sourceType, isReady])

  // ─── Sync play/pause from store → YouTube ────────
  useEffect(() => {
    if (!isReady || !ytPlayer || sourceType !== 'youtube') return

    try {
      if (isPlaying) {
        ytPlayer.playVideo()
      } else {
        ytPlayer.pauseVideo()
      }
    } catch (_) {}
  }, [isPlaying, isReady, sourceType])

  // ─── Sync volume from store → YouTube ────────────
  useEffect(() => {
    if (!isReady || !ytPlayer) return
    try {
      ytPlayer.setVolume(volume * 100)
    } catch (_) {}
  }, [volume, isReady])

  // ─── Exposed controls ─────────────────────────────
  const playVideo = (youtubeId) => {
    currentVideoRef.current = youtubeId
    if (!isReady || !ytPlayer) {
      pendingVideoRef.current = youtubeId
      return
    }
    ytPlayer.loadVideoById(youtubeId)
  }

  const pauseVideo  = () => { try { ytPlayer?.pauseVideo() } catch(_){} }
  const resumeVideo = () => { try { ytPlayer?.playVideo()  } catch(_){} }
  const seekTo = (seconds) => {
    try { ytPlayer?.seekTo(seconds, true) } catch(_) {}
  }
  const setVolume = (vol) => {
    try { ytPlayer?.setVolume(vol * 100) } catch(_) {}
  }

  return {
    playVideo,
    pauseVideo,
    resumeVideo,
    seekTo,
    setVolume,
    isReady,
  }
}

export default useYouTubePlayer