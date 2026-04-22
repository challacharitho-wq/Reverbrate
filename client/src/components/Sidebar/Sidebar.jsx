import { useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Album,
  Clock3,
  Home,
  Library,
  LogOut,
  Mic2,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Upload,
} from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore.js'
import usePlaylistStore from '../../store/usePlaylistStore.js'

function SidebarLink({ to, icon: Icon, label, collapsed }) {
  const IconComponent = Icon

  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `nav-link ${isActive ? 'nav-link-active' : ''} ${collapsed ? 'justify-center px-0' : ''}`
      }
    >
      <IconComponent className="h-5 w-5 shrink-0" />
      {!collapsed ? <span className="truncate">{label}</span> : null}
    </NavLink>
  )
}

export default function Sidebar({ collapsed = false, onToggleCollapse }) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const playlists = usePlaylistStore((s) => s.playlists)
  const fetchPlaylists = usePlaylistStore((s) => s.fetchPlaylists)
  const createPlaylist = usePlaylistStore((s) => s.createPlaylist)

  useEffect(() => {
    fetchPlaylists()
  }, [fetchPlaylists])

  const visiblePlaylists = playlists.slice(0, collapsed ? 5 : 8)

  async function handleCreatePlaylist() {
    const name = window.prompt('Enter playlist name')
    if (!name?.trim()) return
    await createPlaylist(name.trim())
    fetchPlaylists()
  }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside
      className="flex h-full shrink-0 flex-col overflow-hidden rounded-[20px] border"
      style={{
        width: '100%',
        background: 'var(--bg-sidebar)',
        borderColor: 'var(--border)',
      }}
    >
      <div
        className={`flex items-center ${collapsed ? 'justify-center px-3' : 'gap-3 px-5'} py-5`}
      >
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
            boxShadow: '0 16px 32px var(--accent-glow)',
          }}
        >
          <Mic2 className="h-5 w-5 text-white" />
        </div>

        {!collapsed ? (
          <>
            <div className="min-w-0 flex-1">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.32em]"
                style={{ color: 'var(--text-muted)' }}
              >
                Music Hub
              </p>
              <h1 className="truncate text-lg font-extrabold tracking-tight text-white">
                Reverberate
              </h1>
            </div>
            <button
              type="button"
              onClick={onToggleCollapse}
              className="glass-button h-9 w-9"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="absolute right-3 top-5 flex h-8 w-8 items-center justify-center rounded-full transition"
            style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className={`${collapsed ? 'px-2' : 'px-3'}`}>
        <div className="surface-card p-3">
          <div className="space-y-1">
            <SidebarLink to="/dashboard" icon={Home} label="Home" collapsed={collapsed} />
            <SidebarLink to="/search" icon={Search} label="Search" collapsed={collapsed} />
            <SidebarLink to="/library" icon={Library} label="Your Library" collapsed={collapsed} />
          </div>
        </div>
      </div>

      <div className={`${collapsed ? 'px-2' : 'px-3'} pt-3`}>
        <div className="surface-card p-3">
          <div className="space-y-1">
            <SidebarLink to="/upload" icon={Upload} label="Upload" collapsed={collapsed} />
            <SidebarLink to="/history" icon={Clock3} label="Recently Played" collapsed={collapsed} />
          </div>
        </div>
      </div>

      <div className={`flex min-h-0 flex-1 flex-col ${collapsed ? 'px-2' : 'px-3'} pb-0 pt-3`}>
        <div className="surface-card flex min-h-0 flex-1 flex-col overflow-hidden p-3">
          <div className={`mb-4 flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-1`}>
            {!collapsed ? (
              <div>
                <p className="text-sm font-semibold text-white">Playlists</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Build your own corner of the library.
                </p>
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleCreatePlaylist}
              className="glass-button h-9 w-9"
              aria-label="Create playlist"
              title="Create playlist"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="hide-scrollbar min-h-0 flex-1 overflow-y-auto pr-1">
            {visiblePlaylists.length > 0 ? (
              <div className="space-y-2">
                {visiblePlaylists.map((playlist, index) => (
                  <button
                    key={playlist._id}
                    type="button"
                    onClick={() => navigate(`/playlist/${playlist._id}`)}
                    title={collapsed ? playlist.name : undefined}
                    className={`flex w-full items-center rounded-xl text-left transition ${
                      collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'
                    }`}
                    style={{ background: 'transparent' }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.background = 'var(--bg-card)'
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white"
                      style={{
                        background: index % 2 === 0
                          ? 'linear-gradient(135deg, var(--accent-light), var(--accent))'
                          : 'linear-gradient(135deg, var(--bg-elevated), var(--bg-highlight))',
                      }}
                    >
                      <Album className="h-4 w-4" />
                    </div>
                    {!collapsed ? (
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">
                          {playlist.name}
                        </p>
                        <p className="truncate text-xs" style={{ color: 'var(--text-secondary)' }}>
                          Playlist • {playlist.tracks?.length ?? 0} tracks
                        </p>
                      </div>
                    ) : null}
                  </button>
                ))}
              </div>
            ) : (
              <div
                className={`rounded-2xl border border-dashed ${collapsed ? 'p-3 text-center' : 'p-4'} text-sm`}
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              >
                {collapsed ? 'No playlists' : 'Your playlists will show up here once you create one.'}
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={`flex h-16 items-center border-t ${collapsed ? 'justify-center px-2' : 'gap-3 px-4'}`}
        style={{
          background: 'var(--bg-card)',
          borderColor: 'var(--border)',
        }}
      >
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
          style={{ background: 'var(--accent)' }}
          title={user?.name || 'Listener'}
        >
          {user?.name?.slice(0, 1)?.toUpperCase() || 'U'}
        </div>

        {!collapsed ? (
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-white">
              {user?.name || 'Listener'}
            </p>
            <p className="truncate text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {user?.email || 'Signed in'}
            </p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleLogout}
          className="flex h-9 w-9 items-center justify-center rounded-full transition"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(event) => {
            event.currentTarget.style.color = 'rgb(239, 68, 68)'
            event.currentTarget.style.background = 'var(--bg-elevated)'
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.color = 'var(--text-secondary)'
            event.currentTarget.style.background = 'transparent'
          }}
          aria-label="Log out"
          title="Log out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  )
}
