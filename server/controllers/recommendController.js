import History from '../models/History.js'
import User from '../models/User.js'
import YouTubeTrack from '../models/YouTubeTrack.js'
import * as youtubeHelper from '../utils/youtubeHelper.js'

function getTopCounts(values, limit) {
  const counts = new Map()

  values
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .forEach((value) => {
      counts.set(value, (counts.get(value) || 0) + 1)
    })

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([value]) => value)
}

function uniqueTracks(tracks) {
  const seen = new Set()

  return tracks.filter((track) => {
    const id = track.youtubeId || track.id
    if (!id || seen.has(id)) {
      return false
    }
    seen.add(id)
    return true
  })
}

export async function getRecommendations(req, res) {
  try {
    const [history, user] = await Promise.all([
      History.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(40),
      User.findById(req.user.id).select('preferredArtists'),
    ])

    const topArtists = getTopCounts(
      history.map((entry) => entry.artist),
      5,
    )

    const recentTrackArtists = [...new Set(topArtists)].filter(Boolean)

    const relatedTracks = recentTrackArtists.length
      ? await YouTubeTrack.find({
          artist: { $in: recentTrackArtists },
        }).select('artistTags similarArtists')
      : []

    const topTags = getTopCounts(
      relatedTracks.flatMap((track) => track.artistTags || []),
      4,
    )

    const similarArtists = getTopCounts(
      relatedTracks.flatMap((track) =>
        (track.similarArtists || []).map((artist) => artist?.name),
      ),
      6,
    )

    const preferredArtists = Array.isArray(user?.preferredArtists)
      ? user.preferredArtists.filter(Boolean)
      : []

    const searchQueries = [
      ...topArtists,
      ...similarArtists,
      ...topTags.map((tag) => `${tag} music`),
      ...preferredArtists,
    ]
      .map((query) => String(query || '').trim())
      .filter(Boolean)

    const uniqueQueries = [...new Set(searchQueries)].slice(0, 12)

    if (uniqueQueries.length === 0) {
      return res.status(200).json({
        tracks: [],
        meta: {
          topArtists,
          similarArtists,
          topTags,
          preferredArtists,
        },
      })
    }

    const settled = await Promise.allSettled(
      uniqueQueries.map((query) => youtubeHelper.searchVideos(query, 6)),
    )

    const tracks = uniqueTracks(
      settled.flatMap((result) =>
        result.status === 'fulfilled' ? result.value : [],
      ),
    ).slice(0, 30)

    return res.status(200).json({
      tracks,
      meta: {
        topArtists,
        similarArtists,
        topTags,
        preferredArtists,
      },
    })
  } catch (err) {
    console.error('[recommend] getRecommendations failed', err)
    return res.status(500).json({ message: 'Failed to load recommendations' })
  }
}
