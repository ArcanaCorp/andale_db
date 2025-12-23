import { Router } from "express";
import { sendGlobalNotification } from "../controllers/send/notifications.controller.js";

const router = Router();

router.post("/notification", sendGlobalNotification);

export default router;