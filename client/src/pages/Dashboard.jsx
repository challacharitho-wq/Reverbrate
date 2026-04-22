import { useEffect, useMemo, useState } from 'react'
import { Play, Sparkles, TrendingUp } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore.js'
import usePlayerStore from '../store/usePlayerStore.js'
import { historyService, recommendService } from '../services/api.js'

function getGreetingPeriod() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  return 'evening'
}

function PlayCard({ track, onPlay, compact = false }) {
  const artwork = track.thumbnail || track.albumArt || ''

  return (
    <button
      type="button"
      onClick={() => onPlay(track)}
      className={`group text-left transition ${compact ? 'w-full' : 'w-full min-w-[190px]'}`}
    >
      <div
        className={`rounded-[18px] p-3 transition ${compact ? 'flex items-center gap-4' : ''}`}
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div
          className={`relative overflow-hidden rounded-[14px] ${compact ? 'h-14 w-14 shrink-0' : 'aspect-square w-full'}`}
          style={{
            background: artwork ? 'var(--bg-card)' : 'linear-gradient(135deg, var(--accent), #2563eb)',
          }}
        >
          {artwork ? (
            <img src={artwork} alt={track.title} className="h-full w-full object-cover" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
          <span
            className="absolute bottom-3 right-3 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100"
            style={{ background: '#1db954', color: '#000000' }}
          >
            <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
          </span>
        </div>

        <div className={compact ? 'min-w-0 flex-1' : 'pt-4'}>
          <p className="truncate text-sm font-semibold text-white">{track.title}</p>
          <p className="mt-1 truncate text-xs" style={{ color: 'var(--text-secondary)' }}>
            {track.artist || 'Unknown artist'}
          </p>
        </div>
      </div>
    </button>
  )
}

function SectionHeader({ title, action }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="text-2xl font-bold tracking-tight text-white">{title}</h2>
      {action ? (
        <button type="button" className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
          {action}
        </button>
      ) : null}
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
    async function loadHomeData() {
      setLoadingHistory(true)
      setLoadingRecommended(true)

      try {
        const historyResponse = await historyService.get()
        const historyItems = historyResponse.data?.history || historyResponse.data || []
        setRecentlyPlayed(historyItems)
      } catch (error) {
        console.error('[dashboard] history load failed', error)
        setRecentlyPlayed([])
      } finally {
        setLoadingHistory(false)
      }

      try {
        const recommendResponse = await recommendService.get()
        setRecommended(recommendResponse.data?.tracks || [])
      } catch (error) {
        console.error('[dashboard] recommendations load failed', error)
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
    const index = normalizedQueue.findIndex((item) => (item.youtubeId || item.id) === currentId)

    if (normalizedQueue.length > 0) {
      setQueue(normalizedQueue, index >= 0 ? index : 0)
    }

    playYouTubeTrack(normalizedTrack)
  }

  const quickMixes = recentlyPlayed.slice(0, 6)
  const spotlightTracks = recommended.slice(0, 5)

  return (
    <div className="space-y-8 pb-6">
      <section
        className="overflow-hidden rounded-[28px] px-8 py-8"
        style={{
          background: 'linear-gradient(180deg, rgba(124,58,237,0.55), rgba(15,15,15,0.95) 72%)',
        }}
      >
        <p className="text-sm font-semibold uppercase tracking-[0.28em]" style={{ color: 'rgba(255,255,255,0.72)' }}>
          Good {greeting}
        </p>
        <h2 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
          Welcome back, {firstName}. Your listening room is ready.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-6" style={{ color: 'rgba(255,255,255,0.75)' }}>
          Jump into recent plays, discover a few recommendations, and keep the desktop player anchored while you browse.
        </p>

        <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {quickMixes.length > 0 ? (
            quickMixes.map((track) => (
              <button
                key={track.trackId || track.youtubeId || track._id}
                type="button"
                onClick={() => handlePlay(track, recentlyPlayed)}
                className="flex items-center overflow-hidden rounded-2xl text-left transition hover:scale-[1.01]"
                style={{ background: 'rgba(255,255,255,0.10)' }}
              >
                <div
                  className="h-20 w-20 shrink-0"
                  style={{
                    background: track.thumbnail
                      ? 'var(--bg-card)'
                      : 'linear-gradient(135deg, rgba(255,255,255,0.28), rgba(255,255,255,0.08))',
                  }}
                >
                  {track.thumbnail ? (
                    <img src={track.thumbnail} alt={track.title} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="flex min-w-0 flex-1 items-center justify-between gap-4 px-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">{track.title}</p>
                    <p className="truncate text-xs" style={{ color: 'rgba(255,255,255,0.72)' }}>
                      {track.artist}
                    </p>
                  </div>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1db954] text-black">
                    <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div
              className="rounded-2xl px-5 py-6 text-sm md:col-span-2 xl:col-span-3"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.75)' }}
            >
              Your recent listens will start showing up here once you play a few tracks.
            </div>
          )}
        </div>
      </section>

      <section>
        <SectionHeader title="Made for you" action="Fresh picks" />
        {loadingRecommended ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="aspect-[0.88] animate-pulse rounded-[18px]"
                style={{ background: 'var(--bg-card)' }}
              />
            ))}
          </div>
        ) : spotlightTracks.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {spotlightTracks.map((track) => (
              <PlayCard
                key={track.youtubeId}
                track={track}
                onPlay={(selectedTrack) => handlePlay(selectedTrack, recommended)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[22px] p-6 text-sm" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
            Pick a few artists during onboarding and this space will turn into a more personal recommendation shelf.
          </div>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <div>
          <SectionHeader title="Recently played" action="See all" />
          {loadingHistory ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="h-[88px] animate-pulse rounded-[18px]" style={{ background: 'var(--bg-card)' }} />
              ))}
            </div>
          ) : recentlyPlayed.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {recentlyPlayed.slice(0, 6).map((track) => (
                <PlayCard
                  key={track.trackId || track.youtubeId || track._id}
                  track={track}
                  compact
                  onPlay={(selectedTrack) => handlePlay(selectedTrack, recentlyPlayed)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[22px] p-6 text-sm" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
              There is no history yet. Search for a track and start building the home feed.
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-[22px] p-6" style={{ background: 'var(--bg-card)' }}>
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4" style={{ color: 'var(--accent-light)' }} />
              <p className="text-sm font-semibold text-white">Your desktop mix</p>
            </div>
            <p className="text-3xl font-extrabold tracking-tight text-white">Focus Flow</p>
            <p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
              A compact listening setup inspired by Spotify’s desktop rhythm, tuned around your existing Reverberate playback stack.
            </p>
          </div>

          <div className="rounded-[22px] p-6" style={{ background: 'var(--bg-card)' }}>
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" style={{ color: 'var(--accent-light)' }} />
              <p className="text-sm font-semibold text-white">Trending in your queue</p>
            </div>
            <div className="space-y-3">
              {recommended.slice(0, 4).map((track, index) => (
                <button
                  key={track.youtubeId}
                  type="button"
                  onClick={() => handlePlay(track, recommended)}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition"
                  style={{ background: 'var(--bg-elevated)' }}
                >
                  <span className="w-5 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{track.title}</p>
                    <p className="truncate text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {track.artist}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
