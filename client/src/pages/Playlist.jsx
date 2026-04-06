import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Play, Trash2, Music,
  PlayCircle, ArrowLeft
} from 'lucide-react'
import usePlaylistStore from '../store/usePlaylistStore.js'
import usePlayerStore   from '../store/usePlayerStore.js'
import { formatYouTubeDuration } from '../utils/formatDuration.js'
import toast from 'react-hot-toast'

export default function Playlist() {
  const { id }       = useParams()
  const navigate     = useNavigate()

  const currentPlaylist = usePlaylistStore((s) => s.currentPlaylist)
  const fetchPlaylist   = usePlaylistStore((s) => s.fetchPlaylist)
  const removeTrack     = usePlaylistStore((s) => s.removeTrack)
  const isLoading       = usePlaylistStore((s) => s.isLoading)

  const playYouTubeTrack = usePlayerStore((s) => s.playYouTubeTrack)
  const setQueue         = usePlayerStore((s) => s.setQueue)
  const currentTrack     = usePlayerStore((s) => s.currentTrack)

  useEffect(() => {
    if (id) fetchPlaylist(id)
  }, [id, fetchPlaylist])

  const tracks = currentPlaylist?.tracks ?? []

  const handlePlayAll = () => {
    if (!tracks.length) return
    setQueue(tracks, 0)
    playYouTubeTrack(tracks[0])
    toast('Playing all tracks')
  }

  const handleRemove = async (youtubeId, title) => {
    if (!window.confirm(`Remove "${title}" from this playlist?`)) return
    try {
      await removeTrack(currentPlaylist._id, youtubeId)
      toast.success('Removed from playlist')
    } catch {
      toast.error('Failed to remove track')
    }
  }

  return (
    <div className="space-y-6 px-4 pb-32 pt-2">

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-zinc-400
                   hover:text-white transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Playlist header */}
      <div className="rounded-3xl border border-zinc-800
                      bg-zinc-950 p-6 shadow-lg">
        <p className="text-xs uppercase tracking-[0.3em]
                      text-violet-400">
          Playlist
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          {currentPlaylist?.name || 'Playlist'}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          {isLoading
            ? 'Loading…'
            : `${tracks.length} track${tracks.length === 1 ? '' : 's'}`}
        </p>

        {/* Play all */}
        {tracks.length > 0 && (
          <button
            onClick={handlePlayAll}
            className="mt-4 flex items-center gap-2 rounded-full
                       bg-violet-600 px-6 py-2.5 text-sm
                       font-semibold text-white transition
                       hover:bg-violet-500 hover:scale-105
                       shadow-lg shadow-violet-500/20"
          >
            <PlayCircle className="h-5 w-5" />
            Play All
          </button>
        )}
      </div>

      {/* Track list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-3xl
                         bg-zinc-900"
            />
          ))}
        </div>

      ) : !currentPlaylist ? (
        <div className="rounded-3xl border border-zinc-800
                        bg-zinc-950 p-10 text-center text-zinc-400">
          <p className="text-lg font-semibold text-white">
            Playlist not found
          </p>
          <p className="mt-2 text-sm">
            Check your link or return to Library.
          </p>
        </div>

      ) : tracks.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800
                        bg-zinc-950 p-10 text-center text-zinc-400">
          <Music className="mx-auto mb-3 h-12 w-12 opacity-20" />
          <p className="text-lg font-semibold text-white">
            No tracks yet
          </p>
          <p className="mt-2 text-sm">
            Add songs from Search to build this playlist.
          </p>
        </div>

      ) : (
        <div className="space-y-2">
          {tracks.map((track, index) => {
            const isActive =
              currentTrack?.youtubeId === track.youtubeId

            return (
              <div
                key={`${track.youtubeId}-${index}`}
                className={`group flex items-center gap-4
                            rounded-2xl border p-3 transition
                            ${isActive
                              ? 'border-violet-500 bg-violet-500/10'
                              : 'border-zinc-800 bg-zinc-950 hover:border-violet-500 hover:bg-zinc-900'
                            }`}
              >
                {/* Index */}
                <span className="w-6 flex-shrink-0 text-center
                                 text-sm text-zinc-500">
                  {isActive
                    ? <div className="mx-auto h-3 w-3 rounded-full
                                      bg-violet-500 animate-pulse" />
                    : index + 1}
                </span>

                {/* Thumbnail */}
                <img
                  src={track.thumbnail}
                  alt={track.title}
                  className="h-14 w-14 flex-shrink-0 rounded-xl
                             object-cover"
                  loading="lazy"
                />

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-semibold
                                 ${isActive
                                   ? 'text-violet-300'
                                   : 'text-white'}`}>
                    {track.title}
                  </p>
                  <p className="truncate text-xs text-zinc-400">
                    {track.artist || 'Unknown artist'}
                  </p>
                </div>

                {/* Duration */}
                {track.duration && (
                  <span className="flex-shrink-0 text-xs
                                   text-zinc-500 tabular-nums">
                    {formatYouTubeDuration(track.duration)}
                  </span>
                )}

                {/* Controls */}
                <div className="flex flex-shrink-0 items-center
                                gap-2 opacity-0 transition
                                group-hover:opacity-100">
                  <button
                    onClick={() => {
                      setQueue(tracks, index)
                      playYouTubeTrack(track)
                    }}
                    className="rounded-full bg-violet-600 p-2
                               text-white hover:bg-violet-500
                               transition"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                  </button>

                  <button
                    onClick={() =>
                      handleRemove(track.youtubeId, track.title)}
                    className="rounded-full bg-red-500/10 p-2
                               text-red-400 hover:bg-red-500
                               hover:text-white transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}