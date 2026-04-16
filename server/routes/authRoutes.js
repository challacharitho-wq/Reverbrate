import { Router } from 'express'
import * as authController from '../controllers/authController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = Router()

router.post('/register', authController.register)
router.post('/login', authController.login)
router.get('/me', authMiddleware, authController.getMe)
router.post('/like', authMiddleware, authController.toggleLike)
router.get('/likes', authMiddleware, authController.getLikedSongs)
router.post('/preferences', authMiddleware, authController.savePreferences)

export default router
