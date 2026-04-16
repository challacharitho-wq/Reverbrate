import Playlist from '../models/Playlist.js'
import mongoose from 'mongoose'

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value)
}

function normalizePlaylist(playlist) {
  if (!playlist) return null
  const doc = playlist.toJSON ? playlist.toJSON() : playlist

  return {
    ...doc,
    tracks: Array.isArray(doc.tracks) ? doc.tracks : [],
    songs: Array.isArray(doc.songs)
      ? doc.songs
      : Array.isArray(doc.tracks)
        ? doc.tracks
        : [],
  }
}

function normalizeTrackPayload(payload = {}) {
  const youtubeId = String(payload.youtubeId || payload.trackId || '').trim()
  const title = String(payload.title || '').trim()
  const artist = String(payload.artist || payload.artistName || 'Unknown artist').trim()
  const thumbnail = String(payload.thumbnail || payload.image || '').trim()
  const duration = String(payload.duration || '').trim()
  const sourceType = String(payload.sourceType || 'youtube').trim()

  if (!youtubeId || !title) {
    return null
  }

  return {
    youtubeId,
    title,
    artist: artist || 'Unknown artist',
    thumbnail,
    duration,
    sourceType,
  }
}

/**
 * Create Playlist
 */
export const createPlaylist = async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim()

    if (!name) {
      return res.status(400).json({ message: 'Playlist name required' })
    }

    const existing = await Playlist.findOne({
      user: req.user.id,
      name,
    })

    if (existing) {
      return res.status(400).json({ message: 'Playlist already exists' })
    }

    const playlist = await Playlist.create({
      name,
      user: req.user.id,
      tracks: [],
    })

    res.status(201).json({ playlist: normalizePlaylist(playlist) })
  } catch (error) {
    console.error('[playlistController] createPlaylist', error)
    res.status(500).json({ message: error.message || 'Failed to create playlist' })
  }
}

/**
 * Get all user playlists
 */
export const getUserPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.user.id }).sort({
      createdAt: -1,
    })

    res.status(200).json({
      playlists: playlists.map(normalizePlaylist),
    })
  } catch (error) {
    console.error('[playlistController] getUserPlaylists', error)
    res.status(500).json({ message: 'Failed to fetch playlists' })
  }
}

/**
 * Get single playlist
 */
export const getPlaylist = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid playlist id' })
    }

    const playlist = await Playlist.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' })
    }

    res.status(200).json({ playlist: normalizePlaylist(playlist) })
  } catch (error) {
    console.error('[playlistController] getPlaylist', error)
    res.status(500).json({ message: 'Failed to fetch playlist' })
  }
}

/**
 * Add track to playlist
 */
export const addTrackToPlaylist = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid playlist id' })
    }

    const track = normalizeTrackPayload(req.body)
    if (!track) {
      return res.status(400).json({
        message: 'youtubeId and title are required',
      })
    }

    const playlist = await Playlist.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' })
    }

    const alreadyExists = playlist.tracks.some(
      (item) => item.youtubeId === track.youtubeId,
    )

    if (alreadyExists) {
      return res.status(400).json({ message: 'Track already exists in playlist' })
    }

    playlist.tracks.push(track)

    await playlist.save()

    res.status(200).json({ playlist: normalizePlaylist(playlist) })
  } catch (error) {
    console.error('[playlistController] addTrack', error)
    res.status(500).json({ message: error.message || 'Failed to add track' })
  }
}

/**
 * Remove track
 */
export const removeTrackFromPlaylist = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid playlist id' })
    }

    const youtubeId = String(
      req.body?.youtubeId || req.query?.youtubeId || '',
    ).trim()

    if (!youtubeId) {
      return res.status(400).json({ message: 'youtubeId is required' })
    }

    const playlist = await Playlist.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' })
    }

    const nextTracks = playlist.tracks.filter((t) => t.youtubeId !== youtubeId)
    if (nextTracks.length === playlist.tracks.length) {
      return res.status(404).json({ message: 'Track not found in playlist' })
    }

    playlist.tracks = nextTracks

    await playlist.save()

    res.status(200).json({ playlist: normalizePlaylist(playlist) })
  } catch (error) {
    console.error('[playlistController] removeTrack', error)
    res.status(500).json({ message: 'Failed to remove track' })
  }
}

/**
 * Delete playlist
 */
export const deletePlaylist = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid playlist id' })
    }

    const playlist = await Playlist.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' })
    }

    res.status(200).json({
      message: 'Playlist deleted',
      playlist: normalizePlaylist(playlist),
    })
  } catch (error) {
    console.error('[playlistController] deletePlaylist', error)
    res.status(500).json({ message: 'Failed to delete playlist' })
  }
}
