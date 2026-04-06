import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore.js'

/**
 * Requires an authenticated session. On full page refresh, `App` runs
 * `loadUserFromStorage()`, which reads the JWT from `localStorage` and
 * calls `GET /auth/me` before `isLoading` becomes false.
 */
function FullPageSpinner() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div
        className="h-10 w-10 animate-spin rounded-full border-2"
        style={{
          borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)',
          borderTopColor: 'var(--accent)',
        }}
        aria-hidden
      />
      <span className="sr-only">Loading</span>
    </div>
  )
}

export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)

  if (isLoading) {
    return <FullPageSpinner />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
