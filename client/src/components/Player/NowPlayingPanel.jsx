import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Disc3,
  ExternalLink,
  Maximize2,
  Mic2,
  Minimize2,
  Music4,
  PanelRightClose,
  Sparkles,
  Users,
} from 'lucide-react'
import usePlayerStore from '../../store/usePlayerStore.js'
import { formatTime } from '../../utils/formatDuration.js'

function formatListeners(track) {
  const seed = (track?.title?.length || 14) * 173421
  const listeners = 800000 + seed
  return new Intl.NumberFormat('en-US').format(listeners)
}

function buildAbout(track) {
  if (track?.description) return track.description

  const parts = [
    track?.artist ? `${track.artist} is lighting up the current session.` : null,
    track?.albumName ? `This track sits inside ${track.albumName}.` : null,
    track?.lyrics
      ? `${track.lyrics.split('\n').filter(Boolean).slice(0, 2).join(' ')}`
      : 'Open this panel while playing music to keep the artist context in view.',
  ].filter(Boolean)

  return parts.join(' ')
}

function formatReleaseDate(value) {
  if (!value) return 'Unknown'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Unknown'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function normalizeSimilarArtist(artist) {
  if (typeof artist === 'string') {
    return { name: artist, image: '' }
  }

  return {
    name: artist?.name || artist?.artist || artist?.title || 'Unknown artist',
    image: artist?.image || artist?.thumbnail || artist?.photo || '',
  }
}

export default function NowPlayingPanel({
  open,
  onClose,
  track,
  isEnriching,
  isExpanded = false,
  onExpandChange,
}) {
  const navigate = useNavigate()
  const currentTime = usePlayerStore((s) => s.currentTime)
  const duration = usePlayerStore((s) => s.duration)
  const richTrack = usePlayerStore((s) => s.richTrack)

  const [activeTab, setActiveTab] = useState('overview')
  const lyricsSectionRef = useRef(null)
  const activeLyricLineRef = useRef(null)

  const displayTrack = richTrack || track
  const artistTags = displayTrack?.artistTags ?? []
  const similarArtists = (displayTrack?.similarArtists ?? []).map(normalizeSimilarArtist)
  const aboutText = useMemo(() => buildAbout(displayTrack), [displayTrack])

  const lyricLines = useMemo(
    () => (displayTrack?.lyrics || '').split('\n').map((line) => line.trim()),
    [displayTrack?.lyrics],
  )
  const hasLyrics = Boolean(displayTrack?.hasLyrics && lyricLines.length > 0)
  const totalLines = lyricLines.filter((line) => line !== '').length || lyricLines.length
  const activeLineIndex =
    duration > 0 && totalLines > 0
      ? Math.min(Math.floor((currentTime / duration) * totalLines), totalLines - 1)
      : 0

  useEffect(() => {
    if (activeTab === 'lyrics') {
      lyricsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [activeTab])

  useEffect(() => {
    if (!onExpandChange) return
    onExpandChange(activeTab === 'lyrics')
  }, [activeTab, onExpandChange])

  useEffect(() => {
    if (activeTab !== 'lyrics') return
    activeLyricLineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [activeLineIndex, activeTab])

  if (!open) {
    return null
  }

  const tabButtonStyle = (tab) => ({
    background: activeTab === tab ? 'var(--text-primary)' : 'transparent',
    color: activeTab === tab ? 'var(--bg-base)' : 'var(--text-secondary)',
    borderColor: activeTab === tab ? 'transparent' : 'var(--border)',
  })

  return (
    <section className="flex h-full flex-col" style={{ background: 'var(--bg-sidebar)' }}>
      <header className="flex items-center justify-between border-b px-4 py-4" style={{ borderColor: 'var(--border)' }}>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.26em]" style={{ color: 'var(--text-muted)' }}>
            Artist Focus
          </p>
          <h2 className="truncate text-base font-bold text-white">
            {displayTrack?.artist || 'Nothing playing'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onExpandChange?.(!isExpanded)}
            className="glass-button h-9 w-9"
            aria-label={isExpanded ? 'Collapse lyrics panel' : 'Expand lyrics panel'}
            title={isExpanded ? 'Collapse panel' : 'Expand panel'}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="glass-button h-9 w-9"
            aria-label="Close artist panel"
          >
            <PanelRightClose className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="border-b px-4 py-3" style={{ borderColor: 'var(--border)' }}>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className="rounded-full border px-3 py-1 text-[12px] font-semibold transition"
            style={tabButtonStyle('overview')}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('lyrics')}
            className="rounded-full border px-3 py-1 text-[12px] font-semibold transition"
            style={tabButtonStyle('lyrics')}
          >
            Lyrics
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('similar')}
            className="rounded-full border px-3 py-1 text-[12px] font-semibold transition"
            style={tabButtonStyle('similar')}
          >
            Similar
          </button>
        </div>
      </div>

      <div className="hide-scrollbar flex-1 overflow-y-auto px-4 py-4">
        {displayTrack ? (
          <div className="space-y-3">
            {activeTab !== 'lyrics' && activeTab !== 'similar' ? (
              <>
                <div
                  className="overflow-hidden rounded-[18px]"
                  style={{
                    background: displayTrack.albumArt || displayTrack.thumbnail
                      ? 'var(--bg-card)'
                      : 'linear-gradient(135deg, var(--accent), var(--bg-highlight))',
                  }}
                >
                  {displayTrack.albumArt || displayTrack.thumbnail ? (
                    <img
                      src={displayTrack.albumArt || displayTrack.thumbnail}
                      alt={displayTrack.title}
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-square items-center justify-center text-white">
                      <Music4 className="h-10 w-10" />
                    </div>
                  )}
                </div>

                <div className="rounded-[18px] p-4" style={{ background: 'var(--bg-card)' }}>
                  <p className="text-xl font-extrabold leading-tight text-white">
                    {displayTrack.artist || 'Unknown artist'}
                  </p>
                  <p className="mt-1 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Featured on {displayTrack.title || 'the current track'}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <Users className="h-4 w-4" />
                    <span>{formatListeners(displayTrack)} monthly listeners</span>
                  </div>
                </div>

                <div className="rounded-[18px] p-4" style={{ background: 'var(--bg-card)' }}>
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" style={{ color: 'var(--accent-light)' }} />
                    <p className="text-sm font-semibold text-white">About the artist</p>
                  </div>
                  <p className="text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
                    {isEnriching ? 'Pulling richer artist details into the session...' : aboutText}
                  </p>
                </div>
              </>
            ) : null}

            {activeTab !== 'similar' ? (
              <div
                ref={lyricsSectionRef}
                className="rounded-[12px] p-4"
                style={{ background: 'var(--bg-card)' }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <Mic2 className="h-4 w-4" style={{ color: 'var(--accent-light)' }} />
                  <p className="text-sm font-semibold text-white">Lyrics</p>
                </div>

                {isEnriching ? (
                  <div className="space-y-3">
                    {[0, 1, 2].map((item) => (
                      <div
                        key={item}
                        className="h-4 animate-pulse rounded-full"
                        style={{
                          width: item === 1 ? '78%' : item === 2 ? '64%' : '88%',
                          background: 'var(--bg-elevated)',
                        }}
                      />
                    ))}
                  </div>
                ) : hasLyrics ? (
                  <div
                    className="hide-scrollbar overflow-y-auto pr-1"
                    style={{ maxHeight: isExpanded ? 'calc(100vh - 260px)' : '200px' }}
                  >
                    <div className="space-y-1">
                      {lyricLines.map((line, index) => {
                        const isEmpty = line === ''
                        const isActive = index === activeLineIndex
                        const isPast = index < activeLineIndex

                        return (
                          <p
                            key={`${line}-${index}`}
                            ref={isActive ? activeLyricLineRef : null}
                            className="text-[16px] leading-[1.8]"
                            style={{
                              marginTop: isEmpty ? '8px' : '0px',
                              marginBottom: isEmpty ? '8px' : '0px',
                              color: isEmpty
                                ? 'transparent'
                                : isActive
                                ? 'var(--text-primary)'
                                : isPast
                                ? 'var(--text-muted)'
                                : 'var(--text-secondary)',
                              fontWeight: isActive ? 700 : 400,
                            }}
                          >
                            {isEmpty ? '\u00A0' : line}
                          </p>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                    Lyrics not available for this track
                  </p>
                )}
              </div>
            ) : null}

            {activeTab !== 'lyrics' && activeTab !== 'similar' ? (
              <>
                <div className="rounded-[18px] p-4" style={{ background: 'var(--bg-card)' }}>
                  <div className="mb-3 flex items-center gap-2">
                    <Disc3 className="h-4 w-4" style={{ color: 'var(--accent-light)' }} />
                    <p className="text-sm font-semibold text-white">Track details</p>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span style={{ color: 'var(--text-secondary)' }}>Current track</span>
                      <span className="truncate text-right text-white">{displayTrack.title}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span style={{ color: 'var(--text-secondary)' }}>Album</span>
                      <span className="truncate text-right text-white">
                        {displayTrack.albumName || 'Single release'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span style={{ color: 'var(--text-secondary)' }}>Release</span>
                      <span className="truncate text-right text-white">
                        {formatReleaseDate(displayTrack.releaseDate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span style={{ color: 'var(--text-secondary)' }}>Duration</span>
                      <span className="truncate text-right text-white">{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[18px] p-4" style={{ background: 'var(--bg-card)' }}>
                  <div className="mb-3 flex items-center gap-2">
                    <Mic2 className="h-4 w-4" style={{ color: 'var(--accent-light)' }} />
                    <p className="text-sm font-semibold text-white">Artist tags</p>
                  </div>
                  {artistTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {artistTags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border px-[10px] py-[3px] text-[11px] font-semibold"
                          style={{
                            borderColor: 'rgba(124, 58, 237, 0.3)',
                            background: 'rgba(124, 58, 237, 0.1)',
                            color: 'var(--accent-light)',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Tags appear here when Reverberate enriches the track metadata.
                    </p>
                  )}
                </div>
              </>
            ) : null}

            {activeTab !== 'lyrics' ? (
              <div className="rounded-[18px] p-4" style={{ background: 'var(--bg-card)' }}>
                <div className="mb-3 flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" style={{ color: 'var(--accent-light)' }} />
                  <p className="text-sm font-semibold text-white">Fans also explore</p>
                </div>
                {similarArtists.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {similarArtists.slice(0, 6).map((artist) => (
                      <button
                        key={artist.name}
                        type="button"
                        onClick={() => navigate(`/search?q=${encodeURIComponent(artist.name)}`)}
                        className="flex items-center gap-3 rounded-xl p-3 text-left transition"
                        style={{ background: 'var(--bg-elevated)' }}
                      >
                        {artist.image ? (
                          <img
                            src={artist.image}
                            alt={artist.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                            style={{ background: 'var(--accent)' }}
                          >
                            {artist.name.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <p className="truncate text-[12px] font-semibold text-white">{artist.name}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Similar artists will appear here once richer recommendations are available.
                  </p>
                )}
              </div>
            ) : null}
          </div>
        ) : (
          <div
            className="flex h-full flex-col items-center justify-center rounded-[18px] border border-dashed p-6 text-center"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            <Music4 className="mb-4 h-10 w-10" style={{ color: 'var(--text-muted)' }} />
            <p className="text-base font-semibold text-white">Start playing something</p>
            <p className="mt-2 text-sm leading-6">
              This panel turns into an artist-focused companion once a track is active.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
