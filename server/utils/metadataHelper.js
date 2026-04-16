import axios from 'axios'
import { parseTitleAndArtist } from './youtubeHelper.js'

/**
 * Strip HTML tags (for Last.fm bio)
 */
const stripHtml = (str) => {
  if (!str) return ''
  return str.replace(/<[^>]*>?/gm, '')
}

/**
 * 1. Album Art (MusicBrainz + Cover Art Archive)
 */
export const getAlbumArt = async (artist, title) => {
  try {
    const mbRes = await axios.get('https://musicbrainz.org/ws/2/recording', {
      params: {
        query: `recording:${title} AND artist:${artist}`,
        limit: 5,
        fmt: 'json'
      },
      headers: {
        'User-Agent': 'Reverberate/1.0 (email@example.com)'
      }
    })

    const recording = mbRes.data.recordings?.[0]
    if (!recording) {
      return {
        albumArt: null,
        albumName: null,
        releaseDate: null,
        releaseGroupId: null
      }
    }

    const release = recording.releases?.[0]
    const releaseGroupId = release?.['release-group']?.id

    let albumArt = null

    if (releaseGroupId) {
      try {
        const caaRes = await axios.get(
          `https://coverartarchive.org/release-group/${releaseGroupId}`
        )

        albumArt =
          caaRes.data.images?.find((img) => img.front)?.image ||
          caaRes.data.images?.[0]?.image ||
          null
      } catch (err) {
        albumArt = null
      }
    }

    return {
      albumArt,
      albumName: release?.title || null,
      releaseDate: release?.date || null,
      releaseGroupId: releaseGroupId || null
    }
  } catch (err) {
    return {
      albumArt: null,
      albumName: null,
      releaseDate: null,
      releaseGroupId: null
    }
  }
}

/**
 * 2. Lyrics (lyrics.ovh)
 */
export const getLyrics = async (artist, title) => {
  try {
    const res = await axios.get(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
    )

    if (!res.data?.lyrics) {
      return { lyrics: null, hasLyrics: false }
    }

    const cleaned = res.data.lyrics
      .replace(/\n{3,}/g, '\n\n')
      .trim()

    return {
      lyrics: cleaned,
      hasLyrics: true
    }
  } catch (err) {
    return {
      lyrics: null,
      hasLyrics: false
    }
  }
}

/**
 * 3. Artist Info (Last.fm)
 */
export const getArtistInfo = async (artist) => {
  try {
    const res = await axios.get('http://ws.audioscrobbler.com/2.0/', {
      params: {
        method: 'artist.getinfo',
        artist,
        api_key: process.env.LASTFM_API_KEY,
        format: 'json'
      }
    })

    const data = res.data
    if (!data?.artist) return null

    return {
      bio: stripHtml(data.artist.bio?.summary),
      image:
        data.artist.image?.[data.artist.image.length - 1]?.['#text'] || null,
      listeners: data.artist.stats?.listeners || null,
      playcount: data.artist.stats?.playcount || null,
      tags: data.artist.tags?.tag?.map((t) => t.name) || [],
      similar:
        data.artist?.similar?.artist
          ?.slice(0, 6)
          ?.map((a) => ({
          name: a.name,
          image:
            a.image?.find((img) => img.size === 'medium')?.['#text'] || ''
        })) || []
    }
  } catch (err) {
    return null
  }
}

/**
 * 4. MASTER — Enrich Track
 */
export const enrichTrack = async (youtubeResult) => {
  const { artist, title } = parseTitleAndArtist(
    youtubeResult.rawTitle || youtubeResult.title,
    youtubeResult.channelTitle || youtubeResult.artist
  )

  const results = await Promise.allSettled([
    getAlbumArt(artist, title),
    getLyrics(artist, title),
    getArtistInfo(artist)
  ])

  const albumData =
    results[0].status === 'fulfilled' ? results[0].value : null

  const lyricsData =
    results[1].status === 'fulfilled' ? results[1].value : null

  const artistData =
    results[2].status === 'fulfilled' ? results[2].value : null

  return {
    youtubeId: youtubeResult.youtubeId,
    title,
    artist,
    rawTitle: youtubeResult.rawTitle || youtubeResult.title,
    thumbnail: youtubeResult.thumbnail,
    sourceType: 'youtube',

    albumArt: albumData?.albumArt || youtubeResult.thumbnail,
    albumName: albumData?.albumName || null,
    releaseDate: albumData?.releaseDate || null,

    lyrics: lyricsData?.lyrics || null,
    hasLyrics: lyricsData?.hasLyrics || false,

    artistBio: artistData?.bio || null,
    artistImage: artistData?.image || null,
    artistListeners: artistData?.listeners || null,
    artistTags: artistData?.tags || [],
    similarArtists: artistData?.similar || []
  }
}
