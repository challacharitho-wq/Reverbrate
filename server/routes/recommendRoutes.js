import { Router } from 'express'
import * as recommendController from '../controllers/recommendController.js'

const router = Router()

router.get('/', recommendController.getRecommendations)

export default router
