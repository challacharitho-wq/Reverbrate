import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../Sidebar/Sidebar.jsx'
import Topbar from '../Topbar/Topbar.jsx'
import Player from '../Player/Player.jsx'

function usePageTitle() {
  const { pathname } = useLocation()

  if (pathname.startsWith('/playlist/')) return 'Playlist'
  if (pathname.startsWith('/artist/')) return 'Artist'

  const map = {
    '/dashboard': 'Home',
    '/search': 'Search',
    '/library': 'Your Library',
    '/history': 'History',
  }

  return map[pathname] || 'Reverberate'
}

export default function AppLayout() {
  const pageTitle = usePageTitle()

  return (
    <div
      className="relative w-full"
      style={{ background: 'var(--bg-primary)' }}
    >
      <Sidebar />

      <div
        className="flex flex-col min-h-screen"
        style={{
          marginLeft: 'var(--sidebar-width)',
          paddingBottom: 'var(--player-height)', // ✅ space for player
        }}
      >
        <Topbar title={pageTitle} />

        {/* ✅ THIS IS THE FIX */}
        <main className="flex-1 overflow-y-auto px-6 pb-6 pt-6">
          <Outlet />
        </main>
      </div>

      <Player />
    </div>
  )
}