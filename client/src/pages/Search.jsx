import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Check,
  Clock,
  ListPlus,
  Music,
  Plus,
  Search as SearchIcon,
  Sparkles,
  X,
} from 'lucide-react'
import { useDebouncedValue } from '../hooks/useDebouncedValue.js'
import usePlayerStore from '../store/usePlayerStore.js'
import usePlaylistStore from '../store/usePlaylistStore.js'
import { songService } from '../services/api.js'
import { formatYouTubeDuration } from '../utils/formatDuration.js'
import toast from 'react-hot-toast'

function AddToPlaylistModal({ track, onClose }) {
  const playlists = usePlaylistStore((s) => s.playlists)
  const fetchPlaylists = usePlaylistStore((s) => s.fetchPlaylists)
  const addTrack = usePlaylistStore((s) => s.addTrack)
  const createPlaylist = usePlaylistStore((s) => s.createPlaylist)

  const [adding, setAdding] = useState(null)
  const [added, setAdded] = useState([])
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchPlaylists()
  }, [fetchPlaylists])

  async function handleAdd(playlistId) {
    setAdding(playlistId)
    try {
      await addTrack(playlistId, {
        youtubeId: track.youtubeId || track.id,
        title: track.title,
        artist: track.artist,
        thumbnail: track.thumbnail,
      })
      setAdded((prev) => [...prev, playlistId])
      toast.success('Added to playlist')
    } catch {
      toast.error('Failed to add track')
    } finally {
      setAdding(null)
    }
  }

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    try {
      await createPlaylist(newName.trim())
      setNewName('')
      toast.success('Playlist created')
      fetchPlaylists()
    } catch {
      toast.error('Failed to create playlist')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close playlist modal"
      />

      <div
        className="relative w-full max-w-lg rounded-[28px] border p-6"
        style={{
          background: 'linear-gradient(180deg, #141414, #0e0e0e)',
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.26em]" style={{ color: 'var(--text-muted)' }}>
              Save Track
            </p>
            <h2 className="mt-2 truncate text-xl font-bold text-white">{track.title}</h2>
            <p className="mt-1 truncate text-sm" style={{ color: 'var(--text-secondary)' }}>
              {track.artist || 'Unknown artist'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="glass-button h-10 w-10" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-5 flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleCreate()}
            placeholder="Create a new playlist"
            className="w-full rounded-xl border bg-transparent px-4 py-3 text-sm text-white outline-none"
            style={{ borderColor: 'var(--border)' }}
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={!newName.trim() || creating}
            className="rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: 'var(--accent)' }}
          >
            <span className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {creating ? 'Creating' : 'Create'}
            </span>
          </button>
        </div>

        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {playlists.length > 0 ? (
            playlists.map((playlist) => {
              const isAdded = added.includes(playlist._id)
              const isAdding = adding === playlist._id

              return (
                <button
                  key={playlist._id}
                  type="button"
                  disabled={isAdded || isAdding}
                  onClick={() => !isAdded && handleAdd(playlist._id)}
                  className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition"
                  style={{
                    background: isAdded ? 'rgba(124, 58, 237, 0.18)' : 'var(--bg-card)',
                  }}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{playlist.name}</p>
                    <p className="truncate text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {playlist.tracks?.length ?? 0} tracks
                    </p>
                  </div>
                  {isAdded ? (
                    <Check className="h-4 w-4" style={{ color: 'var(--accent-light)' }} />
                  ) : isAdding ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  ) : (
                    <ListPlus className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
                  )}
                </button>
              )
            })
          ) : (
            <div className="rounded-2xl px-4 py-6 text-center text-sm" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
              No playlists yet. Create one above.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const browseTiles = [
  { title: 'Pop Pulse', colors: ['#ef4444', '#f97316'] },
  { title: 'Night Drive', colors: ['#1d4ed8', '#7c3aed'] },
  { title: 'Indie Lift', colors: ['#10b981', '#0f766e'] },
  { title: 'Focus Beats', colors: ['#a855f7', '#4c1d95'] },
]

export default function Search() {
  const [searchParams] = useSearchParams()
  const urlQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(urlQuery)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modalTrack, setModalTrack] = useState(null)

  const debouncedQuery = useDebouncedValue(query, 600)
  const setQueue = usePlayerStore((s) => s.setQueue)
  const playYouTubeTrack = usePlayerStore((s) => s.playYouTubeTrack)
  const currentTrack = usePlayerStore((s) => s.currentTrack)

  useEffect(() => {
    setQuery(urlQuery)
  }, [urlQuery])

  useEffect(() => {
    async function loadResults() {
      if (!debouncedQuery.trim()) {
        setResults([])
        setError(null)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const { data } = await songService.search(debouncedQuery)
        setResults(data.results ?? [])
      } catch (loadError) {
        const message =
          loadError?.response?.data?.message ||
          loadError?.message ||
          'Unable to search right now. Try again.'
        setError(message)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    loadResults()
  }, [debouncedQuery])

  function handlePlayTrack(track, index) {
    setQueue(results, index)
    playYouTubeTrack(track)
  }

  return (
    <>
      {modalTrack ? (
        <AddToPlaylistModal track={modalTrack} onClose={() => setModalTrack(null)} />
      ) : null}

      <div className="space-y-8 pb-6">
        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div
            className="rounded-[28px] px-7 py-7"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.5), rgba(29,78,216,0.45) 42%, rgba(15,15,15,1) 100%)',
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: 'rgba(255,255,255,0.72)' }}>
              Search
            </p>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-white">
              Find the next track to queue.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6" style={{ color: 'rgba(255,255,255,0.76)' }}>
              Search YouTube-backed tracks, preview results instantly, and save anything good into your playlists without leaving the desktop layout.
            </p>

            <div
              className="mt-6 flex items-center gap-3 rounded-full border px-5 py-4"
              style={{
                background: 'rgba(0,0,0,0.3)',
                borderColor: 'rgba(255,255,255,0.08)',
              }}
            >
              <SearchIcon className="h-5 w-5 shrink-0 text-white/70" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search songs, artists, channels..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/55"
              />
            </div>

            {error ? (
              <p className="mt-4 text-sm text-red-300">{error}</p>
            ) : null}
          </div>

          <div className="rounded-[28px] p-6" style={{ background: 'var(--bg-card)' }}>
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4" style={{ color: 'var(--accent-light)' }} />
              <p className="text-sm font-semibold text-white">Browse all</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {browseTiles.map((tile) => (
                <button
                  key={tile.title}
                  type="button"
                  onClick={() => setQuery(tile.title)}
                  className="min-h-28 overflow-hidden rounded-[20px] p-4 text-left transition hover:scale-[1.01]"
                  style={{
                    background: `linear-gradient(135deg, ${tile.colors[0]}, ${tile.colors[1]})`,
                  }}
                >
                  <p className="max-w-[110px] text-lg font-extrabold leading-tight text-white">
                    {tile.title}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[28px] p-5" style={{ background: 'var(--bg-main)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="mb-4 flex items-center justify-between gap-4 px-2">
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-white">
                {debouncedQuery ? `Results for "${debouncedQuery}"` : 'Search results'}
              </h3>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                Click any row to play immediately, or save it to a playlist.
              </p>
            </div>
            {results.length > 0 ? (
              <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
                {results.length} found
              </span>
            ) : null}
          </div>

          {loading ? (
            <div className="rounded-[22px] p-10 text-center" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-white" />
              Searching across YouTube tracks...
            </div>
          ) : results.length > 0 ? (
            <div className="overflow-hidden rounded-[22px]" style={{ background: 'var(--bg-card)' }}>
              <div
                className="grid items-center gap-4 border-b px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em]"
                style={{
                  gridTemplateColumns: '44px minmax(0,1.5fr) minmax(0,1fr) 80px 90px',
                  borderColor: 'rgba(255,255,255,0.06)',
                  color: 'var(--text-muted)',
                }}
              >
                <span>#</span>
                <span>Title</span>
                <span>Artist</span>
                <span><Clock className="h-4 w-4" /></span>
                <span className="text-right">Save</span>
              </div>

              <div>
                {results.map((track, index) => {
                  const isActive =
                    currentTrack?.youtubeId === track.youtubeId ||
                    currentTrack?.id === track.youtubeId

                  return (
                    <div
                      key={track.youtubeId || index}
                      onClick={() => handlePlayTrack(track, index)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          handlePlayTrack(track, index)
                        }
                      }}
                      className="grid w-full items-center gap-4 px-5 py-3 text-left transition"
                      style={{
                        gridTemplateColumns: '44px minmax(0,1.5fr) minmax(0,1fr) 80px 90px',
                        background: isActive ? 'rgba(124,58,237,0.12)' : 'transparent',
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <span className="text-sm font-semibold" style={{ color: isActive ? 'var(--accent-light)' : 'var(--text-secondary)' }}>
                        {isActive ? '•' : index + 1}
                      </span>

                      <div className="flex min-w-0 items-center gap-3">
                        <img
                          src={track.thumbnail}
                          alt={track.title}
                          className="h-12 w-12 rounded-xl object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">{track.title}</p>
                          <p className="truncate text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {track.channelTitle || 'YouTube'}
                          </p>
                        </div>
                      </div>

                      <span className="truncate text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {track.artist || track.channelTitle}
                      </span>

                      <span className="text-sm tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                        {formatYouTubeDuration(track.duration)}
                      </span>

                      <span className="flex justify-end">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            setModalTrack(track)
                          }}
                          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition"
                          style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
                        >
                          <ListPlus className="h-3.5 w-3.5" />
                          Save
                        </button>
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : debouncedQuery ? (
            <div className="rounded-[22px] p-10 text-center" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
              <Music className="mx-auto mb-4 h-10 w-10 opacity-50" />
              No results found for "{debouncedQuery}".
            </div>
          ) : (
            <div className="rounded-[22px] p-10 text-center" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
              <SearchIcon className="mx-auto mb-4 h-10 w-10 opacity-50" />
              Start typing to search for music.
            </div>
          )}
        </section>
      </div>
    </>
  )
}
