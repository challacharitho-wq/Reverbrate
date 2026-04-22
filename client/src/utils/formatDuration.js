export function parseDurationToSeconds(value) {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return value
  }

  if (typeof value !== 'string') {
    return 0
  }

  const trimmed = value.trim()
  if (!trimmed) return 0

  const isoMatch = trimmed.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (isoMatch) {
    const hours = Number(isoMatch[1] || 0)
    const minutes = Number(isoMatch[2] || 0)
    const seconds = Number(isoMatch[3] || 0)
    return hours * 3600 + minutes * 60 + seconds
  }

  const parts = trimmed.split(':').map((part) => Number.parseInt(part, 10))
  if (parts.length > 0 && parts.every(Number.isFinite)) {
    if (parts.length === 1) return parts[0]
    if (parts.length === 2) return parts[0] * 60 + parts[1]
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }

  return 0
}

export function formatTime(seconds, fallback = '0:00') {
  if (!Number.isFinite(seconds) || seconds < 0) return fallback

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const wholeSeconds = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(wholeSeconds).padStart(2, '0')}`
  }

  return `${minutes}:${String(wholeSeconds).padStart(2, '0')}`
}

export function formatYouTubeDuration(value, fallback = '--:--') {
  const seconds = parseDurationToSeconds(value)
  return seconds > 0 ? formatTime(seconds, fallback) : fallback
}

export function formatListeners(count) {
  if (!count) return ''
  const n = Number.parseInt(count, 10)
  if (Number.isNaN(n)) return count
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

export function stripHtml(str) {
  if (!str) return ''
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}

export function truncateText(str, max) {
  if (!str) return ''
  return str.length <= max ? str : `${str.slice(0, max)}...`
}
