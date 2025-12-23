import { Router } from 'express';
import { getHomeScreenData, searchController } from '../controllers/index.controller.js'

import notificationRoutes from './notifications.routes.js'

import placesRoutes from './places.routes.js';
import socioRoutes from './socio.routes.js';
import usersRoutes from './user.routes.js'

const router = Router();

router.get('/recommendations', getHomeScreenData);
router.get('/search', searchController)

router.use('/send', notificationRoutes)

router.use('/places', placesRoutes);
router.use('/socio', socioRoutes);
router.use('/user', usersRoutes)

export default router;