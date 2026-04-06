import { Router } from 'express'
import * as historyController from '../controllers/historyController.js'

const router = Router()

router.get('/', historyController.getHistory)
router.post('/', historyController.addHistory)
router.delete('/', historyController.clearHistory)

export default router
