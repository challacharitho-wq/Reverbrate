import { useEffect, useMemo, useState } from 'react'
import { Music, RotateCcw } from 'lucide-react'
import { historyService } from '../services/api.js'
import usePlayerStore from '../store/usePlayerStore.js'

export default function History() {
  const playYouTubeTrack = usePlayerStore((s) => s.playYouTubeTrack)
  const playUploadedTrack = usePlayerStore((s) => s.playUploadedTrack)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadHistory() {
      try {
        const { data } = await historyService.get()
        console.log('[history] response', data)
        setItems(data?.history || data || [])
      } catch (err) {
        console.error('[history] load failed', err)
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [])

  const deduped = useMemo(
    () =>
      items.filter(
        (item, index, self) =>
          index ===
          self.findIndex((track) => track.trackId === item.trackId),
      ),
    [items],
  )

  function replayItem(item) {
    if (item.sourceType === 'youtube' || !item.sourceType) {
      playYouTubeTrack({
        youtubeId: item.trackId,
        id: item.trackId,
        title: item.title,
        artist: item.artist,
        thumbnail: item.thumbnail || '',
        sourceType: 'youtube',
      })
      return
    }

    if (item.sourceType === 'upload') {
      playUploadedTrack({
        id: item.trackId,
        _id: item.trackId,
        title: item.title,
        artist: item.artist,
        fileUrl: item.fileUrl || '',
        sourceType: 'upload',
      })
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Listening History
        </h2>
        <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
          Jump back into the tracks you played recently.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-2xl"
              style={{ background: 'var(--bg-card)' }}
            />
          ))}
        </div>
      ) : deduped.length > 0 ? (
        <div className="space-y-3">
          {deduped.map((item, index) => (
            <button
              key={`${item.trackId || item.youtubeId || item._id}-${index}`}
              type="button"
              onClick={() => replayItem(item)}
              className="flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition"
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="h-14 w-14 rounded-xl object-cover"
                />
              ) : (
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-xl"
                  style={{ background: 'var(--bg-elevated)' }}
                >
                  <Music className="h-5 w-5" style={{ color: 'var(--accent-light)' }} />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.title}</p>
                <p className="truncate text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {item.artist || 'Unknown artist'}
                </p>
              </div>

              <div
                className="flex items-center gap-2 text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                <RotateCcw className="h-4 w-4" />
                Replay
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div
          className="flex min-h-[40vh] flex-col items-center justify-center rounded-3xl border px-4 text-center"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          <h3 className="text-xl font-semibold">No listening history yet</h3>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
            Start playing songs and we&apos;ll keep them here for quick access.
          </p>
        </div>
      )}
    </div>
  )
}
