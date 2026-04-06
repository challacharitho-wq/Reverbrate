import { Router } from 'express'
import * as songController from '../controllers/songController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/search', authMiddleware, songController.searchSongs)
router.get('/track/details', authMiddleware, songController.getTrackDetails)
router.get('/youtube/:videoId', authMiddleware, songController.getYouTubeDetails)

router.get('/my-uploads', authMiddleware, songController.getUserUploads)
router.post('/upload', authMiddleware, songController.uploadTrack)
router.delete('/:id', authMiddleware, songController.deleteUpload)

router.get('/', songController.listSongs)
router.get('/:id', songController.getSong)

export default router
