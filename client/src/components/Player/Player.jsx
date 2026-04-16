import { useEffect, useRef, useState } from 'react'
import useYouTubePlayer from '../../hooks/useYouTubePlayer'
import {
  ChevronUp,
  ListMusic,
  Maximize2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react'
import usePlayerStore from '../../store/usePlayerStore.js'
import NowPlayingPanel from './NowPlayingPanel.jsx'
import QueuePanel from './QueuePanel.jsx'

function formatClock(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '0:00'
  const m = Math.floor(totalSeconds / 60)
  const s = Math.floor(totalSeconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function Player() {
  const {
    playVideo,
    pauseVideo,
    resumeVideo,
    seekTo,
    setVolume: setYTVolume,
  } = useYouTubePlayer()

  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const richTrack = usePlayerStore((s) => s.richTrack)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const duration = usePlayerStore((s) => s.duration)
  const currentTime = usePlayerStore((s) => s.currentTime)
  const volume = usePlayerStore((s) => s.volume)
  const isShuffle = usePlayerStore((s) => s.isShuffle)
  const repeatMode = usePlayerStore((s) => s.repeatMode)
  const isEnriching = usePlayerStore((s) => s.isEnriching)
  const isBuffering = usePlayerStore((s) => s.isBuffering)
  const youtubeId = usePlayerStore((s) => s.youtubeId)

  const togglePlayPause = usePlayerStore((s) => s.togglePlayPause)
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle)
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat)
  const playNext = usePlayerStore((s) => s.playNext)
  const playPrev = usePlayerStore((s) => s.playPrev)
  const setVolume = usePlayerStore((s) => s.setVolume)

  const [panelOpen, setPanelOpen] = useState(false)
  const [queueOpen, setQueueOpen] = useState(false)
  const progressRef = useRef(null)

  const progress = duration ? currentTime / duration : 0

  const displayTitle =
    richTrack?.title || currentTrack?.title || 'Nothing playing'
  const displayArtist =
    richTrack?.artist || currentTrack?.artist || 'Pick a song to start'

  const artwork =
    richTrack?.albumArt || currentTrack?.thumbnail || ''

  const artistTags = richTrack?.artistTags ?? []

  // 🎧 AUTO PLAY WHEN TRACK CHANGES
  useEffect(() => {
    if (youtubeId) {
      playVideo(youtubeId)
    }
  }, [youtubeId])

  // ▶️ PLAY / PAUSE
  const handlePlayPause = () => {
    if (!currentTrack) return

    if (isPlaying) {
      pauseVideo()
    } else {
      resumeVideo()
    }

    togglePlayPause()
  }

  // ⏱ SEEK
  const handleProgressClick = (e) => {
    if (!duration) return
    const rect = progressRef.current.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    seekTo(percent * duration)
  }

  // 🔊 VOLUME
  const handleVolume = (value) => {
    setVolume(value)
    setYTVolume(value * 100)
  }

  return (
    <>
      <NowPlayingPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        track={richTrack || currentTrack}
        isEnriching={isEnriching}
      />
      <QueuePanel
        open={queueOpen}
        onClose={() => setQueueOpen(false)}
      />

      <footer
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center px-4"
        style={{
          height: 'var(--player-height)',
          background: 'var(--player-bg)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div className="grid w-full grid-cols-[1fr_minmax(0,2fr)_1fr] items-center gap-4">

          {/* LEFT */}
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative">
             <div
  className="h-14 w-14 overflow-hidden rounded-2xl"
  style={{
    boxShadow: '0 0 20px var(--accent-glow)',
    animation: 'pulse 2s infinite',
  }}
>
                {artwork && (
                  <img
                    src={artwork}
                    alt={displayTitle}
                    className="h-full w-full object-cover transition-opacity duration-300"
                  />
                )}
              </div>

              <button
                onClick={() => setPanelOpen(true)}
                className="absolute right-0 top-0 rounded-full bg-black/70 p-1 text-white"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {displayTitle}
              </p>
              <p className="truncate text-xs text-gray-400">
                {displayArtist}
              </p>

              <div className="mt-2 flex gap-2">
                {artistTags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* CENTER */}
          <div className="flex flex-col items-center gap-2">

            <div className="flex items-center gap-4">
              <Shuffle onClick={toggleShuffle} className="cursor-pointer" />
              <SkipBack onClick={playPrev} className="cursor-pointer" />

              <button
                onClick={handlePlayPause}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white"
              >
                {isBuffering ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                ) : isPlaying ? (
                  <Pause className="text-black" />
                ) : (
                  <Play className="text-black ml-1" />
                )}
              </button>

              <SkipForward onClick={playNext} className="cursor-pointer" />
              {repeatMode === 'one' ? (
                <Repeat1 onClick={cycleRepeat} />
              ) : (
                <Repeat onClick={cycleRepeat} />
              )}
            </div>

            <div className="flex w-full max-w-xl items-center gap-3">
              <span className="text-xs text-gray-400">
                {formatClock(currentTime)}
              </span>

              <div
                ref={progressRef}
                onClick={handleProgressClick}
                className="h-2 w-full cursor-pointer rounded bg-gray-700"
              >
                <div
                  className="h-2 rounded"
                  style={{
                    width: `${progress * 100}%`,
                    background: 'var(--accent)',
                  }}
                />
              </div>

              <span className="text-xs text-gray-400">
                {formatClock(duration)}
              </span>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center justify-end gap-3">
            {volume === 0 ? <VolumeX /> : <Volume2 />}

            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(volume * 100)}
              onChange={(e) => handleVolume(e.target.value / 100)}
            />

            <button
              type="button"
              onClick={() => setQueueOpen((open) => !open)}
              className="transition"
              style={{
                color: queueOpen ? 'var(--accent-light)' : 'var(--text-secondary)',
              }}
              aria-label="Open queue"
            >
              <ListMusic />
            </button>
            <Maximize2 />
          </div>
        </div>
      </footer>
    </>
  )
}
