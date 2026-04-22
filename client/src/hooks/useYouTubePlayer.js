import { useCallback, useEffect, useRef, useState } from 'react'
import usePlayerStore from '../store/usePlayerStore.js'

export default function useYouTubePlayer() {
  const [isReady, setIsReady] = useState(false)

  const ytPlayerRef = useRef(null)
  const apiLoadingRef = useRef(false)
  const trackingIntervalRef = useRef(null)
  const pendingVideoRef = useRef(null)
  const currentVideoRef = useRef(null)

  const {
    setBuffering,
    setCurrentTime,
    setDuration,
    setIsPlaying,
    setPlayerControls,
    playNext,
    youtubeId,
    isPlaying,
    sourceType,
    volume,
  } = usePlayerStore()

  const startTracking = useCallback(() => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current)
    }

    trackingIntervalRef.current = setInterval(() => {
      const player = ytPlayerRef.current
      if (!player?.getCurrentTime) return

      try {
        const current = player.getCurrentTime() || 0
        const durationSeconds = player.getDuration() || 0
        setCurrentTime(current)
        if (durationSeconds > 0) setDuration(durationSeconds)
      } catch (err) {
        void err
      }
    }, 500)
  }, [setCurrentTime, setDuration])

  const createPlayer = useCallback(() => {
    if (ytPlayerRef.current) return
    if (!window.YT || !window.YT.Player) return

    let container = document.getElementById('yt-player-hidden')
    if (!container) {
      container = document.createElement('div')
      container.id = 'yt-player-hidden'
      Object.assign(container.style, {
        position: 'fixed',
        bottom: '-9999px',
        left: '0',
        width: '1px',
        height: '1px',
        opacity: '0',
        pointerEvents: 'none',
      })
      document.body.appendChild(container)
    }

    ytPlayerRef.current = new window.YT.Player('yt-player-hidden', {
      height: '1',
      width: '1',
      videoId: '',
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
      },
      events: {
        onReady: (event) => {
          setIsReady(true)
          event.target.setVolume(usePlayerStore.getState().volume * 100)

          const pending = pendingVideoRef.current
          if (pending) {
            event.target.loadVideoById(pending)
            currentVideoRef.current = pending
            pendingVideoRef.current = null
          }
        },
        onStateChange: (event) => {
          const state = event.data
          const S = window.YT.PlayerState

          if (state === S.PLAYING) {
            setBuffering(false)
            setIsPlaying(true)
            try {
              const d = ytPlayerRef.current?.getDuration?.() || 0
              if (d > 0) setDuration(d)
            } catch (err) {
              void err
            }
            startTracking()
          } else if (state === S.PAUSED) {
            setIsPlaying(false)
          } else if (state === S.BUFFERING) {
            setBuffering(true)
          } else if (state === S.ENDED) {
            setIsPlaying(false)
            playNext()
          }
        },
        onError: () => {
          setBuffering(false)
          setIsPlaying(false)
        },
      },
    })

    startTracking()
  }, [playNext, setBuffering, setDuration, setIsPlaying, startTracking])

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      createPlayer()
      return undefined
    }

    if (apiLoadingRef.current) return undefined
    apiLoadingRef.current = true

    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.body.appendChild(tag)

    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prev === 'function') prev()
      createPlayer()
    }

    return () => {
      // no-op: player cleanup happens below
    }
  }, [createPlayer])

  // Cleanup
  useEffect(() => {
    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current)
        trackingIntervalRef.current = null
      }
      const player = ytPlayerRef.current
      ytPlayerRef.current = null
      if (player?.destroy) {
        try {
          player.destroy()
        } catch (err) {
          void err
        }
      }
    }
  }, [])

  // Watch youtubeId changes
  useEffect(() => {
    if (!youtubeId || sourceType !== 'youtube') return

    const player = ytPlayerRef.current
    if (player && isReady) {
      currentVideoRef.current = youtubeId
      try {
        player.loadVideoById(youtubeId)
      } catch (err) {
        void err
      }
      return
    }

    if (youtubeId !== currentVideoRef.current) {
      pendingVideoRef.current = youtubeId
    }
  }, [youtubeId, sourceType, isReady])

  // Sync play/pause
  useEffect(() => {
    const player = ytPlayerRef.current
    if (!isReady || !player || sourceType !== 'youtube') return

    try {
      if (isPlaying) {
        player.playVideo()
      } else {
        player.pauseVideo()
      }
    } catch (err) {
      void err
    }
  }, [isPlaying, isReady, sourceType])

  // Sync volume
  useEffect(() => {
    const player = ytPlayerRef.current
    if (!isReady || !player) return
    try {
      player.setVolume(volume * 100)
    } catch (err) {
      void err
    }
  }, [volume, isReady])

  useEffect(() => {
    setPlayerControls({
      pauseVideo: () => {
        try {
          ytPlayerRef.current?.pauseVideo()
        } catch (err) {
          void err
        }
      },
      resumeVideo: () => {
        try {
          ytPlayerRef.current?.playVideo()
        } catch (err) {
          void err
        }
      },
      seekTo: (seconds) => {
        try {
          ytPlayerRef.current?.seekTo(seconds, true)
        } catch (err) {
          void err
        }
      },
      setVolume: (nextVolume) => {
        try {
          ytPlayerRef.current?.setVolume(nextVolume)
        } catch (err) {
          void err
        }
      },
    })

    return () => {
      setPlayerControls(null)
    }
  }, [setPlayerControls])

  const playVideo = useCallback(
    (nextYoutubeId) => {
      currentVideoRef.current = nextYoutubeId
      const player = ytPlayerRef.current
      if (!isReady || !player) {
        pendingVideoRef.current = nextYoutubeId
        return
      }
      try {
        player.loadVideoById(nextYoutubeId)
      } catch (err) {
        void err
      }
    },
    [isReady],
  )

  const pauseVideo = useCallback(() => {
    try {
      ytPlayerRef.current?.pauseVideo()
    } catch (err) {
      void err
    }
  }, [])

  const resumeVideo = useCallback(() => {
    try {
      ytPlayerRef.current?.playVideo()
    } catch (err) {
      void err
    }
  }, [])

  const seekTo = useCallback((seconds) => {
    try {
      ytPlayerRef.current?.seekTo(seconds, true)
    } catch (err) {
      void err
    }
  }, [])

  const setVolumeLocal = useCallback((vol) => {
    try {
      ytPlayerRef.current?.setVolume(vol * 100)
    } catch (err) {
      void err
    }
  }, [])

  return {
    playVideo,
    pauseVideo,
    resumeVideo,
    seekTo,
    setVolume: setVolumeLocal,
    isReady,
  }
}
