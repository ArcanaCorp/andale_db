import { Router } from "express";
import { controllerRecommendation } from "../controllers/recommendations.controller.js";

const router = Router();

router.get('/', controllerRecommendation)

export default router;