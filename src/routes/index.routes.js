import { Router } from 'express';
import { getHomeScreenData, searchController } from '../controllers/index.controller.js'

import notificationRoutes from './notifications.routes.js'

import placesRoutes from './places.routes.js';
import socioRoutes from './socio.routes.js';
import usersRoutes from './user.routes.js'
import { ERROR_CODES } from '#src/helpers/errores.js';

const router = Router();

router.get('/', (req, res) => {
    return res.status(200).json({ok: true, message: 'Servidor disponible', error: '', status: ERROR_CODES.SERVER_AVAILABLE, code: 200})
})

router.get('/recommendations', getHomeScreenData);
router.get('/search', searchController)

router.use('/notifications', notificationRoutes)

router.use('/places', placesRoutes);
router.use('/socio', socioRoutes);
router.use('/user', usersRoutes)

export default router;