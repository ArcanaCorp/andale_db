import { Router } from "express";
import * as SocioController from "../controllers/socio/socio.controller.js";
import * as BussinesController from "../controllers/socio/socio.bussines.controller.js";
import * as ProductController from "../controllers/socio/socio.product.controller.js";
import * as ImageController from "../controllers/socio/socio.image.controller.js";
//import * as AnalyticsController from "../controllers/socio/socio.analytics.controller.js";
//import * as ReviewController from "../controllers/socio/socio.review.controller.js";

const router = Router();

/* ==================== LOGIN ==================== */
router.post("/login", SocioController.login);
router.post("/logout", SocioController.logout);
/* ==================== LOGIN ==================== */

/* ==================== BUSSINES ==================== */
// Obtener negocio del socio (datos + photo)
router.get("/:sub/bussines", BussinesController.getBussinesBySub);
router.get("/bussines/:category", BussinesController.getBussinesByCategory)
router.put("/:sub/bussines", BussinesController.updateBussines);
router.delete("/:sub/bussines", BussinesController.deleteBussines);

// Subir foto del negocio
router.post("/:sub/bussines/photo", ImageController.uploadBussinesImage);

// Obtener foto del negocio
router.get("/:sub/bussines/photo/:imageName", ImageController.getBussinesImage);
/* ==================== BUSSINES ==================== */

/* ==================== PRODUCTS ==================== */
// Listar productos del negocio
router.get("/:sub/bussines/products", ProductController.getProducts);

// Crear producto
router.post("/:sub/bussines/products", ProductController.createProduct);

// Obtener producto
router.get("/:sub/bussines/products/:id", ProductController.getProductById);

// Actualizar producto
router.put("/:sub/bussines/products/:id", ProductController.updateProduct);

// Eliminar producto
router.delete("/:sub/bussines/products/:id", ProductController.deleteProduct);

// Subir imágenes del producto
router.post("/:sub/bussines/products/:id/images", ImageController.uploadProductImage);

// Obtener imagen de producto
router.get("/:sub/bussines/products/:id/images/:imageName", ImageController.getProductImage);
/* ==================== PRODUCTS ==================== */

/* ==================== ANALYTICS ==================== */
// Añadir o quitar like
//router.post("/:sub/bussines/like", AnalyticsController.toogleLike);

// Añadir share
//router.post("/:sub/bussines/share", AnalyticsController.addShare);
/* ==================== ANALYTICS ==================== */

/* ==================== REVIEWS ==================== */
// Añadir review
//router.post("/:sub/bussines/review", ReviewController.addReview);

// Obtener reviews
//router.get("/:sub/bussines/review", ReviewController.getReviews);
/* ==================== REVIEWS ==================== */

export default router;