// src/config.js
import dotenv from 'dotenv';

dotenv.config();

export const {
    PORT,
    HOST_DB,
    USER_DB,
    PASSWORD_DB,
    PORT_DB,
    ENDPOINT,
    DATABASE_DB,
    USER_DB_SOCIO,
    PASSWORD_DB_SOCIO,
    DATABASE_DB_SOCIO,
    JWT_SECRET,
    NODE_ENV,
    INSTANCIA_FACTILIZA,
    API_FACTILIZA_WHATSAPP,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
} = process.env;