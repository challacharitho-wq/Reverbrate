import { Router } from 'express'
import * as artistController from '../controllers/artistController.js'

const router = Router()

router.get('/', artistController.listArtists)
router.get('/:id', artistController.getArtist)
router.post('/:id/follow', artistController.followArtist)
router.delete('/:id/follow', artistController.unfollowArtist)

export default router
