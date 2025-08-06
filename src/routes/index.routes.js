import { Router } from 'express'
import { controllerIndex } from '../controllers/index.controller.js';

const router = Router();

router.get('/', controllerIndex)

export default router;