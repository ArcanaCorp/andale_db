import { Router } from "express";

import * as Places from "../controllers/places/places.controller.js";
import * as Images from '../controllers/places/places.images.controller.js'
import * as Analytics from '../controllers/places/places.analytics.controller.js'

const router = Router()

/* PLACES */
router.get('/', Places.getAllPlaces)
router.get("/categories", Places.getCategories);
router.get("/category/:category", Places.getByCategory);
router.get("/:slug", Places.getBySlug);
/* PLACES */

/* PLACES IMAGES */
router.get("/:slug/image/:image", Images.getImages);
/* PLACES IMAGES */

/* PLACES Analytics */
router.post("/:slug/like", Analytics.toggleLike);
router.post("/:slug/share", Analytics.toggleShare);
router.get("/:slug/recommendations", Analytics.getRecommendations);
router.get("/most/popular", Analytics.getMostPopular);
router.get("/most/nearby", Analytics.getNearbyPlaces);
router.get("/:slug/stats", Analytics.getPlaceStats);
/* PLACES Analytics */

/* PLACES EVENTS */
//router.get("/:slug/events", Events.getPlaceEvents);
/* PLACES EVENTS */

/* PLACES REVIEWS */
//router.get("/:slug/reviews", Reviews.getReviews);
//router.post("/:slug/reviews", Reviews.postReview);
//router.get("/favorites", Reviews.getFavoritePlaces);
/* PLACES REVIEWS */

export default router;