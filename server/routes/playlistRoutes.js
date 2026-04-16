import { Router } from 'express'
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  deletePlaylist,
} from '../controllers/playlistController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = Router()

// All routes are protected
router.use(authMiddleware)

// Create playlist
router.post('/', createPlaylist)
router.post('/create', createPlaylist)

// Get all playlists
router.get('/', getUserPlaylists)

// Add song using MVP route
router.post('/add-song', (req, res, next) => {
  req.params.id = req.body?.playlistId
  next()
}, addTrackToPlaylist)

// Get single playlist
router.get('/:id', getPlaylist)

// Add track
router.post('/:id/tracks', addTrackToPlaylist)

// Remove track
router.delete('/:id/tracks', removeTrackFromPlaylist)

// Delete playlist
router.delete('/:id', deletePlaylist)

export default router
