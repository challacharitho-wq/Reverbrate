import { Router } from 'express'
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
} from '../controllers/playlistController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = Router()

// All routes are protected
router.use(authMiddleware)

// Create playlist
router.post('/', createPlaylist)

// Get all playlists
router.get('/', getUserPlaylists)

// Get single playlist
router.get('/:id', getPlaylist)

// Add track
router.post('/:id/tracks', addTrackToPlaylist)

// Remove track
router.delete('/:id/tracks', removeTrackFromPlaylist)

export default router