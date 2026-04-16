import { Music, X } from 'lucide-react'
import usePlayerStore from '../../store/usePlayerStore.js'

function getTrackId(track) {
  return track?.youtubeId || track?.trackId || track?.id || track?._id || ''
}

export default function QueuePanel({ open, onClose }) {
  const queue = usePlayerStore((s) => s.queue)
  const queueIndex = usePlayerStore((s) => s.queueIndex)
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const setQueue = usePlayerStore((s) => s.setQueue)
  const playYouTubeTrack = usePlayerStore((s) => s.playYouTubeTrack)
  const playUploadedTrack = usePlayerStore((s) => s.playUploadedTrack)

  if (!open) return null

  const currentTrackId = getTrackId(currentTrack)

  function handleSelect(track, index) {
    setQueue(queue, index)

    if (track.sourceType === 'upload' || track.fileUrl) {
      playUploadedTrack(track)
      return
    }

    playYouTubeTrack(track)
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-label="Close queue"
      />

      <aside
        className="fixed right-4 z-50 w-full max-w-sm overflow-hidden rounded-3xl border shadow-2xl"
        style={{
          top: '88px',
          bottom: 'calc(var(--player-height) + 16px)',
          background: 'var(--bg-card)',
          borderColor: 'var(--border)',
        }}
      >
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: 'var(--border)' }}
        >
          <div>
            <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              Queue
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {queue.length} track{queue.length === 1 ? '' : 's'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 transition"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Close queue"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="h-full overflow-y-auto px-3 py-3">
          {queue.length > 0 ? (
            <div className="space-y-2">
              {queue.map((track, index) => {
                const trackId = getTrackId(track)
                const isActive =
                  index === queueIndex ||
                  (trackId && trackId === currentTrackId)

                return (
                  <button
                    key={`${trackId || track.title}-${index}`}
                    type="button"
                    onClick={() => handleSelect(track, index)}
                    className="flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition"
                    style={{
                      background: isActive ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                      borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                    }}
                  >
                    {track.thumbnail || track.albumArt ? (
                      <img
                        src={track.thumbnail || track.albumArt}
                        alt={track.title}
                        className="h-12 w-12 rounded-xl object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl"
                        style={{ background: 'var(--bg-hover)' }}
                      >
                        <Music className="h-4 w-4" style={{ color: 'var(--accent-light)' }} />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {track.title}
                      </p>
                      <p className="truncate text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {track.artist || 'Unknown artist'}
                      </p>
                    </div>

                    <span
                      className="text-xs font-medium"
                      style={{ color: isActive ? 'var(--accent-light)' : 'var(--text-muted)' }}
                    >
                      {isActive ? 'Playing' : index + 1}
                    </span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div
              className="flex h-full min-h-[200px] flex-col items-center justify-center text-center"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Music className="mb-3 h-10 w-10" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm">Your queue is empty</p>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
