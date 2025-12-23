import { JWT_SECRET } from "#src/config.js";
import { poolSocio } from "#src/db/db.js";
import { ERROR_CODES } from "#src/helpers/errores.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const login = async (req, res) => {
    
    const { phone } = req.body;
    if (!phone || phone.length !== 9) {
        return res.status(400).json({
            ok: false,
            message: "Ingresa un número válido.",
            error: ERROR_CODES.BAD_REQUEST,
            code: 400
        });
    }

    try {

        const now = new Date();
        const [rows] = await poolSocio.query(`SELECT id_bussines, oexpires_bussines FROM bussines WHERE phone_bussines = ? LIMIT 1`, [phone]);

        // 🔒 Rate limit: OTP aún vigente
        if (rows.length > 0 && rows[0].oexpires_bussines) {
            if (new Date(rows[0].oexpires_bussines) > now) {
                return res.status(429).json({
                    ok: false,
                    message: "Debes esperar antes de solicitar otro código.",
                    error: ERROR_CODES.BAD_REQUEST,
                    code: 429
                });
            }
        }

        const otp = generateOTP();
        const otpHash = await bcrypt.hash(otp, 10);
        const expires = new Date(now.getTime() + 5 * 60 * 1000);

        // 🔹 EXISTE → UPDATE
        if (rows.length > 0) {            
            await poolSocio.query(`UPDATE bussines SET otp_bussines = ?, oexpires_bussines = ?, update_bussines = CURRENT_TIMESTAMP WHERE phone_bussines = ?`, [otpHash, expires, phone]);
            console.log("OTP:", otp);
            return res.status(200).json({
                ok: true,
                message: "Código enviado correctamente.",
                status: ERROR_CODES.SUCCESS,
                code: 200
            });
        }

        // 🔹 NO EXISTE → INSERT
        const sub_bussines = Date.now().toString();

        await poolSocio.query(
            `INSERT INTO bussines (
                sub_bussines,
                short_bussines,
                phone_bussines,
                otp_bussines,
                oexpires_bussines,
                name_bussines,
                category_bussines,
                delivery_bussines,
                direction_bussines,
                district_bussines,
                province_bussines,
                region_bussines,
                photo_bussines,
                portada_bussines
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                sub_bussines,
                sub_bussines,
                phone,
                otpHash,
                expires,
                "Pendiente",
                "Pendiente",
                0.0,
                "Pendiente",
                "Pendiente",
                "Pendiente",
                "Pendiente",
                "",
                ""
            ]
        );

        // console.log("OTP:", otp);

        return res.status(200).json({
            ok: true,
            message: "Código enviado correctamente.",
            status: ERROR_CODES.SUCCESS,
            code: 200
        });

    } catch (error) {
        return res.status(500).json({
            ok: false,
            message: "Error interno del servidor.",
            error: error,
            status: ERROR_CODES.SERVER_ERROR,
            code: 500
        });
    }
};

export const verifyOTP = async (req, res) => {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
        return res.status(400).json({
            ok: false,
            message: "Datos incompletos.",
            error: ERROR_CODES.BAD_REQUEST,
            code: 400
        });
    }

    try {

        const [rows] = await poolSocio.query(`SELECT id_bussines, sub_bussines, otp_bussines, oexpires_bussines FROM bussines WHERE phone_bussines = ? LIMIT 1`, [phone]);

        if (!rows.length) {
            return res.status(404).json({
                ok: false,
                message: "Cuenta no encontrada.",
                error: ERROR_CODES.NOT_FOUND,
                code: 404
            });
        }

        const { id_bussines, sub_bussines, otp_bussines, oexpires_bussines } = rows[0];

        if (!otp_bussines || !oexpires_bussines) {
            return res.status(400).json({
                ok: false,
                message: "No hay código activo.",
                error: ERROR_CODES.BAD_REQUEST,
                code: 400
            });
        }

        if (new Date(oexpires_bussines) < new Date()) {
            return res.status(400).json({
                ok: false,
                message: "El código ha expirado.",
                error: ERROR_CODES.TOKEN_EXPIRED,
                code: 400
            });
        }

        const validOTP = await bcrypt.compare(otp, otp_bussines);

        if (!validOTP) {
            return res.status(401).json({
                ok: false,
                message: "Código incorrecto.",
                error: ERROR_CODES.UNAUTHORIZED,
                code: 401
            });
        }

        // 🔐 Invalidate OTP
        await poolSocio.query(`UPDATE bussines SET otp_bussines = NULL, oexpires_bussines = NULL WHERE id_bussines = ?`, [id_bussines]);

        // 🔑 Token de sesión
        const payload = {
            sub: sub_bussines
        }

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1y' })

        return res.status(200).json({
            ok: true,
            message: "Login exitoso.",
            token,
            status: ERROR_CODES.SUCCESS,
            code: 200
        });

    } catch (error) {
        return res.status(500).json({
            ok: false,
            message: "Error interno del servidor.",
            error: error,
            status: ERROR_CODES.SERVER_ERROR,
            code: 500
        });
    }

};

export const logout = async (req, res) => {}