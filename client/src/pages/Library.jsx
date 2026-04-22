import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Library as LibraryIcon, Plus, Shapes, Sparkles } from 'lucide-react'
import usePlaylistStore from '../store/usePlaylistStore.js'

export default function Library() {
  const navigate = useNavigate()
  const playlists = usePlaylistStore((state) => state.playlists)
  const fetchPlaylists = usePlaylistStore((state) => state.fetchPlaylists)
  const isLoading = usePlaylistStore((state) => state.isLoading)
  const createPlaylist = usePlaylistStore((state) => state.createPlaylist)

  useEffect(() => {
    fetchPlaylists()
  }, [fetchPlaylists])

  async function handleCreatePlaylist() {
    const name = window.prompt('Enter playlist name')
    if (!name?.trim()) return
    await createPlaylist(name.trim())
    fetchPlaylists()
  }

  return (
    <div className="space-y-8 pb-6">
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div
          className="rounded-[28px] px-7 py-7"
          style={{
            background: 'linear-gradient(135deg, rgba(29,185,84,0.28), rgba(124,58,237,0.34) 48%, rgba(15,15,15,1) 100%)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12">
              <LibraryIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: 'rgba(255,255,255,0.72)' }}>
                Your Library
              </p>
              <h2 className="mt-1 text-4xl font-extrabold tracking-tight text-white">
                All your playlists in one place.
              </h2>
            </div>
          </div>
          <p className="mt-5 max-w-2xl text-sm leading-6" style={{ color: 'rgba(255,255,255,0.78)' }}>
            Browse collections, open a playlist, and keep everything organized without leaving the desktop listening view.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={handleCreatePlaylist}
              className="rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.01]"
              style={{ background: '#1db954' }}
            >
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Playlist
              </span>
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] p-5" style={{ background: 'var(--bg-card)' }}>
            <div className="mb-4 flex items-center gap-2">
              <Shapes className="h-4 w-4" style={{ color: 'var(--accent-light)' }} />
              <p className="text-sm font-semibold text-white">Collections</p>
            </div>
            <p className="text-3xl font-extrabold text-white">{playlists.length}</p>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Playlists ready to open
            </p>
          </div>

          <div className="rounded-[24px] p-5" style={{ background: 'var(--bg-card)' }}>
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4" style={{ color: 'var(--accent-light)' }} />
              <p className="text-sm font-semibold text-white">Desktop mode</p>
            </div>
            <p className="text-3xl font-extrabold text-white">Curated</p>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Your playlists now live inside the new Spotify-like shell.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-white">Playlists</h3>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Open any playlist to continue listening from that collection.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="aspect-[1.12] animate-pulse rounded-[22px]"
                style={{ background: 'var(--bg-card)' }}
              />
            ))}
          </div>
        ) : playlists.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {playlists.map((playlist, index) => (
              <button
                key={playlist._id}
                type="button"
                onClick={() => navigate(`/playlist/${playlist._id}`)}
                className="overflow-hidden rounded-[24px] text-left transition hover:scale-[1.01]"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <div
                  className="flex aspect-[1.2] items-end p-5"
                  style={{
                    background: index % 3 === 0
                      ? 'linear-gradient(135deg, #1d4ed8, #0f172a)'
                      : index % 3 === 1
                      ? 'linear-gradient(135deg, var(--accent), #312e81)'
                      : 'linear-gradient(135deg, #0f766e, #134e4a)',
                  }}
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                      Playlist
                    </p>
                    <p className="mt-2 text-2xl font-extrabold tracking-tight text-white">
                      {playlist.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {playlist.tracks?.length ?? 0} track{playlist.tracks?.length === 1 ? '' : 's'}
                    </p>
                    <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Open collection
                    </p>
                  </div>
                  <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
                    View
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] p-8 text-center" style={{ background: 'var(--bg-card)' }}>
            <p className="text-xl font-bold text-white">No playlists yet</p>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Create one to start organizing your library.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
