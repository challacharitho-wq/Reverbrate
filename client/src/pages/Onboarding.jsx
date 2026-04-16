import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Plus, ArrowRight, Music } from 'lucide-react'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const DEFAULT_ARTISTS = [
  'The Weeknd', 'Drake', 'Taylor Swift', 'Ed Sheeran',
  'Ariana Grande', 'Post Malone', 'Billie Eilish',
  'Justin Bieber', 'Dua Lipa', 'Kendrick Lamar',
  'Bad Bunny', 'Harry Styles', 'Olivia Rodrigo',
  'Travis Scott', 'SZA', 'J. Cole', 'Doja Cat',
  'The Kid LAROI', 'Juice WRLD', 'Morgan Wallen',
]

const GRADIENT_PAIRS = [
  ['#7c3aed', '#2563eb'], ['#f59e0b', '#ef4444'],
  ['#10b981', '#3b82f6'], ['#ec4899', '#8b5cf6'],
  ['#f97316', '#eab308'], ['#06b6d4', '#6366f1'],
  ['#84cc16', '#14b8a6'], ['#f43f5e', '#a855f7'],
  ['#0ea5e9', '#22d3ee'], ['#a3e635', '#4ade80'],
  ['#fb923c', '#f472b6'], ['#818cf8', '#38bdf8'],
  ['#34d399', '#a78bfa'], ['#fbbf24', '#f87171'],
  ['#c084fc', '#67e8f9'], ['#4ade80', '#60a5fa'],
  ['#f9a8d4', '#fde68a'], ['#7dd3fc', '#6ee7b7'],
  ['#d946ef', '#f59e0b'], ['#2dd4bf', '#818cf8'],
]

export default function Onboarding() {
  const navigate = useNavigate()

  const [artists, setArtists]         = useState(DEFAULT_ARTISTS)
  const [selected, setSelected]       = useState(new Set())
  const [customInput, setCustomInput] = useState('')
  const [saving, setSaving]           = useState(false)

  const toggleArtist = (name) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const handleAdd = () => {
    const name = customInput.trim()
    if (!name) return
    if (artists.map(a => a.toLowerCase())
               .includes(name.toLowerCase())) {
      toast('Artist already in the list')
      setCustomInput('')
      return
    }
    setArtists((prev) => [name, ...prev])
    setSelected((prev) => new Set([...prev, name]))
    setCustomInput('')
    toast.success(`Added "${name}"!`)
  }

  const handleContinue = async () => {
    if (selected.size < 3) {
      toast.error('Pick at least 3 artists to continue')
      return
    }
    setSaving(true)
    try {
      // ✅ Pass object with artists array directly
      await authAPI.savePreferences({
        artists: [...selected]
      })
      localStorage.setItem(
        'reverberate_artists',
        JSON.stringify([...selected])
      )
      toast.success('Your taste is saved!')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      console.error('[onboarding] save failed:', err)
      toast.error('Could not save preferences. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}
    >
      <div className="mx-auto max-w-5xl px-6 py-12">

        {/* ── Header ───────────────────────────────── */}
        <div className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center
                         justify-center rounded-xl"
              style={{ background: 'var(--accent)' }}
            >
              <Music className="h-5 w-5 text-white" />
            </div>
            <span
              className="text-xs font-bold uppercase
                         tracking-[0.3em]"
              style={{ color: 'var(--accent-light)' }}
            >
              Personalize Reverberate
            </span>
          </div>

          <h1
            className="text-4xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            What's your taste in music?
          </h1>
          <p
            className="mt-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            Pick at least 3 artists you love and
            we'll personalize your feed.
          </p>

          {/* Counter badge */}
          <div
            className="mt-3 inline-flex items-center gap-2
                       rounded-full px-4 py-1.5 text-sm
                       font-medium transition-all"
            style={{
              background: selected.size >= 3
                ? 'rgba(124,58,237,0.2)'
                : 'var(--bg-card)',
              color: selected.size >= 3
                ? 'var(--accent-light)'
                : 'var(--text-muted)',
              border: '1px solid',
              borderColor: selected.size >= 3
                ? 'var(--accent)'
                : 'var(--border)',
            }}
          >
            {selected.size} selected
            {selected.size >= 3 && ' ✓'}
          </div>
        </div>

        {/* ── Custom artist input ───────────────────── */}
        <div className="mb-8 flex gap-3">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd()
            }}
            placeholder="Type any artist name and press Add..."
            className="flex-1 rounded-2xl px-5 py-3.5
                       text-sm outline-none transition"
            style={{
              background: 'var(--bg-card)',
              border    : '1px solid var(--border)',
              color     : 'var(--text-primary)',
            }}
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!customInput.trim()}
            className="flex items-center gap-2 rounded-2xl
                       px-6 py-3.5 text-sm font-semibold
                       text-white transition-all
                       hover:opacity-90 active:scale-95
                       disabled:opacity-40
                       disabled:cursor-not-allowed"
            style={{ background: 'var(--accent)' }}
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>

        {/* ── Artist grid ──────────────────────────── */}
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns:
              'repeat(auto-fill, minmax(155px, 1fr))',
          }}
        >
          {artists.map((name, i) => {
            const isSelected = selected.has(name)
            const [c1, c2] =
              GRADIENT_PAIRS[i % GRADIENT_PAIRS.length]

            return (
              <button
                key={name}
                type="button"
                onClick={() => toggleArtist(name)}
                className="group relative overflow-hidden
                           rounded-2xl text-left
                           transition-all duration-200
                           hover:scale-[1.03]
                           active:scale-[0.97]"
                style={{
                  border     : '2px solid',
                  borderColor: isSelected
                    ? 'var(--accent)'
                    : 'var(--border)',
                  background : 'var(--bg-card)',
                  boxShadow  : isSelected
                    ? '0 0 20px rgba(124,58,237,0.3)'
                    : 'none',
                }}
              >
                {/* Gradient square */}
                <div
                  className="aspect-square w-full"
                  style={{
                    background:
                      `linear-gradient(135deg, ${c1}, ${c2})`,
                  }}
                />

                {/* Name */}
                <div className="p-3">
                  <p
                    className="text-sm font-semibold
                               leading-tight"
                    style={{
                      color: isSelected
                        ? 'var(--accent-light)'
                        : 'var(--text-primary)',
                    }}
                  >
                    {name}
                  </p>
                </div>

                {/* Selected checkmark */}
                {isSelected && (
                  <div
                    className="absolute right-2 top-2
                               flex h-7 w-7 items-center
                               justify-center rounded-full"
                    style={{ background: 'var(--accent)' }}
                  >
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* ── Sticky bottom bar ─────────────────────── */}
        <div
          className="sticky bottom-0 z-10 mt-10 flex
                     items-center justify-between gap-4
                     rounded-2xl p-4"
          style={{
            background: 'var(--bg-secondary)',
            border    : '1px solid var(--border)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <button
            type="button"
            onClick={() =>
              navigate('/dashboard', { replace: true })}
            className="text-sm transition hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
          >
            Skip for now
          </button>

          <div className="flex items-center gap-3">
            {selected.size > 0 && selected.size < 3 && (
              <p
                className="text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                {3 - selected.size} more to go
              </p>
            )}
            <button
              type="button"
              onClick={handleContinue}
              disabled={selected.size < 3 || saving}
              className="flex items-center gap-2 rounded-xl
                         px-8 py-3 text-sm font-bold
                         text-white transition-all
                         hover:scale-105 active:scale-95
                         disabled:cursor-not-allowed
                         disabled:opacity-40"
              style={{ background: 'var(--accent)' }}
            >
              {saving ? 'Saving...' : 'Continue'}
              {!saving && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}