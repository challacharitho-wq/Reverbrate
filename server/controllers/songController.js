import * as youtubeHelper from '../utils/youtubeHelper.js'
import { enrichTrack }    from '../utils/metadataHelper.js'
import YouTubeTrack       from '../models/YouTubeTrack.js'
import Song               from '../models/Song.js'
import cloudinary         from '../config/cloudinary.js'

// ─── Helpers ─────────────────────────────────────────
const notImplemented = (_req, res) =>
  res.status(501).json({ message: 'Not implemented' })

// ─── YouTube Search ───────────────────────────────────
export async function searchSongs(req, res) {
  const query = String(req.query.q || req.query.query || '').trim()
  if (!query) {
    return res.status(400).json({ message: 'Missing search query' })
  }
  try {
    const results = await youtubeHelper.searchVideos(query, 20)
    res.status(200).json({ results })
  } catch (err) {
    console.error('[songController] searchSongs failed', err)
    res.status(500).json({ message: 'Search failed' })
  }
}

// ─── Track Details + Enrichment ──────────────────────
export async function getTrackDetails(req, res) {
  const youtubeId = String(req.query.youtubeId || '').trim()
  const title     = String(req.query.title     || '').trim()
  const artist    = String(req.query.artist    || '').trim()
  const thumbnail = String(req.query.thumbnail || '').trim()

  if (!youtubeId) {
    return res.status(400).json({ message: 'Missing youtubeId' })
  }

  try {
    // Check cache first
    const cache = await YouTubeTrack.findOne({ youtubeId })
    const now   = new Date()
    const isFresh =
      cache &&
      now - cache.cachedAt < 7 * 24 * 60 * 60 * 1000 // 7 days

    if (isFresh) {
      return res.status(200).json({ track: cache })
    }

    // Enrich fresh
    const enriched = await enrichTrack({
      youtubeId,
      rawTitle    : title,
      title,
      artist,
      thumbnail,
      channelTitle: artist,
    })

    const updated = await YouTubeTrack.findOneAndUpdate(
      { youtubeId },
      { ...enriched, cachedAt: new Date() },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )

    res.status(200).json({ track: updated })
  } catch (err) {
    console.error('[songController] getTrackDetails failed', err)
    res.status(500).json({ message: 'Failed to load track details' })
  }
}

// ─── Single YouTube Video Details ─────────────────────
export async function getYouTubeDetails(req, res) {
  const videoId = String(req.params.videoId || '').trim()
  if (!videoId) {
    return res.status(400).json({ message: 'Missing videoId' })
  }
  try {
    const track = await youtubeHelper.getVideoDetails(videoId)
    res.status(200).json({ track })
  } catch (err) {
    console.error('[songController] getYouTubeDetails failed', err)
    res.status(500).json({ message: 'Failed to load video details' })
  }
}

// ─── Upload MP3 to Cloudinary ─────────────────────────
export async function uploadTrack(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No audio file provided' })
    }

    const { title, artist, album, genre, duration } = req.body

    if (!title || !artist) {
      return res
        .status(400)
        .json({ message: 'Title and artist are required' })
    }

    const newSong = await Song.create({
      title,
      artist,
      album      : album  || '',
      genre      : genre  || 'Other',
      fileUrl    : req.file.path,   // Cloudinary secure_url
      uploadedBy : req.user.id,
      duration   : Number(duration) || 0,
      sourceType : 'upload',
    })

    res.status(201).json({ song: newSong })
  } catch (err) {
    console.error('[songController] uploadTrack failed', err)
    res.status(500).json({ message: err.message })
  }
}

// ─── Get User's Uploads ───────────────────────────────
export async function getUserUploads(req, res) {
  try {
    const songs = await Song
      .find({ uploadedBy: req.user.id })
      .sort({ createdAt: -1 })
    res.status(200).json({ songs })
  } catch (err) {
    console.error('[songController] getUserUploads failed', err)
    res.status(500).json({ message: err.message })
  }
}

// ─── Delete Upload ────────────────────────────────────
export async function deleteUpload(req, res) {
  try {
    const song = await Song.findById(req.params.id)

    if (!song) {
      return res.status(404).json({ message: 'Song not found' })
    }
    if (song.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    // Extract Cloudinary public_id from URL
    // URL pattern: .../reverberate/tracks/FILENAME.ext
    const urlParts = song.fileUrl.split('/')
    const fileName = urlParts[urlParts.length - 1].split('.')[0]
    const publicId = `reverberate/tracks/${fileName}`

    await cloudinary.uploader
      .destroy(publicId, { resource_type: 'video' })
      .catch((e) =>
        console.warn('[songController] Cloudinary delete warning:', e)
      )

    await Song.findByIdAndDelete(req.params.id)

    res.status(200).json({ message: 'Track deleted successfully' })
  } catch (err) {
    console.error('[songController] deleteUpload failed', err)
    res.status(500).json({ message: err.message })
  }
}

// ─── Stubs (future features) ──────────────────────────
export const listSongs = notImplemented
export const getSong   = notImplemented
