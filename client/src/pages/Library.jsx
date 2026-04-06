import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import usePlaylistStore from '../store/usePlaylistStore.js'

export default function Library() {
  const navigate = useNavigate()

  const playlists = usePlaylistStore((state) => state.playlists)
  const fetchPlaylists = usePlaylistStore((state) => state.fetchPlaylists)
  const isLoading = usePlaylistStore((state) => state.isLoading)
  const createPlaylist = usePlaylistStore((s) => s.createPlaylist)
  useEffect(() => {
    fetchPlaylists()
  }, [fetchPlaylists])

  return (
    <div className="space-y-6 px-4 pb-8">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-lg">
        <h2 className="text-2xl font-semibold text-white">Your Library</h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Browse your playlists, open a collection, and manage your favorites.
        </p>
      </div>
<div className="flex justify-between items-center mb-6">
  <h1 className="text-xl font-semibold text-white">Your Library</h1>

  <button
    onClick={() => {
      const name = prompt('Enter playlist name')
      if (name) createPlaylist(name)
    }}
    className="px-4 py-2 rounded-lg transition"
    style={{
      background: 'var(--accent)',
      color: 'var(--text-primary)',
    }}
  >
    + Create Playlist
  </button>
</div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full rounded-3xl border border-zinc-800 bg-zinc-950 p-10 text-center text-zinc-400">
            Loading playlists...
          </div>
        ) : playlists.length > 0 ? (
          playlists.map((playlist) => (
            <button
              key={playlist._id}
              type="button"
              onClick={() => navigate(`/playlist/${playlist._id}`)}
              className="group flex flex-col justify-between rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-left transition hover:border-violet-500 hover:bg-zinc-900"
            >
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-violet-400">Playlist</p>
                <h3 className="mt-3 text-lg font-semibold text-white truncate">
                  {playlist.name}
                </h3>
              </div>
              <p className="mt-6 text-sm text-zinc-400">
                {playlist.tracks?.length ?? 0} track{playlist.tracks?.length === 1 ? '' : 's'}
              </p>
            </button>
          ))
        ) : (
          <div className="col-span-full rounded-3xl border border-zinc-800 bg-zinc-950 p-10 text-center text-zinc-400">
            <p className="text-lg font-semibold text-white">No playlists yet</p>
            <p className="mt-2">Create a playlist on the Playlist page to see it here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
