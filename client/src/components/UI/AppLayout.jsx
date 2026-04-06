import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../Sidebar/Sidebar.jsx'
import Topbar from '../Topbar/Topbar.jsx'
import Player from '../Player/Player.jsx'

function usePageTitle() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/playlist/')) {
    return 'Playlist'
  }
  if (pathname.startsWith('/artist/')) {
    return 'Artist'
  }
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
      className="relative min-h-screen w-full"
      style={{ background: 'var(--bg-primary)' }}
    >
      <Sidebar />
      <div
        className="flex min-h-screen flex-col"
        style={{
          marginLeft: 'var(--sidebar-width)',
          marginBottom: 'var(--player-height)',
        }}
      >
        <Topbar title={pageTitle} />
        <main
          className="flex-1 overflow-y-auto px-6 pb-6"
          style={{
            height: 'calc(100vh - 64px - var(--player-height))',
            paddingTop: '24px',
          }}
        >
          <Outlet />
        </main>
      </div>
      <Player />
    </div>
  )
}
