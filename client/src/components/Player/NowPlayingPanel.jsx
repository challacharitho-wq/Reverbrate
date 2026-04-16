import { useEffect, useRef, useState } from 'react'
import {
  Heart, Pause, Play, SkipBack,
  SkipForward, Share2, X, Music,
  Mic2
} from 'lucide-react'
import usePlayerStore from '../../store/usePlayerStore.js'
import useLikeStore from '../../store/useLikeStore.js'
import useYouTubePlayer from '../../hooks/useYouTubePlayer'
import { songService } from '../../services/api.js'
import toast from 'react-hot-toast'
import {
  formatTime,
} from '../../utils/formatDuration.js'

export default function NowPlayingPanel({
  open, onClose, track, isEnriching
}) {
  const [activeTab, setActiveTab]   = useState('lyrics')
  const [similarFallback, setSimilarFallback] = useState([])
  const [loadingSimilarFallback, setLoadingSimilarFallback] = useState(false)
  const lyricsRef = useRef(null)
  const activeLyricRef = useRef(null)

  const isPlaying     = usePlayerStore((s) => s.isPlaying)
  const duration      = usePlayerStore((s) => s.duration)
  const currentTime   = usePlayerStore((s) => s.currentTime)
  const togglePlayPause = usePlayerStore((s) => s.togglePlayPause)
  const playNext      = usePlayerStore((s) => s.playNext)
  const playPrev      = usePlayerStore((s) => s.playPrev)
  const playYouTubeTrack = usePlayerStore((s) => s.playYouTubeTrack)
  const fetchLikes = useLikeStore((s) => s.fetchLikes)
  const toggleLike = useLikeStore((s) => s.toggleLike)
  const likedIds = useLikeStore((s) => s.likedIds)

  const { pauseVideo, resumeVideo, seekTo } = useYouTubePlayer()

  // ── ESC to close ───────────────────────────────────
  useEffect(() => {
    if (!open) return
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [open, onClose])

  // ── Reset on close ─────────────────────────────────
  useEffect(() => {
    if (!open) {
      setActiveTab('lyrics')
      setSimilarFallback([])
      setLoadingSimilarFallback(false)
    }
  }, [open])

  useEffect(() => {
    if (open) {
      fetchLikes()
    }
  }, [fetchLikes, open])

  // ── Parse lyrics into lines ────────────────────────
  const lyricLines = (track?.lyrics || '')
    .split('\n')
    .map((line) => line.trim())

  // ── Estimate active line by time ───────────────────
  // Simple time-based sync: divide song into equal chunks per line
  const totalLines    = lyricLines.length
  const activeLine    = duration && totalLines
    ? Math.min(
        Math.floor((currentTime / duration) * totalLines),
        totalLines - 1
      )
    : 0

  // ── Auto-scroll active lyric line into view ────────
  useEffect(() => {
    if (activeTab !== 'lyrics') return
    if (activeLyricRef.current && lyricsRef.current) {
      activeLyricRef.current.scrollIntoView({
        behavior : 'smooth',
        block    : 'center',
      })
    }
  }, [activeLine, activeTab])

  // ── Controls ───────────────────────────────────────
  const handlePlayPause = () => {
    if (!track) return
    if (isPlaying) pauseVideo()
    else resumeVideo()
    togglePlayPause()
  }

  const handleSeek = (e) => {
    if (!duration) return
    const rect    = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    seekTo(Math.max(0, Math.min(1, percent)) * duration)
  }

  const handleShare = async () => {
    const url = `https://youtube.com/watch?v=${track.youtubeId || track.id}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: track.title,
          text: `${track.title} by ${track.artist}`,
          url,
        })
        return
      }

      await navigator.clipboard.writeText(url)
      toast.success('Link copied!')
    } catch (err) {
      console.error('[nowPlaying] share failed', err)
      toast.error('Unable to share track')
    }
  }

  const handleToggleLike = async () => {
    try {
      const liked = await toggleLike(track)
      if (liked) {
        toast.success('Added to Liked Songs')
      } else {
        toast('Removed from Liked Songs')
      }
    } catch (err) {
      console.error('[nowPlaying] toggleLike failed', err)
      toast.error('Could not update liked songs')
    }
  }

  const handleFindSimilar = async () => {
    if (!track?.artist) return

    setLoadingSimilarFallback(true)

    try {
      const { data } = await songService.search(`${track.artist} similar artists`)
      const results = data?.results || []
      const uniqueArtists = []
      const seen = new Set()

      results.forEach((result) => {
        const artistName = result.artist || result.channelTitle || result.title
        if (!artistName || seen.has(artistName)) return
        seen.add(artistName)
        uniqueArtists.push({
          name: artistName,
          image: result.thumbnail || '',
          track: result,
        })
      })

      setSimilarFallback(uniqueArtists.slice(0, 6))
    } catch (err) {
      console.error('[nowPlaying] similar fallback failed', err)
      toast.error('Could not find similar artists')
    } finally {
      setLoadingSimilarFallback(false)
    }
  }

  const handlePlaySimilarArtist = async (artistName) => {
    try {
      const { data } = await songService.search(artistName)
      const firstTrack = data?.results?.[0]
      if (firstTrack) {
        playYouTubeTrack(firstTrack)
      }
    } catch (err) {
      console.error('[nowPlaying] play similar artist failed', err)
      toast.error('Could not load artist track')
    }
  }

  // ── Derived values ─────────────────────────────────
  const tags           = track?.artistTags   ?? []
  const similar        = track?.similarArtists ?? []
  const hasLyrics      = Boolean(track?.hasLyrics)
  const progress       = duration ? currentTime / duration : 0
  const progressPct    = Math.min(100, Math.round(progress * 100))
  const isLiked        = likedIds.has(track?.youtubeId || track?.id)
  const albumText      = [
    track?.albumName,
    track?.releaseDate?.slice(0, 4),
  ].filter(Boolean).join(' • ')

  if (!open || !track) return null

  // ── Tab config ─────────────────────────────────────
  const tabs = [
    { id: 'lyrics',  label: 'Lyrics',  icon: Mic2 },
    { id: 'similar', label: 'Similar', icon: Music },
  ]

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/95 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <section
        className="relative mx-auto flex h-full max-w-[1200px]
                   flex-col overflow-hidden rounded-[28px]
                   border border-white/10 bg-zinc-950 p-6
                   text-white shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.3em]
                          text-violet-400">
              Now Playing
            </p>
            <h2 className="mt-2 truncate text-3xl font-semibold
                           sm:text-4xl">
              {track.title}
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              {track.artist}
              {albumText
                ? <span className="ml-2 text-zinc-600">• {albumText}</span>
                : null}
            </p>
            {/* Genre tags */}
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-violet-500/30
                               bg-violet-500/10 px-3 py-0.5 text-xs
                               text-violet-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="rounded-full border border-white/10
                       bg-white/5 p-3 hover:bg-white/10
                       transition flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* BODY */}
        <div className="mt-8 grid flex-1 gap-8 overflow-hidden
                        lg:grid-cols-[1.2fr_0.9fr]">

          {/* ── LEFT ─────────────────────────────────── */}
          <div className="flex flex-col gap-6">

            {/* Album art */}
            <div className="mx-auto w-full max-w-[280px]">
              <img
                src={track.albumArt || track.thumbnail}
                alt={track.title}
                className="w-full rounded-[24px] object-cover
                           shadow-[0_8px_60px_rgba(124,58,237,0.4)]
                           aspect-square"
                style={{
                  animation: isPlaying
                    ? 'float 6s ease-in-out infinite'
                    : 'none',
                }}
              />
            </div>

            {/* Progress bar */}
            <div className="rounded-3xl bg-zinc-900/80 p-4">
              <div
                className="mb-3 h-2 cursor-pointer overflow-hidden
                           rounded-full bg-white/10 hover:h-3
                           transition-all duration-150"
                onClick={handleSeek}
              >
                <div
                  className="h-full rounded-full bg-violet-500
                             transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex justify-between
                              text-xs text-zinc-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Playback controls */}
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={playPrev}
                className="text-zinc-400 hover:text-white transition"
              >
                <SkipBack className="h-6 w-6" />
              </button>

              <button
                onClick={handlePlayPause}
                className="rounded-full bg-violet-500 p-4
                           hover:bg-violet-400 hover:scale-105
                           transition-all shadow-lg
                           shadow-violet-500/30"
              >
                {isPlaying
                  ? <Pause  className="h-6 w-6" />
                  : <Play   className="h-6 w-6" />}
              </button>

              <button
                onClick={playNext}
                className="text-zinc-400 hover:text-white transition"
              >
                <SkipForward className="h-6 w-6" />
              </button>
            </div>

            {/* Action row */}
            <div className="flex gap-4 text-sm text-zinc-400">
              <button
                type="button"
                onClick={handleToggleLike}
                className="flex items-center gap-2 rounded-full
                           border border-zinc-800 px-4 py-2
                           hover:border-violet-500 hover:text-white
                           transition"
                style={{
                  color: isLiked ? 'var(--accent-light)' : undefined,
                  borderColor: isLiked ? 'var(--accent)' : undefined,
                }}
              >
                <Heart
                  className="h-4 w-4"
                  fill={isLiked ? 'currentColor' : 'none'}
                />
                Favorite
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-2 rounded-full
                           border border-zinc-800 px-4 py-2
                           hover:border-violet-500 hover:text-white
                           transition"
              >
                <Share2 className="h-4 w-4" /> Share
              </button>
            </div>
          </div>

          {/* ── RIGHT ────────────────────────────────── */}
          <div className="flex min-h-0 flex-col gap-4">

            {/* Tabs */}
            <div className="flex gap-1 rounded-2xl bg-zinc-900 p-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex flex-1 items-center justify-center
                              gap-2 rounded-xl px-3 py-2 text-sm
                              font-medium transition
                              ${activeTab === id
                                ? 'bg-violet-600 text-white'
                                : 'text-zinc-400 hover:text-white'}`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab content — scrollable */}
            <div className="flex-1 overflow-hidden rounded-2xl
                            bg-zinc-900/50">

              {/* ── LYRICS TAB ───────────────────────── */}
              {activeTab === 'lyrics' && (
                <div
                  ref={lyricsRef}
                  className="h-full overflow-y-auto p-6
                             scroll-smooth"
                  style={{ maxHeight: '400px' }}
                >
                  {isEnriching ? (
                    // Skeleton
                    <div className="space-y-3">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="h-4 animate-pulse rounded-full
                                     bg-zinc-700"
                          style={{
                            width: `${60 + Math.random() * 35}%`,
                            opacity: 1 - i * 0.08,
                          }}
                        />
                      ))}
                    </div>
                  ) : hasLyrics ? (
                    <div className="space-y-1 pb-16">
                      {lyricLines.map((line, i) => {
                        const isActive = i === activeLine
                        const isPast   = i < activeLine
                        return (
                          <p
                            key={i}
                            ref={isActive ? activeLyricRef : null}
                            className={`py-1 text-base leading-relaxed
                                        transition-all duration-500
                                        ${line === ''
                                          ? 'my-3'
                                          : isActive
                                          ? 'text-white font-bold ' +
                                            'text-lg scale-[1.02] ' +
                                            'text-violet-300'
                                          : isPast
                                          ? 'text-zinc-600'
                                          : 'text-zinc-400'
                                        }`}
                          >
                            {line || '\u00A0'}
                          </p>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex h-full flex-col
                                    items-center justify-center
                                    gap-3 text-zinc-500">
                      <Mic2 className="h-12 w-12 opacity-20" />
                      <p className="text-sm">
                        Lyrics not available for this track
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── ARTIST TAB ───────────────────────── */}


              {/* ── SIMILAR TAB ──────────────────────── */}
              {activeTab === 'similar' && (
                <div className="h-full overflow-y-auto p-6"
                     style={{ maxHeight: '400px' }}>
                  {similar.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {similar.map((artist) => (
                        <button
                          key={artist.name}
                          type="button"
                          onClick={() => handlePlaySimilarArtist(artist.name)}
                          className="flex items-center gap-3
                                     rounded-2xl border
                                     border-zinc-800 bg-zinc-900
                                     p-3 hover:border-violet-500
                                     transition cursor-pointer text-left"
                        >
                          {artist.image ? (
                            <img
                              src={artist.image}
                              alt={artist.name}
                              className="h-10 w-10 rounded-full
                                         object-cover flex-shrink-0"
                            />
                          ) : (
                            <div
                              className="flex h-10 w-10 flex-shrink-0
                                         items-center justify-center
                                         rounded-full bg-violet-600
                                         text-white font-bold"
                            >
                              {artist.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <p className="truncate text-sm
                                        font-medium text-white">
                            {artist.name}
                          </p>
                        </button>
                      ))}
                    </div>
                  ) : similarFallback.length > 0 ? (
                    <div className="space-y-4">
                      <p className="text-sm text-zinc-400">
                        Similar artist discovery results for {track.artist}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {similarFallback.map((artist) => (
                          <button
                            key={artist.name}
                            type="button"
                            onClick={() => playYouTubeTrack(artist.track)}
                            className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-3 text-left transition hover:border-violet-500"
                          >
                            {artist.image ? (
                              <img
                                src={artist.image}
                                alt={artist.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-white">
                                {artist.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-white">
                                {artist.name}
                              </p>
                              <p className="truncate text-xs text-zinc-400">
                                Play top result
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full flex-col
                                    items-center justify-center
                                    gap-3 text-zinc-500">
                      <Music className="h-12 w-12 opacity-20" />
                      <p className="text-sm">
                        No similar artists found
                      </p>
                      {track.artist ? (
                        <button
                          type="button"
                          onClick={handleFindSimilar}
                          disabled={loadingSimilarFallback}
                          className="rounded-full px-4 py-2 text-sm transition"
                          style={{
                            background: 'var(--accent)',
                            color: 'var(--text-primary)',
                            opacity: loadingSimilarFallback ? 0.7 : 1,
                          }}
                        >
                          {loadingSimilarFallback ? 'Searching...' : 'Find Similar'}
                        </button>
                      ) : null}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Float animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  )
}
