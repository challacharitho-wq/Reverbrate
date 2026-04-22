import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ListMusic,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search as SearchIcon,
  User,
} from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore.js'

function getInitials(name, email) {
  const value = (name || email || 'R').trim()
  const parts = value.split(/\s+/).filter(Boolean)
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return value.slice(0, 2).toUpperCase()
}

export default function Topbar({
  title,
  subtitle,
  showLeftSidebar,
  leftSidebarCollapsed,
  onToggleLeftSidebar,
  onToggleLeftSidebarCollapse,
  showArtistPanel,
  onToggleArtistPanel,
}) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const inputRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function submitSearch() {
    const next = query.trim()
    navigate(next ? `/search?q=${encodeURIComponent(next)}` : '/search')
  }

  function handleLogout() {
    setMenuOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header
      className="sticky top-0 z-20 border-b px-6 pb-4 pt-5"
      style={{
        background: 'linear-gradient(180deg, rgba(15,15,15,0.96), rgba(15,15,15,0.86))',
        borderColor: 'var(--border)',
        backdropFilter: 'blur(18px)',
      }}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="glass-button h-11 w-11"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => navigate(1)}
            className="glass-button h-11 w-11"
            aria-label="Go forward"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onToggleLeftSidebar}
            className="glass-button h-11 w-11"
            style={{
              background: showLeftSidebar ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.55)',
              color: showLeftSidebar ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
            aria-label={showLeftSidebar ? 'Hide sidebar' : 'Show sidebar'}
            title={showLeftSidebar ? 'Hide sidebar' : 'Show sidebar'}
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onToggleLeftSidebarCollapse}
            className="glass-button h-11 w-11"
            style={{
              background: showLeftSidebar ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.55)',
              color: showLeftSidebar ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
            aria-label={leftSidebarCollapsed ? 'Expand sidebar' : 'Compress sidebar'}
            title={leftSidebarCollapsed ? 'Expand sidebar' : 'Compress sidebar'}
          >
            {leftSidebarCollapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            submitSearch()
          }}
          className="mx-auto flex w-full max-w-xl items-center"
        >
          <div
            className="flex w-full items-center gap-3 rounded-full border px-4 py-3"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
            }}
            onClick={() => inputRef.current?.focus()}
          >
            <SearchIcon className="h-4 w-4 shrink-0" style={{ color: 'var(--text-secondary)' }} />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="topbar-search-input w-full border-0 bg-transparent text-sm"
              style={{ color: 'var(--text-primary)' }}
              placeholder="What do you want to play?"
              aria-label="Search"
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleArtistPanel}
            title="Artist Focus"
            className="flex h-9 w-9 items-center justify-center rounded-full transition"
            style={{
              background: showArtistPanel ? 'var(--accent)' : 'rgba(0,0,0,0.7)',
              color: showArtistPanel ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
            onMouseEnter={(event) => {
              if (!showArtistPanel) {
                event.currentTarget.style.background = 'var(--bg-highlight)'
                event.currentTarget.style.color = 'var(--text-primary)'
              }
            }}
            onMouseLeave={(event) => {
              if (!showArtistPanel) {
                event.currentTarget.style.background = 'rgba(0,0,0,0.7)'
                event.currentTarget.style.color = 'var(--text-secondary)'
              }
            }}
            aria-label="Artist Focus"
          >
            <ListMusic className="h-4 w-4" />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex h-9 items-center gap-1 rounded-full pl-1 pr-2 transition"
              style={{
                background: 'rgba(0,0,0,0.7)',
                color: 'var(--text-primary)',
              }}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              aria-label="Account menu"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || 'User'}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: 'var(--accent)' }}
                >
                  {getInitials(user?.name, user?.email)}
                </div>
              )}
              <ChevronDown className="h-3.5 w-3.5" style={{ color: 'var(--text-secondary)' }} />
            </button>

            {menuOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-2 min-w-[180px] overflow-hidden rounded-2xl border py-1"
                style={{
                  background: 'var(--bg-card)',
                  borderColor: 'var(--border)',
                  boxShadow: '0 16px 32px rgba(0, 0, 0, 0.32)',
                }}
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm transition"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.background = 'var(--bg-elevated)'
                    event.currentTarget.style.color = 'var(--text-primary)'
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background = 'transparent'
                    event.currentTarget.style.color = 'var(--text-secondary)'
                  }}
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm transition"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.background = 'var(--bg-elevated)'
                    event.currentTarget.style.color = 'rgb(239, 68, 68)'
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background = 'transparent'
                    event.currentTarget.style.color = 'var(--text-secondary)'
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between gap-6">
        <div className="min-w-0">
          <h1 className="truncate text-[2rem] font-extrabold tracking-tight text-white">
            {title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm" style={{ color: 'var(--text-secondary)' }}>
            {subtitle}
          </p>
        </div>

        <div
          className="hidden rounded-2xl px-4 py-3 text-right lg:block"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.18), rgba(255,255,255,0.03))',
            border: '1px solid var(--border)',
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: 'var(--text-muted)' }}>
            Workspace
          </p>
          <p className="mt-1 text-sm font-semibold text-white">
            Sidebars can be hidden or compressed
          </p>
        </div>
      </div>
    </header>
  )
}
