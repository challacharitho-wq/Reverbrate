import { useMemo } from 'react'
import { Play } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore.js'
import usePlayerStore from '../store/usePlayerStore.js'
import { mockTracks } from '../data/mockTracks.js'

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

function TrackCard({ track, play }) {
  return (
    <div
      className="group relative w-[120px] shrink-0 transition-transform"
      style={{ transitionDuration: '150ms' }}
    >
      <div
        className="relative h-[120px] w-[120px] overflow-hidden rounded-xl"
        style={{ background: track.gradient }}
      >
        <button
          type="button"
          className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
          style={{
            background: 'color-mix(in srgb, var(--bg-primary) 35%, transparent)',
            transitionDuration: '150ms',
          }}
          onClick={(e) => {
            e.stopPropagation()
            play(track)
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

function QuickPickRow({ track, play }) {
  return (
    <div
      className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors"
      style={{ transitionDuration: '150ms' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--bg-hover)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
      }}
    >
      <div
        className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg"
        style={{ background: track.gradient }}
      >
        <button
          type="button"
          className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
          style={{ transitionDuration: '150ms' }}
          onClick={(e) => {
            e.stopPropagation()
            play(track)
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
  const play = usePlayerStore((s) => s.play)
  const setQueue = usePlayerStore((s) => s.setQueue)

  const greeting = useMemo(() => getGreetingPeriod(), [])
  const firstName = (user?.name || 'there').split(/\s+/)[0]

  const recentlyPlayed = mockTracks.slice(0, 6)
  const trending = mockTracks.slice(2, 8)
  const quickPicks = mockTracks.slice(0, 6)

  function handlePlay(track) {
    const index = mockTracks.findIndex((t) => t.id === track.id)
    setQueue(mockTracks, index >= 0 ? index : 0)
    play(track)
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
        <div
          className="hide-scrollbar flex gap-4 overflow-x-auto pb-2"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {recentlyPlayed.map((track) => (
            <div
              key={track.id}
              className="transition-transform hover:scale-[1.03]"
              style={{ transitionDuration: '150ms' }}
            >
              <TrackCard track={track} play={handlePlay} />
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h3
          className="mb-4 text-lg font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Trending Now
        </h3>
        <div
          className="hide-scrollbar flex gap-4 overflow-x-auto pb-2"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {trending.map((track) => (
            <div
              key={track.id}
              className="transition-transform hover:scale-[1.03]"
              style={{ transitionDuration: '150ms' }}
            >
              <TrackCard track={track} play={handlePlay} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3
          className="mb-4 text-lg font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Quick Picks
        </h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {quickPicks.map((track) => (
            <QuickPickRow key={track.id} track={track} play={handlePlay} />
          ))}
        </div>
      </section>
    </div>
  )
}
