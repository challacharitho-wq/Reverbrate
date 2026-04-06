import { Link } from 'react-router-dom'

const features = [
  {
    title: 'Stream Anything',
    body: 'YouTube catalog plus your own uploads in one place.',
    icon: '🎵',
  },
  {
    title: 'Smart Playlists',
    body: 'Build and refine lists that match your mood.',
    icon: '📋',
  },
  {
    title: 'Personalized Picks',
    body: 'Recommendations tuned to what you actually play.',
    icon: '🎯',
  },
]

export default function Landing() {
  return (
    <div
      className="min-h-screen overflow-x-hidden overflow-y-auto"
      style={{
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      <section className="relative mx-auto max-w-6xl px-6 pb-24 pt-16 animate-fade-in md:pb-32 md:pt-24">
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[min(100vw,720px)] -translate-x-1/2 rounded-full blur-2xl"
          style={{
            background:
              'radial-gradient(ellipse at center, var(--accent-glow) 0%, transparent 65%)',
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <p
            className="font-heading mb-4 text-sm uppercase tracking-[0.2em]"
            style={{ color: 'var(--accent-light)' }}
          >
            Reverberate
          </p>
          <h1
            className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl"
            style={{
              color: 'var(--text-primary)',
              textShadow: '0 0 40px var(--accent-glow)',
            }}
          >
            Feel Every Beat
          </h1>
          <p
            className="mx-auto mt-6 max-w-xl text-lg leading-relaxed sm:text-xl animate-fade-in-delay"
            style={{ color: 'var(--text-secondary)' }}
          >
            Stream millions of songs. Your music, your way.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-fade-in-delay-2">
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                background: 'var(--accent)',
                color: 'var(--text-primary)',
                boxShadow: '0 0 24px var(--accent-glow)',
                transitionDuration: '150ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--accent-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--accent)'
              }}
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-full border px-8 py-3 text-sm font-semibold backdrop-blur transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                borderColor: 'color-mix(in srgb, var(--text-primary) 15%, transparent)',
                background: 'color-mix(in srgb, var(--text-primary) 5%, transparent)',
                color: 'var(--text-primary)',
                transitionDuration: '150ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  'color-mix(in srgb, var(--text-primary) 10%, transparent)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  'color-mix(in srgb, var(--text-primary) 5%, transparent)'
              }}
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <article
              key={f.title}
              className="rounded-2xl border p-6 backdrop-blur-sm transition"
              style={{
                borderColor: 'color-mix(in srgb, var(--text-primary) 10%, transparent)',
                background: 'color-mix(in srgb, var(--text-primary) 3%, transparent)',
                boxShadow: '0 0 0 1px color-mix(in srgb, var(--text-primary) 4%, transparent)',
                transitionDuration: '150ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor =
                  'color-mix(in srgb, var(--accent) 40%, transparent)'
                e.currentTarget.style.background =
                  'color-mix(in srgb, var(--text-primary) 5%, transparent)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor =
                  'color-mix(in srgb, var(--text-primary) 10%, transparent)'
                e.currentTarget.style.background =
                  'color-mix(in srgb, var(--text-primary) 3%, transparent)'
              }}
            >
              <div className="text-2xl" aria-hidden>
                {f.icon}
              </div>
              <h2
                className="mt-4 font-heading text-lg font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {f.title}
              </h2>
              <p
                className="mt-2 text-sm leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                {f.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <footer
        className="border-t py-10 text-center text-sm"
        style={{
          borderColor: 'color-mix(in srgb, var(--text-primary) 10%, transparent)',
          color: 'var(--text-muted)',
        }}
      >
        Reverberate © 2025
      </footer>
    </div>
  )
}
