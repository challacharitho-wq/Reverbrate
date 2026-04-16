import { Router } from 'express'
import * as historyController from '../controllers/historyController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/', authMiddleware, historyController.getHistory)
router.post('/', authMiddleware, historyController.addHistory)
router.delete('/', authMiddleware, historyController.clearHistory)

export default router
