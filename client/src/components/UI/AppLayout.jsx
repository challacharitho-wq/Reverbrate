import { Outlet, useLocation } from 'react-router-dom'
import { useMemo, useState } from 'react'
import Sidebar from '../Sidebar/Sidebar.jsx'
import Topbar from '../Topbar/Topbar.jsx'
import Player from '../Player/Player.jsx'
import NowPlayingPanel from '../Player/NowPlayingPanel.jsx'
import usePlayerStore from '../../store/usePlayerStore.js'

const FULL_SIDEBAR_WIDTH = 300
const COMPACT_SIDEBAR_WIDTH = 92
const DEFAULT_ARTIST_PANEL_WIDTH = 280
const EXPANDED_ARTIST_PANEL_WIDTH = 460

function usePageMeta() {
  const { pathname } = useLocation()

  return useMemo(() => {
    if (pathname.startsWith('/playlist/')) {
      return {
        title: 'Playlist',
        subtitle: 'Your saved collection, reimagined with a desktop-first listening flow.',
      }
    }

    if (pathname.startsWith('/artist/')) {
      return {
        title: 'Artist',
        subtitle: 'Dive into the artist universe around what is playing right now.',
      }
    }

    const map = {
      '/dashboard': {
        title: 'Home',
        subtitle: 'Pick up where you left off and keep the session moving.',
      },
      '/search': {
        title: 'Search',
        subtitle: 'Find songs, artists, and fresh rabbit holes from YouTube.',
      },
      '/library': {
        title: 'Your Library',
        subtitle: 'Everything you have saved, grouped into playlists and favorites.',
      },
      '/history': {
        title: 'History',
        subtitle: 'Revisit recent plays and continue previous listening sessions.',
      },
      '/upload': {
        title: 'Upload',
        subtitle: 'Add your own tracks while keeping the desktop experience consistent.',
      },
    }

    return map[pathname] || {
      title: 'Reverberate',
      subtitle: 'A focused listening space designed around discovery and flow.',
    }
  }, [pathname])
}

export default function AppLayout() {
  const pageMeta = usePageMeta()
  const [showLeftSidebar, setShowLeftSidebar] = useState(true)
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false)
  const [showArtistPanel, setShowArtistPanel] = useState(false)
  const [artistPanelWidth, setArtistPanelWidth] = useState(DEFAULT_ARTIST_PANEL_WIDTH)

  const currentTrack = usePlayerStore((s) => s.richTrack || s.currentTrack)
  const isEnriching = usePlayerStore((s) => s.isEnriching)

  const leftSidebarWidth = leftSidebarCollapsed
    ? COMPACT_SIDEBAR_WIDTH
    : FULL_SIDEBAR_WIDTH

  return (
    <div className="h-screen w-full overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <div
        className="flex h-[calc(100vh-var(--player-height))] gap-2 overflow-hidden px-2 pt-2"
        style={{ background: 'var(--bg-base)' }}
      >
        <aside
          className="shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out"
          style={{ width: showLeftSidebar ? `${leftSidebarWidth}px` : '0px' }}
          aria-hidden={!showLeftSidebar}
        >
          <div
            className="h-full"
            style={{
              width: `${leftSidebarWidth}px`,
              opacity: showLeftSidebar ? 1 : 0,
              transition: 'opacity 220ms ease',
            }}
          >
            <Sidebar
              collapsed={leftSidebarCollapsed}
              onToggleCollapse={() => setLeftSidebarCollapsed((value) => !value)}
            />
          </div>
        </aside>

        <div
          className="flex min-w-0 flex-1 overflow-hidden rounded-[20px]"
          style={{ background: 'var(--bg-main)' }}
        >
          <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <Topbar
              title={pageMeta.title}
              subtitle={pageMeta.subtitle}
              showLeftSidebar={showLeftSidebar}
              leftSidebarCollapsed={leftSidebarCollapsed}
              onToggleLeftSidebar={() => setShowLeftSidebar((value) => !value)}
              onToggleLeftSidebarCollapse={() => {
                if (!showLeftSidebar) {
                  setShowLeftSidebar(true)
                  setLeftSidebarCollapsed(false)
                  return
                }
                setLeftSidebarCollapsed((value) => !value)
              }}
              showArtistPanel={showArtistPanel}
              onToggleArtistPanel={() => setShowArtistPanel((value) => !value)}
            />

            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8 pt-4">
              <Outlet />
            </div>
          </main>

          <aside
            className="shrink-0 overflow-hidden border-l transition-[width] duration-300 ease-in-out"
            style={{
              width: showArtistPanel ? `${artistPanelWidth}px` : '0px',
              borderColor: showArtistPanel ? 'var(--border)' : 'transparent',
              background: 'var(--bg-sidebar)',
            }}
            aria-hidden={!showArtistPanel}
          >
            <div
              className="h-full"
              style={{
                width: `${artistPanelWidth}px`,
                opacity: showArtistPanel ? 1 : 0,
                transition: 'opacity 220ms ease',
              }}
            >
              <NowPlayingPanel
                open={showArtistPanel}
                onClose={() => setShowArtistPanel(false)}
                track={currentTrack}
                isEnriching={isEnriching}
                isExpanded={artistPanelWidth > DEFAULT_ARTIST_PANEL_WIDTH}
                onExpandChange={(expanded) => {
                  setArtistPanelWidth(
                    expanded ? EXPANDED_ARTIST_PANEL_WIDTH : DEFAULT_ARTIST_PANEL_WIDTH,
                  )
                }}
              />
            </div>
          </aside>
        </div>
      </div>

      <Player
        showArtistPanel={showArtistPanel}
        onToggleArtistPanel={() => setShowArtistPanel((value) => !value)}
        onOpenArtistPanel={() => setShowArtistPanel(true)}
      />
    </div>
  )
}
