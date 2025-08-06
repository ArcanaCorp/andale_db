import { Router } from "express";
import { controllerDetailSlug } from "../controllers/details.controller.js";

const router = Router()

router.get('/:slug', controllerDetailSlug)

export default router;