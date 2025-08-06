import { Router } from "express";
import { controllerSearch } from "../controllers/search.controller.js";

const router = Router();

router.get('/', controllerSearch)

export default router;