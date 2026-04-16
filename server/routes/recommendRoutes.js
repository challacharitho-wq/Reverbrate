import { Router } from 'express'
import * as recommendController from '../controllers/recommendController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/', authMiddleware, recommendController.getRecommendations)

export default router
