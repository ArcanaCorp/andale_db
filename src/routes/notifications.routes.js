import { Router } from "express";
import { sendPushNotification, subscribeNotifications } from "#src/controllers/send/notifications.controller.js";
import { userMiddleware } from "#src/middlewares/user.middleware.js";

const router = Router();

router.post('/subscribe', userMiddleware, subscribeNotifications)
router.post('/push', sendPushNotification)

export default router;