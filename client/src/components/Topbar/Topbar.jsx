import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  ChevronDown,
  LogOut,
  Search,
  Settings,
  User,
} from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore.js'

function getInitials(name, email) {
  const n = (name || '').trim()
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return n.slice(0, 2).toUpperCase()
  }
  const e = (email || '').trim()
  if (e.length >= 2) {
    return e.slice(0, 2).toUpperCase()
  }
  return '?'
}

export default function Topbar({ title }) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const [q, setQ] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const displayName = user?.name || 'Listener'
  const email = user?.email || ''
  const avatarUrl = user?.avatar || ''

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
    const nextQuery = q.trim()
    if (!nextQuery) return
    navigate(`/search?q=${encodeURIComponent(nextQuery)}`)
    setQ('')
  }

  function handleLogout() {
    setMenuOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header
      className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-6 px-6"
      style={{
        background: 'color-mix(in srgb, var(--bg-primary) 88%, transparent)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <h1
        className="min-w-0 shrink-0 text-xl font-semibold tracking-tight"
        style={{ color: 'var(--text-primary)' }}
      >
        {title}
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          submitSearch()
        }}
        className="mx-auto flex max-w-xl flex-1 justify-center"
      >
        <div
          className="relative flex w-full max-w-md items-center rounded-full border px-3 transition"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border)',
            transitionDuration: '150ms',
          }}
        >
          <button
            type="button"
            onClick={submitSearch}
            className="flex h-8 w-8 items-center justify-center rounded-full transition"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Search"
          >
            <Search className="h-4 w-4 shrink-0" aria-hidden />
          </button>
          <input
            type="search"
            name="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && q.trim()) {
                e.preventDefault()
                submitSearch()
              }
            }}
            placeholder="Search songs, artists, albums..."
            className="topbar-search-input w-full border-0 bg-transparent py-2.5 pl-2 pr-3 text-sm"
            style={{ color: 'var(--text-primary)' }}
            aria-label="Search"
          />
        </div>
      </form>

      <div className="ml-auto flex shrink-0 items-center gap-3">
        <button
          type="button"
          className="rounded-full p-2 transition"
          style={{
            color: 'var(--text-muted)',
            transitionDuration: '150ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)'
            e.currentTarget.style.background = 'var(--bg-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)'
            e.currentTarget.style.background = 'transparent'
          }}
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-1 rounded-full p-0.5 transition"
            style={{ transitionDuration: '150ms' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-hover)'
            }}
            onMouseLeave={(e) => {
              if (!menuOpen) {
                e.currentTarget.style.background = 'transparent'
              }
            }}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label="Account menu"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold"
                style={{
                  background: 'var(--bg-card)',
                  color: 'var(--accent-light)',
                }}
              >
                {getInitials(displayName, email)}
              </div>
            )}
            <ChevronDown
              className="h-4 w-4 pr-1"
              style={{ color: 'var(--text-muted)' }}
              aria-hidden
            />
          </button>

          {menuOpen ? (
            <div
              role="menu"
              className="absolute right-0 top-full z-50 mt-2 min-w-[200px] overflow-hidden rounded-xl border py-1 shadow-lg"
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border)',
              }}
            >
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition"
                style={{
                  color: 'var(--text-secondary)',
                  transitionDuration: '150ms',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-hover)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }}
                onClick={() => setMenuOpen(false)}
              >
                <User className="h-4 w-4" aria-hidden />
                Profile
              </button>
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition"
                style={{
                  color: 'var(--text-secondary)',
                  transitionDuration: '150ms',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-hover)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }}
                onClick={() => setMenuOpen(false)}
              >
                <Settings className="h-4 w-4" aria-hidden />
                Settings
              </button>
              <div
                className="my-1 h-px"
                style={{ background: 'var(--border)' }}
              />
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition"
                style={{
                  color: 'var(--text-muted)',
                  transitionDuration: '150ms',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--logout-hover)'
                  e.currentTarget.style.background = 'var(--bg-hover)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)'
                  e.currentTarget.style.background = 'transparent'
                }}
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
