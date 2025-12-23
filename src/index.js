import express from 'express';
import http from 'http';
import cors from 'cors';
import { PORT } from './config.js';

// ========================================
// 🔧 Configuración base del servidor
// ========================================
const app = express();
const server = http.createServer(app);

// ========================================
// 🌐 Configuración de CORS
// ========================================
const allowedOrigins = [
    "http://localhost:3000",        // desarrollo
    "http://192.168.18.12:3000",    // desarrollo movil
    "http://localhost:5173",        // vite
    "https://andaleya.pe",          // prod
    "https://merchants.andaleya.pe",// prod
    "https://andale.ttutis.com",
    "https://www.andaleya.pe",
    "https://www.merchants.andaleya.pe"
];

app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200,
}));

app.options("*", cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ====== SOCKET.IO ======
import { setupSocket } from './helpers/socket.js';


// ========================================
// 🧩 Registro dinámico de rutas
// ========================================

import routes from './routes/index.routes.js'

app.use('/api/v1', routes);

// ========================================
// ⚠️ Manejo global de errores
// ========================================
app.use((err, req, res, next) => {
  console.error('❌ Error no controlado:', err);
  res.status(500).json({
    ok: false,
    message: 'Error interno del servidor',
    error: err.message
  });
});

// ========================================
// 🚀 Inicio del servidor
// ========================================
server.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en: http://localhost:${PORT}`);
});

// Exporta como ESM
const { io, connectedUsers } = setupSocket(server);
export { io, connectedUsers };
export default app;