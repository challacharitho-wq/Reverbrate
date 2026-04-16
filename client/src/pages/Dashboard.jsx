import { useEffect, useMemo, useState } from 'react'
import { Play } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore.js'
import usePlayerStore from '../store/usePlayerStore.js'
import { historyService, recommendService } from '../services/api.js'

function getGreetingPeriod() {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) {
    return 'morning'
  }
  if (h >= 12 && h < 17) {
    return 'afternoon'
  }
  return 'evening'
}

function TrackCard({ track, onPlay }) {
  const artwork = track.thumbnail || track.albumArt || ''

  return (
    <div
      className="group relative w-[160px] shrink-0 cursor-pointer transition-transform"
      style={{ transitionDuration: '150ms' }}
      onClick={() => onPlay(track)}
    >
      <div
        className="relative h-[160px] w-[160px] overflow-hidden rounded-xl"
        style={{
          background: artwork
            ? 'var(--bg-card)'
            : 'linear-gradient(135deg, var(--accent-glow), var(--bg-card))',
        }}
      >
        {artwork ? (
          <img
            src={artwork}
            alt={track.title}
            className="h-full w-full object-cover"
          />
        ) : null}
        <button
          type="button"
          className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
          style={{
            background: 'color-mix(in srgb, var(--bg-primary) 35%, transparent)',
            transitionDuration: '150ms',
          }}
          onClick={(e) => {
            e.stopPropagation()
            onPlay(track)
          }}
          aria-label={`Play ${track.title}`}
        >
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full shadow-lg"
            style={{
              background: 'var(--accent)',
              color: 'var(--text-primary)',
            }}
          >
            <Play className="ml-0.5 h-5 w-5" fill="currentColor" aria-hidden />
          </span>
        </button>
      </div>
      <p
        className="mt-2 line-clamp-2 text-sm font-semibold leading-tight"
        style={{ color: 'var(--text-primary)' }}
      >
        {track.title}
      </p>
      <p
        className="mt-0.5 line-clamp-1 text-xs"
        style={{ color: 'var(--text-muted)' }}
      >
        {track.artist}
      </p>
    </div>
  )
}

function QuickPickRow({ track, onPlay }) {
  return (
    <div
      className="group flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition-colors"
      style={{ transitionDuration: '150ms' }}
      onClick={() => onPlay(track)}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--bg-hover)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
      }}
    >
      <div
        className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg"
        style={{
          background: track.thumbnail
            ? 'var(--bg-card)'
            : 'linear-gradient(135deg, var(--accent-glow), var(--bg-card))',
        }}
      >
        {track.thumbnail ? (
          <img
            src={track.thumbnail}
            alt={track.title}
            className="h-full w-full object-cover"
          />
        ) : null}
        <button
          type="button"
          className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
          style={{ transitionDuration: '150ms' }}
          onClick={(e) => {
            e.stopPropagation()
            onPlay(track)
          }}
          aria-label={`Play ${track.title}`}
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{ background: 'var(--accent)' }}
          >
            <Play
              className="ml-0.5 h-4 w-4"
              fill="var(--text-primary)"
              aria-hidden
            />
          </span>
        </button>
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          {track.title}
        </p>
        <p className="truncate text-xs" style={{ color: 'var(--text-muted)' }}>
          {track.artist}
        </p>
      </div>
      <span
        className="shrink-0 text-xs tabular-nums"
        style={{ color: 'var(--text-secondary)' }}
      >
        {track.duration}
      </span>
    </div>
  )
}

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const playYouTubeTrack = usePlayerStore((s) => s.playYouTubeTrack)
  const playUploadedTrack = usePlayerStore((s) => s.playUploadedTrack)
  const setQueue = usePlayerStore((s) => s.setQueue)
  const [recentlyPlayed, setRecentlyPlayed] = useState([])
  const [recommended, setRecommended] = useState([])
  const [loadingRecommended, setLoadingRecommended] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(true)

  const greeting = useMemo(() => getGreetingPeriod(), [])
  const firstName = (user?.name || 'there').split(/\s+/)[0]

  useEffect(() => {
    const loadHomeData = async () => {
      setLoadingHistory(true)
      setLoadingRecommended(true)

      try {
        const historyResponse = await historyService.get()
        const historyItems = historyResponse.data?.history || historyResponse.data || []
        setRecentlyPlayed(historyItems)
      } catch (err) {
        console.error('[dashboard] history load failed', err)
        setRecentlyPlayed([])
      } finally {
        setLoadingHistory(false)
      }

      try {
        const recommendResponse = await recommendService.get()
        setRecommended(recommendResponse.data?.tracks || [])
      } catch (err) {
        console.error('[dashboard] recommendations load failed', err)
        setRecommended([])
      } finally {
        setLoadingRecommended(false)
      }
    }

    loadHomeData()
  }, [])

  function handlePlay(track, queue = []) {
    const normalizedTrack = {
      ...track,
      youtubeId: track.youtubeId || track.trackId || track.id,
      thumbnail: track.thumbnail || track.albumArt || '',
    }

    if (normalizedTrack.sourceType === 'upload') {
      if (normalizedTrack.fileUrl) {
        playUploadedTrack(normalizedTrack)
      }
      return
    }

    const normalizedQueue = queue.map((item) => ({
      ...item,
      youtubeId: item.youtubeId || item.trackId || item.id,
      thumbnail: item.thumbnail || item.albumArt || '',
    }))

    const currentId = normalizedTrack.youtubeId
    const index = normalizedQueue.findIndex(
      (item) => (item.youtubeId || item.id) === currentId,
    )

    if (normalizedQueue.length > 0) {
      setQueue(normalizedQueue, index >= 0 ? index : 0)
    }

    playYouTubeTrack(normalizedTrack)
  }

  function SkeletonCard() {
    return (
      <div
        className="h-[220px] w-[160px] shrink-0 animate-pulse rounded-xl"
        style={{ background: 'var(--bg-card)' }}
      />
    )
  }

  return (
    <div className="max-w-6xl">
      <section className="mb-10">
        <h2
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
          style={{ color: 'var(--text-primary)' }}
        >
          Good {greeting}, {firstName}!
        </h2>
        <p className="mt-1 text-base" style={{ color: 'var(--text-secondary)' }}>
          What do you want to listen to?
        </p>
      </section>

      <section className="mb-10">
        <h3
          className="mb-4 text-lg font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Recently Played
        </h3>
        {loadingHistory ? (
          <div className="hide-scrollbar flex gap-4 overflow-x-auto pb-2">
            {[...Array(4)].map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : recentlyPlayed.length > 0 ? (
          <div
            className="hide-scrollbar flex gap-4 overflow-x-auto pb-2"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {recentlyPlayed.map((track, index) => (
              <div
                key={`${track.trackId || track.youtubeId || track._id}-${index}`}
                className="transition-transform hover:scale-[1.03]"
                style={{ transitionDuration: '150ms' }}
              >
                <TrackCard
                  track={track}
                  onPlay={(selectedTrack) => handlePlay(selectedTrack, recentlyPlayed)}
                />
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>
            Your listening history will show up here once you start playing tracks.
          </p>
        )}
      </section>

      <section className="mb-10">
        <h3
          className="mb-4 text-lg font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Recommended For You
        </h3>
        {loadingRecommended ? (
          <div className="hide-scrollbar flex gap-4 overflow-x-auto pb-2">
            {[...Array(6)].map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : recommended.length > 0 ? (
          <div
            className="hide-scrollbar flex gap-4 overflow-x-auto pb-2"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {recommended.map((track) => (
              <TrackCard
                key={track.youtubeId}
                track={track}
                onPlay={(selectedTrack) => handlePlay(selectedTrack, recommended)}
              />
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>
            Pick a few favorite artists during onboarding to personalize this feed.
          </p>
        )}
      </section>

      <section>
        <h3
          className="mb-4 text-lg font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Quick Picks
        </h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {recommended.slice(0, 6).map((track) => (
            <QuickPickRow
              key={track.youtubeId}
              track={track}
              onPlay={(selectedTrack) => handlePlay(selectedTrack, recommended)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
