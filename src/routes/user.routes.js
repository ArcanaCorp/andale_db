import { Router } from "express";
import * as UserController from "../controllers/user/user.controller.js";
import * as OrderController from "../controllers/user/user.order.controller.js";
import * as AnalyticsController from "../controllers/user/user.analytics.controller.js";

const router = Router();

/* ==================== AUTH ==================== */
// Login
router.post("/login", UserController.login);

// Verificar OTP
router.post("/verify-otp", UserController.verifyOTP);

/* ==================== PROFILE ==================== */
// Obtener datos del usuario
router.get("/:sub/profile", UserController.getProfile);

// Actualizar datos del usuario
router.put("/:sub/profile", UserController.updateProfile);

/* ==================== ORDERS ==================== */
// Hacer pedido
router.post("/:sub/orders", OrderController.createOrder);

// Listar pedidos del usuario
router.get("/:sub/orders", OrderController.getUserOrders);

// Obtener detalle de un pedido
router.get("/:sub/orders/:orderId", OrderController.getOrderById);

/* ==================== ANALYTICS ==================== */
// Ver interacciones del usuario (likes, visitas, compartidos)
router.get("/:sub/analytics", AnalyticsController.getUserAnalytics);

// Registrar interacción (like, share, visit)
router.post("/:sub/analytics/:action", AnalyticsController.trackAction);

export default router;