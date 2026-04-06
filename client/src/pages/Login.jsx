import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore.js'

function Spinner() {
  return (
    <span
      className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
      aria-hidden
    />
  )
}

export default function Login() {
  const navigate = useNavigate()
  const isLoading = useAuthStore((s) => s.isLoading)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const error = useAuthStore((s) => s.error)
  const login = useAuthStore((s) => s.login)
  const clearError = useAuthStore((s) => s.clearError)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isLoading, isAuthenticated, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    clearError()
    setPending(true)
    try {
      await login(email, password)
      navigate('/dashboard', { replace: true })
    } catch {
      // Error surfaced via store
    } finally {
      setPending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div
          className="h-10 w-10 rounded-full border-2 border-[#7c3aed]/30 border-t-[#7c3aed] animate-spin"
          aria-hidden
        />
        <span className="sr-only">Loading</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-100 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <h1 className="font-heading text-3xl font-semibold text-white text-center">
          Welcome back
        </h1>
        <p className="mt-2 text-center text-sm text-neutral-400">
          Log in to continue to Reverberate.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
        >
          {error ? (
            <p
              className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#141414] px-3 py-2.5 text-sm text-white outline-none ring-[#7c3aed] placeholder:text-neutral-600 focus:border-[#7c3aed]/60 focus:ring-2"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-300">
              Password
            </label>
            <div className="relative mt-1.5">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#141414] px-3 py-2.5 pr-12 text-sm text-white outline-none ring-[#7c3aed] placeholder:text-neutral-600 focus:border-[#7c3aed]/60 focus:ring-2"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-neutral-400 hover:text-white"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#7c3aed] py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(124,58,237,0.35)] transition hover:bg-[#6d28d9] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? (
              <>
                <Spinner />
                Signing in…
              </>
            ) : (
              'Log in'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Need an account?{' '}
          <Link
            to="/register"
            className="font-medium text-[#a78bfa] hover:text-[#c4b5fd]"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
