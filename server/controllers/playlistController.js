import Playlist from '../models/Playlist.js'

/**
 * Create Playlist
 */
export const createPlaylist = async (req, res) => {
  try {
    const { name } = req.body

    if (!name) {
      return res.status(400).json({ message: 'Playlist name required' })
    }

    const playlist = await Playlist.create({
      name,
      user: req.user.id,
      tracks: [],
    })

    res.status(201).json({ playlist })
  } catch (error) {
    console.error('[playlistController] createPlaylist', error)
    res.status(500).json({ message: 'Failed to create playlist' })
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

    res.status(200).json({ playlists })
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
    const playlist = await Playlist.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' })
    }

    res.status(200).json({ playlist })
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
    const { youtubeId, title, artist, thumbnail } = req.body

    const playlist = await Playlist.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' })
    }

    playlist.tracks.push({
      youtubeId,
      title,
      artist,
      thumbnail,
    })

    await playlist.save()

    res.status(200).json({ playlist })
  } catch (error) {
    console.error('[playlistController] addTrack', error)
    res.status(500).json({ message: 'Failed to add track' })
  }
}

/**
 * Remove track
 */
export const removeTrackFromPlaylist = async (req, res) => {
  try {
    const { youtubeId } = req.body

    const playlist = await Playlist.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' })
    }

    playlist.tracks = playlist.tracks.filter(
      (t) => t.youtubeId !== youtubeId
    )

    await playlist.save()

    res.status(200).json({ playlist })
  } catch (error) {
    console.error('[playlistController] removeTrack', error)
    res.status(500).json({ message: 'Failed to remove track' })
  }
}