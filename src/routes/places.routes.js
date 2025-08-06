import { Router } from "express";
import { getImagePlaces } from "../controllers/places.controller.js";

const router = Router();

router.get(`/:slug/image/:image`, getImagePlaces)

export default router;