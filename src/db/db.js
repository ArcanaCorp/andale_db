import mysql from 'mysql2/promise';
import { HOST_DB, USER_DB, PASSWORD_DB, DATABASE_DB, USER_DB_SOCIO, PASSWORD_DB_SOCIO, DATABASE_DB_SOCIO } from "../config.js";

export const poolPlaces = mysql.createPool({
    host: HOST_DB,
    user: USER_DB,
    password: PASSWORD_DB,
    database: DATABASE_DB,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
    acquireTimeout: 10000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
});

export const poolSocio = mysql.createPool({
    host: HOST_DB,
    user: USER_DB_SOCIO,
    password: PASSWORD_DB_SOCIO,
    database: DATABASE_DB_SOCIO,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
    acquireTimeout: 10000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
})