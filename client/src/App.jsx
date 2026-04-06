import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { useAuthStore } from './store/useAuthStore.js'
import useYouTubePlayer from './hooks/useYouTubePlayer'

import ProtectedRoute from './components/UI/ProtectedRoute.jsx'
import AppLayout from './components/UI/AppLayout.jsx'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Search from './pages/Search'
import Library from './pages/Library'
import Playlist from './pages/Playlist'
import Artist from './pages/Artist'
import History from './pages/History'
import Upload from './pages/Upload'

// ─── Loading / Redirect for "/" ───────────────────────
function HomeRedirect() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)

  if (isLoading) {
    return (
      <div
        className="flex h-screen w-full items-center justify-center"
        style={{ background: 'var(--bg-primary)' }}
      >
        <div
          className="h-10 w-10 animate-spin rounded-full border-2"
          style={{
            borderColor: 'color-mix(in srgb,var(--accent) 30%,transparent)',
            borderTopColor: 'var(--accent)',
          }}
          aria-hidden
        />
        <span className="sr-only">Loading…</span>
      </div>
    )
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />
}

// ─── Global audio hooks mounted once at root ──────────
function GlobalAudio() {
  useYouTubePlayer()
  return null
}

// ─── App ──────────────────────────────────────────────
export default function App() {
  const loadUserFromStorage = useAuthStore((s) => s.loadUserFromStorage)

  useEffect(() => {
    loadUserFromStorage()
  }, [loadUserFromStorage])

  return (
    <BrowserRouter>
      {/* Global audio engines — mounted once, never unmount */}
      <GlobalAudio />

      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/search" element={<Search />} />
            <Route path="/library" element={<Library />} />
            <Route path="/playlist/:id" element={<Playlist />} />
            <Route path="/artist/:id" element={<Artist />} />
            <Route path="/history" element={<History />} />
            <Route path="/upload" element={<Upload />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}