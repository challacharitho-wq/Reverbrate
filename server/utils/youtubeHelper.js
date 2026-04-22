import axios from 'axios'

function normalizeText(str) {
  return String(str || '')
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/^(the|a|an)\s+/i, '')
    .replace(/\s+/g, ' ')
}

function cleanTitleText(raw) {
  let title = String(raw || '')
  const garbagePatterns = [
    /\((?:official video|official audio|official music video|lyric video|official lyric video|audio|hd|hq|4k)\)/gi,
    /\[(?:official video|official audio|official music video|lyric video|official lyric video|audio|hd|hq|4k)\]/gi,
    /\|\s*official/gi,
    /-\s*official/gi,
    /\s*\[(?:[^\]]*)\]$/,
    /\s*\((?:[^\)]*)\)$/,
  ]

  garbagePatterns.forEach((pattern) => {
    title = title.replace(pattern, '')
  })

  title = title.replace(/\s+ft\.?\s.*$/i, '')
  title = title.replace(/\s+feat\.?\s.*$/i, '')
  title = title.replace(/\s+/g, ' ')
  title = title.replace(/[\u2010-\u2015]/g, '-')
  title = title.replace(/^[\s\-]+|[\s\-]+$/g, '')
  return title.trim()
}

export function parseTitleAndArtist(youtubeTitle, channelTitle) {
  const cleanedTitle = cleanTitleText(youtubeTitle)
  const cleanedChannel = cleanTitleText(channelTitle)
  const dashParts = cleanedTitle.split(/\s*-\s*/).filter(Boolean)
  let artist = cleanedChannel || ''
  let title = cleanedTitle

  if (dashParts.length >= 2) {
    const first = dashParts[0]
    const second = dashParts.slice(1).join(' - ')

    const firstMatchesChannel = cleanedChannel
      ? normalizeText(first) === normalizeText(cleanedChannel)
      : false
    const secondMatchesChannel = cleanedChannel
      ? normalizeText(second) === normalizeText(cleanedChannel)
      : false

    if (firstMatchesChannel) {
      artist = first
      title = second
    } else if (secondMatchesChannel) {
      artist = second
      title = first
    } else {
      artist = first
      title = second
    }
  }

  artist = artist || cleanedChannel || ''
  title = title || cleanedTitle || ''
  artist = artist.replace(/^[\s\-]+|[\s\-]+$/g, '').trim()
  title = title.replace(/^[\s\-]+|[\s\-]+$/g, '').trim()

  return { artist, title }
}

function parseIsoDuration(isoDuration) {
  if (!isoDuration || typeof isoDuration !== 'string') {
    return 0
  }
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  const hours = Number(match[1] || 0)
  const minutes = Number(match[2] || 0)
  const seconds = Number(match[3] || 0)
  return hours * 3600 + minutes * 60 + seconds
}

function tokenizeText(str) {
  return normalizeText(str)
    .split(/\s+/)
    .filter(Boolean)
}

function scoreSearchResult(query, result) {
  const normalizedQuery = normalizeText(query)
  const queryTokens = tokenizeText(query)
  const titleText = normalizeText(`${result.rawTitle || ''} ${result.title || ''}`)
  const artistText = normalizeText(`${result.artist || ''} ${result.channelTitle || ''}`)
  const combinedText = `${titleText} ${artistText}`.trim()

  let score = 0

  if (!combinedText) return score

  if (titleText === normalizedQuery) score += 200
  if (combinedText.includes(normalizedQuery)) score += 90
  if (titleText.includes(normalizedQuery)) score += 80
  if (artistText.includes(normalizedQuery)) score += 40

  const matchedTokens = queryTokens.filter((token) => combinedText.includes(token))
  score += matchedTokens.length * 15

  const likelyMusicPatterns = [
    /\bofficial audio\b/i,
    /\bofficial video\b/i,
    /\blyrics?\b/i,
    /\baudio\b/i,
    /\btopic\b/i,
  ]
  if (likelyMusicPatterns.some((pattern) => pattern.test(result.rawTitle || '') || pattern.test(result.channelTitle || ''))) {
    score += 18
  }

  const likelyBadPatterns = [
    /\bshorts?\b/i,
    /\breaction\b/i,
    /\bslowed\b/i,
    /\breverb\b/i,
    /\bkaraoke\b/i,
    /\blive\b/i,
    /\bconcert\b/i,
    /\bcover\b/i,
  ]
  if (likelyBadPatterns.some((pattern) => pattern.test(result.rawTitle || ''))) {
    score -= 35
  }

  if (result.durationSeconds && result.durationSeconds >= 90 && result.durationSeconds <= 480) {
    score += 12
  }

  const views = Number(result.views || 0)
  if (Number.isFinite(views) && views > 0) {
    score += Math.min(20, Math.log10(views + 1) * 2.5)
  }

  return score
}

async function fetchSearchItems(searchUrl, apiKey, query, limit, videoCategoryId) {
  const params = {
    part: 'snippet',
    q: query,
    type: 'video',
    maxResults: limit,
    key: apiKey,
  }

  if (videoCategoryId) {
    params.videoCategoryId = videoCategoryId
  }

  const { data } = await axios.get(searchUrl, { params })
  return data?.items || []
}

function isInvalidFilterError(error) {
  const status = error?.response?.status
  const message = String(
    error?.response?.data?.error?.message ||
    error?.message ||
    '',
  ).toLowerCase()

  return status === 400 && message.includes('invalid filter parameter')
}

async function fetchSearchItemsSafely(searchUrl, apiKey, query, limit, videoCategoryId) {
  try {
    return await fetchSearchItems(searchUrl, apiKey, query, limit, videoCategoryId)
  } catch (error) {
    if (videoCategoryId && isInvalidFilterError(error)) {
      return fetchSearchItems(searchUrl, apiKey, query, limit, null)
    }

    throw error
  }
}

function dedupeSearchItems(items) {
  const seen = new Set()
  return items.filter((item) => {
    const videoId = item?.id?.videoId
    if (!videoId || seen.has(videoId)) {
      return false
    }
    seen.add(videoId)
    return true
  })
}

export async function searchVideos(query, limit = 12) {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    throw new Error('Missing YOUTUBE_API_KEY in environment')
  }

  const searchUrl = 'https://www.googleapis.com/youtube/v3/search'
  const candidateLimit = limit
 const queryVariants = [
  { text: query, category: '10' },
]

  const settled = await Promise.allSettled(
    queryVariants.map((variant) =>
      fetchSearchItemsSafely(
        searchUrl,
        apiKey,
        variant.text,
        candidateLimit,
        variant.category,
      ),
    ),
  )

  const fulfilled = settled
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value)
    .flat()

  if (fulfilled.length === 0) {
    const rejected = settled.find((r) => r.status === 'rejected')
    throw rejected?.reason || new Error('YouTube search failed')
  }

  const searchItems = dedupeSearchItems(fulfilled)

  const videoIds = searchItems
    .filter((item) => item.id?.videoId)
    .map((item) => item.id.videoId)
    .join(',')

  if (!videoIds) {
    return []
  }

  const detailsUrl = 'https://www.googleapis.com/youtube/v3/videos'
  const { data: detailsData } = await axios.get(detailsUrl, {
    params: {
      part: 'snippet,contentDetails,statistics',
      id: videoIds,
      key: apiKey,
    },
  })

  const detailsById = new Map(
    (detailsData?.items || []).map((item) => [item.id, item]),
  )

  return searchItems
    .filter((item) => item.id?.videoId)
    .map((item) => {
      const videoId = item.id.videoId
      const detail = detailsById.get(videoId)
      const rawTitle = item.snippet.title || ''
      const channelTitle = item.snippet.channelTitle || ''
      const { title, artist } = parseTitleAndArtist(rawTitle, channelTitle)
      const thumbnail =
        item.snippet.thumbnails?.high?.url ||
        item.snippet.thumbnails?.medium?.url ||
        item.snippet.thumbnails?.default?.url ||
        ''
      return {
        youtubeId: videoId,
        rawTitle,
        title,
        artist,
        channelTitle,
        thumbnail,
        duration: detail?.contentDetails?.duration || null,
        durationSeconds: detail ? parseIsoDuration(detail.contentDetails?.duration) : null,
        views: detail?.statistics?.viewCount || null,
        sourceType: 'youtube',
      }
    })
    .sort((a, b) => scoreSearchResult(query, b) - scoreSearchResult(query, a))
    .slice(0, limit)
}

export async function getVideoDetails(videoId) {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    throw new Error('Missing YOUTUBE_API_KEY in environment')
  }

  const url = 'https://www.googleapis.com/youtube/v3/videos'
  const { data } = await axios.get(url, {
    params: {
      part: 'snippet,contentDetails',
      id: videoId,
      key: apiKey,
    },
  })

  const item = data?.items?.[0]
  if (!item) {
    throw new Error('Video not found')
  }

  const rawTitle = item.snippet.title || ''
  const thumbnail =
    item.snippet.thumbnails?.high?.url ||
    item.snippet.thumbnails?.medium?.url ||
    item.snippet.thumbnails?.default?.url ||
    ''
  const { title, artist } = parseTitleAndArtist(rawTitle, item.snippet.channelTitle)

  return {
    youtubeId: videoId,
    rawTitle,
    title,
    artist,
    thumbnail,
    sourceType: 'youtube',
    durationSeconds: parseIsoDuration(item.contentDetails?.duration),
  }
}
export function parseISO8601Duration(duration) {
  if (!duration || typeof duration !== 'string') return '0:00'

  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return '0:00'

  const hours = Number(match[1] || 0)
  const minutes = Number(match[2] || 0)
  const seconds = Number(match[3] || 0)

  const paddedSeconds = String(seconds).padStart(2, '0')

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${paddedSeconds}`
  }

  return `${minutes}:${paddedSeconds}`
}
