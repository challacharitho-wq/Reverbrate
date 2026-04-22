import { useState } from 'react'
import {
  ListMusic,
  Maximize2,
  Pause,
  PanelRight,
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
import { formatTime } from '../../utils/formatDuration.js'
import QueuePanel from './QueuePanel.jsx'

export default function Player({
  showArtistPanel,
  onToggleArtistPanel,
  onOpenArtistPanel,
}) {
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const richTrack = usePlayerStore((s) => s.richTrack)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const duration = usePlayerStore((s) => s.duration)
  const currentTime = usePlayerStore((s) => s.currentTime)
  const volume = usePlayerStore((s) => s.volume)
  const isShuffle = usePlayerStore((s) => s.isShuffle)
  const repeatMode = usePlayerStore((s) => s.repeatMode)
  const isBuffering = usePlayerStore((s) => s.isBuffering)
  const playerControls = usePlayerStore((s) => s.playerControls)

  const togglePlayPause = usePlayerStore((s) => s.togglePlayPause)
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle)
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat)
  const playNext = usePlayerStore((s) => s.playNext)
  const playPrev = usePlayerStore((s) => s.playPrev)
  const setVolume = usePlayerStore((s) => s.setVolume)

  const [queueOpen, setQueueOpen] = useState(false)

  const displayTrack = richTrack || currentTrack
  const displayTitle = displayTrack?.title || 'Nothing playing'
  const displayArtist = displayTrack?.artist || 'Choose a track to start listening'
  const artwork = displayTrack?.albumArt || displayTrack?.thumbnail || ''
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  function handlePlayPause() {
    if (!currentTrack) return

    if (isPlaying) {
      playerControls?.pauseVideo?.()
    } else {
      playerControls?.resumeVideo?.()
    }

    togglePlayPause()
  }

  function handleSeek(event) {
    if (!duration || !playerControls?.seekTo) return

    const percent = Number(event.target.value) / 100
    playerControls.seekTo(percent * duration)
  }

  function handleVolume(value) {
    const nextVolume = value / 100
    setVolume(nextVolume)
    playerControls?.setVolume?.(value)
  }

  return (
    <>
      <QueuePanel open={queueOpen} onClose={() => setQueueOpen(false)} />

      <footer
        className="fixed bottom-0 left-0 right-0 z-50 border-t px-5"
        style={{
          height: 'var(--player-height)',
          background: 'var(--player-bg)',
          borderColor: 'var(--player-border)',
        }}
      >
        <div className="grid h-full grid-cols-[minmax(0,1.15fr)_minmax(320px,1.4fr)_minmax(0,1fr)] items-center gap-5">
          <div className="flex min-w-0 items-center gap-4">
            <button
              type="button"
              onClick={onOpenArtistPanel}
              className="overflow-hidden rounded-lg"
              style={{
                background: artwork ? 'var(--bg-card)' : 'linear-gradient(135deg, var(--accent), #1d4ed8)',
                boxShadow: artwork ? '0 14px 28px rgba(0,0,0,0.28)' : '0 14px 28px rgba(124,58,237,0.22)',
              }}
              aria-label="Open artist focus panel"
            >
              {artwork ? (
                <img src={artwork} alt={displayTitle} className="h-14 w-14 object-cover" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center text-lg font-bold text-white">
                  {displayTitle.slice(0, 1).toUpperCase()}
                </div>
              )}
            </button>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{displayTitle}</p>
              <p className="truncate text-xs" style={{ color: 'var(--text-secondary)' }}>
                {displayArtist}
              </p>
            </div>
          </div>

          <div className="flex min-w-0 flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={toggleShuffle}
                className="transition"
                style={{ color: isShuffle ? 'var(--accent-light)' : 'var(--text-secondary)' }}
                aria-label="Toggle shuffle"
              >
                <Shuffle className="h-4 w-4" />
              </button>
              <button type="button" onClick={playPrev} style={{ color: 'var(--text-primary)' }} aria-label="Previous track">
                <SkipBack className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handlePlayPause}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black transition hover:scale-[1.03]"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isBuffering ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                ) : isPlaying ? (
                  <Pause className="h-5 w-5" fill="currentColor" />
                ) : (
                  <Play className="ml-0.5 h-5 w-5" fill="currentColor" />
                )}
              </button>
              <button type="button" onClick={playNext} style={{ color: 'var(--text-primary)' }} aria-label="Next track">
                <SkipForward className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={cycleRepeat}
                className="transition"
                style={{ color: repeatMode !== 'none' ? 'var(--accent-light)' : 'var(--text-secondary)' }}
                aria-label="Toggle repeat"
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="h-4 w-4" />
                ) : (
                  <Repeat className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="flex w-full max-w-xl items-center gap-3">
              <span className="w-10 text-right text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={progressPercent || 0}
                onChange={handleSeek}
                className="player-range w-full"
                style={{
                  background: `linear-gradient(to right, var(--progress-fill) 0%, var(--progress-fill) ${progressPercent}%, var(--progress-bg) ${progressPercent}%, var(--progress-bg) 100%)`,
                }}
                aria-label="Playback position"
              />
              <span className="w-10 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                {formatTime(duration, '--:--')}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onToggleArtistPanel}
              className="glass-button h-9 w-9"
              style={{
                color: showArtistPanel ? 'var(--text-primary)' : undefined,
                background: showArtistPanel ? 'rgba(124,58,237,0.24)' : undefined,
              }}
              aria-label="Toggle artist focus panel"
            >
              <PanelRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setQueueOpen((open) => !open)}
              className="glass-button h-9 w-9"
              style={{
                color: queueOpen ? 'var(--text-primary)' : undefined,
                background: queueOpen ? 'rgba(124,58,237,0.24)' : undefined,
              }}
              aria-label="Toggle queue"
            >
              <ListMusic className="h-4 w-4" />
            </button>

            <div className="hidden items-center gap-2 md:flex">
              {volume === 0 ? (
                <VolumeX className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
              ) : (
                <Volume2 className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
              )}
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(volume * 100)}
                onChange={(event) => handleVolume(Number(event.target.value))}
                className="volume-range w-24"
                style={{
                  background: `linear-gradient(to right, var(--progress-fill) 0%, var(--progress-fill) ${Math.round(volume * 100)}%, var(--progress-bg) ${Math.round(volume * 100)}%, var(--progress-bg) 100%)`,
                }}
                aria-label="Volume"
              />
            </div>

            <button type="button" className="glass-button h-9 w-9" aria-label="Fullscreen player">
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </footer>
    </>
  )
}
