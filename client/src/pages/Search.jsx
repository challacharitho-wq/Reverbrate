import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Clock, Music, Search as SearchIcon,
  ListPlus, X, Check, Plus
} from 'lucide-react'
import { useDebouncedValue } from '../hooks/useDebouncedValue.js'
import usePlayerStore from '../store/usePlayerStore.js'
import usePlaylistStore from '../store/usePlaylistStore.js'
import { songService } from '../services/api.js'
import { formatYouTubeDuration } from '../utils/formatDuration.js'
import toast from 'react-hot-toast'

// ── Add to Playlist Modal ──────────────────────────────
function AddToPlaylistModal({ track, onClose }) {
  const playlists      = usePlaylistStore((s) => s.playlists)
  const fetchPlaylists = usePlaylistStore((s) => s.fetchPlaylists)
  const addTrack       = usePlaylistStore((s) => s.addTrack)
  const createPlaylist = usePlaylistStore((s) => s.createPlaylist)

  const [adding, setAdding]       = useState(null)   // playlistId being added
  const [added, setAdded]         = useState([])      // playlistIds already added
  const [newName, setNewName]     = useState('')
  const [creating, setCreating]   = useState(false)

  useEffect(() => {
    fetchPlaylists()
  }, [fetchPlaylists])

  const handleAdd = async (playlistId) => {
    setAdding(playlistId)
    try {
      await addTrack(playlistId, {
        youtubeId : track.youtubeId || track.id,
        title     : track.title,
        artist    : track.artist,
        thumbnail : track.thumbnail,
      })
      setAdded((prev) => [...prev, playlistId])
      toast.success('Added to playlist!')
    } catch {
      toast.error('Failed to add track')
    } finally {
      setAdding(null)
    }
  }

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      await createPlaylist(newName.trim())
      setNewName('')
      toast.success(`Playlist "${newName.trim()}" created!`)
      fetchPlaylists()
    } catch {
      toast.error('Failed to create playlist')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-3xl border
                   border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-white">
              Add to Playlist
            </h2>
            <p className="mt-1 truncate text-sm text-zinc-400">
              {track.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-zinc-700
                       p-2 text-zinc-400 hover:text-white
                       transition flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Create new playlist */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="New playlist name..."
            className="flex-1 rounded-xl border border-zinc-700
                       bg-zinc-900 px-4 py-2.5 text-sm text-white
                       placeholder:text-zinc-500 outline-none
                       focus:border-violet-500 transition"
          />
          <button
            onClick={handleCreate}
            disabled={!newName.trim() || creating}
            className="flex items-center gap-2 rounded-xl
                       bg-violet-600 px-4 py-2.5 text-sm
                       font-medium text-white transition
                       hover:bg-violet-500 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {creating ? 'Creating...' : 'Create'}
          </button>
        </div>

        {/* Playlist list */}
        <div className="max-h-64 space-y-2 overflow-y-auto
                        pr-1">
          {playlists.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-500">
              No playlists yet. Create one above.
            </p>
          ) : (
            playlists.map((playlist) => {
              const isAdded   = added.includes(playlist._id)
              const isAdding  = adding === playlist._id
              return (
                <button
                  key={playlist._id}
                  onClick={() =>
                    !isAdded && handleAdd(playlist._id)}
                  disabled={isAdded || isAdding}
                  className={`flex w-full items-center
                              justify-between gap-3 rounded-2xl
                              border p-3 text-left transition
                              ${isAdded
                                ? 'border-violet-500/50 bg-violet-500/10'
                                : 'border-zinc-800 bg-zinc-900 hover:border-violet-500'
                              }`}
                >
                  <div className="flex items-center gap-3
                                  min-w-0 flex-1">
                    <div
                      className="flex h-10 w-10 flex-shrink-0
                                 items-center justify-center
                                 rounded-xl bg-zinc-800"
                    >
                      <Music className="h-4 w-4 text-violet-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium
                                    text-white">
                        {playlist.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {playlist.tracks?.length ?? 0} tracks
                      </p>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {isAdded ? (
                      <Check className="h-5 w-5 text-violet-400" />
                    ) : isAdding ? (
                      <div className="h-5 w-5 animate-spin
                                      rounded-full border-2
                                      border-zinc-600
                                      border-t-violet-400" />
                    ) : (
                      <ListPlus className="h-5 w-5
                                          text-zinc-400" />
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Search Page ───────────────────────────────────
export default function Search() {
  const [searchParams]              = useSearchParams()
  const urlQuery                    = searchParams.get('q') || ''
  const [query, setQuery]           = useState(urlQuery)
  const [results, setResults]       = useState([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const [modalTrack, setModalTrack] = useState(null)

  const debouncedQuery  = useDebouncedValue(query, 600)
  const setQueue        = usePlayerStore((s) => s.setQueue)
  const playYouTubeTrack = usePlayerStore((s) => s.playYouTubeTrack)
  const currentTrack    = usePlayerStore((s) => s.currentTrack)

  useEffect(() => {
    setQuery(urlQuery)
  }, [urlQuery])

  useEffect(() => {
    const loadResults = async () => {
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
      } catch (err) {
        console.error(err)
        setError('Unable to search right now. Try again.')
        setResults([])
      } finally {
        setLoading(false)
      }
    }
    loadResults()
  }, [debouncedQuery])

  const handlePlayTrack = (track, index) => {
    setQueue(results, index)
    playYouTubeTrack(track)
  }

  return (
    <>
      {/* Add to playlist modal */}
      {modalTrack && (
        <AddToPlaylistModal
          track={modalTrack}
          onClose={() => setModalTrack(null)}
        />
      )}

      <div className="p-6 pb-32">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Search box */}
          <div className="rounded-3xl border border-zinc-800
                          bg-zinc-950 p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <SearchIcon className="h-5 w-5 text-violet-400" />
              <h1 className="text-xl font-semibold">
                Search YouTube tracks
              </h1>
            </div>
            <div className="relative mt-4">
              <SearchIcon
                className="pointer-events-none absolute left-4
                           top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for songs, artists..."
                className="w-full rounded-2xl border border-zinc-800
                           bg-zinc-900 px-4 py-4 pl-12 pr-6
                           text-white outline-none
                           focus:border-violet-500 transition"
              />
            </div>
            <p className="mt-3 text-sm text-zinc-400">
              Results come from YouTube. Click a row to play,
              or use the playlist button to save.
            </p>
            {error && (
              <p className="mt-3 text-sm text-red-400">{error}</p>
            )}
          </div>

          {/* Results */}
          <div className="space-y-4">
            {loading ? (
              <div className="rounded-3xl border border-zinc-800
                              bg-zinc-950 p-10 text-center
                              text-zinc-400">
                <div className="mx-auto mb-4 h-10 w-10 animate-spin
                                rounded-full border-2
                                border-t-violet-400 border-zinc-700"
                />
                Searching the musical universe...
              </div>

            ) : results.length > 0 ? (
              <div className="grid gap-2 overflow-y-visible">
                <p className="px-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Showing {results.length} results for '{debouncedQuery}'
                </p>
                {/* Header row */}
                <div className="grid items-center gap-4 px-4 py-3
                                text-sm font-semibold text-zinc-400
                                border-b border-zinc-800"
                     style={{
                       gridTemplateColumns:
                         '2rem 1fr 1fr auto auto'
                     }}
                >
                  <span>#</span>
                  <span>Title</span>
                  <span>Channel</span>
                  <Clock className="h-4 w-4" />
                  <span className="text-right">Save</span>
                </div>

                {results.map((track, index) => {
                  const isActive =
                    currentTrack?.youtubeId === track.youtubeId ||
                    currentTrack?.id === track.youtubeId

                  return (
                    <div
                      key={track.youtubeId || index}
                      className={`group grid w-full cursor-pointer
                                  items-center gap-4 rounded-2xl
                                  border px-4 py-3 text-left
                                  transition
                                  ${isActive
                                    ? 'border-violet-500 bg-violet-500/10'
                                    : 'border-zinc-800 bg-zinc-950 hover:border-violet-500 hover:bg-zinc-900'
                                  }`}
                      style={{
                        gridTemplateColumns:
                          '2rem 1fr 1fr auto auto'
                      }}
                      onClick={() => handlePlayTrack(track, index)}
                    >
                      {/* Index / play indicator */}
                      <span className="flex h-8 w-8 items-center
                                       justify-center text-sm
                                       text-zinc-400">
                        {isActive
                          ? <div className="h-3 w-3 rounded-full
                                            bg-violet-500
                                            animate-pulse" />
                          : index + 1}
                      </span>

                      {/* Thumbnail + title */}
                      <div className="flex items-center gap-3
                                      overflow-hidden">
                        <img
                          src={track.thumbnail}
                          alt={track.title}
                          className="h-10 w-10 rounded-xl
                                     object-cover flex-shrink-0"
                        />
                        <p className="truncate text-sm font-semibold
                                      text-white">
                          {track.title}
                        </p>
                      </div>

                      {/* Channel */}
                      <span className="truncate text-sm
                                       text-zinc-400">
                        {track.artist || track.channelTitle}
                      </span>

                      {/* Duration */}
                      <span className="text-sm text-zinc-400
                                       tabular-nums">
                        {formatYouTubeDuration(track.duration)}
                      </span>

                      {/* Add to playlist button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setModalTrack(track)
                        }}
                        className="flex items-center gap-1.5
                                   rounded-full border border-zinc-700
                                   bg-zinc-900 px-3 py-2 text-xs
                                   font-semibold text-zinc-300
                                   transition hover:border-violet-500
                                   hover:text-white"
                      >
                        <ListPlus className="h-3.5 w-3.5" />
                        Save
                      </button>
                    </div>
                  )
                })}
              </div>

            ) : debouncedQuery ? (
              <div className="rounded-3xl border border-zinc-800
                              bg-zinc-950 p-10 text-center
                              text-zinc-400">
                <Music className="mx-auto mb-4 h-12 w-12 opacity-20" />
                No results for "{debouncedQuery}"
              </div>
            ) : (
              <div className="rounded-3xl border border-zinc-800
                              bg-zinc-950 p-10 text-center
                              text-zinc-400">
                <SearchIcon className="mx-auto mb-4 h-12 w-12
                                       opacity-20" />
                Search for your favorite music
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
