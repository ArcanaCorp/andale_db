import { pool } from "#src/db/db.js";
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from "#src/config.js"
import { ERROR_CODES } from "#src/helpers/errores.js"
import { serviceSendOTP } from "#src/services/otp.js"

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const ALLOWED_FIELDS = {
    name_user: "name_user",
    phone_user: "phone_user"
};

export const login = async (req, res) => {
    
    const { phone } = req.body;
    
    if (!phone || phone.length !== 9) return res.status(404).json({ok: false, message: `Ingresa un número válido que debe tener 9 dígitos`, error: `${ERROR_CODES.BAD_REQUEST}`, code: 404});
    
        try {
            
            const sql = 'SELECT * FROM users WHERE phone_user = ?';
            const [ verify ] = await pool.query(sql, [phone])
            
            const otp = generateOTP();
            const expires = new Date(Date.now() + 5 * 60 * 1000); // OTP expira en 5 minutos
            
            if (verify.length > 0) {
                
                const updateSql = `UPDATE users SET otp_user = ?, oexpires_user = ?, updated_user = CURRENT_TIMESTAMP WHERE phone_user = ?`;
                await pool.query(updateSql, [otp, expires, phone]);
                await serviceSendOTP(phone, otp)
                return res.status(200).json({ok: true, message: "Código enviado correctamente.", code: 200});
            
            }
            
            const insertSql = `INSERT INTO users (sub_user, name_user, phone_user, otp_user, oexpires_user) VALUES (?, ?, ?, ?, ?)`;

            // sub_user es obligatorio → generamos uno simple
            const sub_user = Date.now().toString();

            await pool.query(insertSql, [sub_user, "", phone, otp, expires]);
            await serviceSendOTP(phone, otp)
            return res.status(201).json({ok: true, message: "Código enviado correctamente.", code: 201});
            
        } catch (error) {
            return res.status(500).json({ok: false, message: `Error: ${error.message}`, error: `${ERROR_CODES.SERVER_ERROR}`, code: 500});
        }
    
}

export const verifyOTP = async (req, res) => {
    
    const { phone, code } = req.body; 
    
    // Validaciones directas y sin floro
    if (!phone || phone.length !== 9) {
        return res.status(400).json({
            ok: false,
            message: "Ingresa un número válido de 9 dígitos.",
            error: ERROR_CODES.BAD_REQUEST,
            code: 400
        });
    }

    if (!code || code.length !== 6) {
        return res.status(400).json({
            ok: false,
            message: "Código OTP inválido.",
            error: ERROR_CODES.BAD_REQUEST,
            code: 400
        });
    }

    try {
        // Buscar usuario por teléfono
        const sql = "SELECT * FROM users WHERE phone_user = ?";
        const [user] = await pool.query(sql, [phone]);

        if (user.length === 0) {
            return res.status(404).json({
                ok: false,
                message: "Usuario no encontrado.",
                error: ERROR_CODES.NOT_FOUND,
                code: 404
            });
        }

        const currentUser = user[0];

        // Verificar si OTP coincide
        if (currentUser.otp_user !== code) {
            return res.status(401).json({
                ok: false,
                message: "El código OTP es incorrecto.",
                error: ERROR_CODES.UNAUTHORIZED,
                code: 401
            });
        }

        // Verificar expiración del OTP
        const now = new Date();
        const expires = new Date(currentUser.oexpires_user);

        if (now > expires) {
            return res.status(410).json({
                ok: false,
                message: "El código OTP ha expirado.",
                error: ERROR_CODES.EXPIRED,
                code: 410
            });
        }

        // Marcar usuario como verificado
        const updateSql = `UPDATE users SET verified_user = 1, updated_user = CURRENT_TIMESTAMP WHERE phone_user = ?`;

        await pool.query(updateSql, [phone]);

        // Boolean: ¿el usuario ya completó su registro?
        const completed = currentUser.name_user.trim() !== "";

        return res.status(200).json({
            ok: true,
            message: "Verificación completada",
            verified: true,
            sub: currentUser.sub_user,
            completed, // true si name_user está lleno, false si está vacío
            code: 200
        });

    } catch (error) {
        return res.status(500).json({
            ok: false,
            message: `Error: ${error.message}`,
            error: ERROR_CODES.SERVER_ERROR,
            code: 500
        });
    }
    
}

export const getProfile = async (req, res) => {
    
    const { sub } = req.params;

    if (!sub) {
        return res.status(400).json({
            ok: false,
            message: "El parámetro 'sub' es obligatorio.",
            error: ERROR_CODES.BAD_REQUEST,
            code: 400
        });
    }

    try {
        // Buscar usuario por sub_user
        const sql = "SELECT * FROM users WHERE sub_user = ?";
        const [user] = await pool.query(sql, [sub]);

        if (user.length === 0) {
            return res.status(404).json({
                ok: false,
                message: "Usuario no encontrado.",
                error: ERROR_CODES.NOT_FOUND,
                code: 404
            });
        }

        const currentUser = user[0];

        // Normalización de datos (solo lo necesario)
        const profile = {
            sub: currentUser.sub_user,
            name: currentUser.name_user,
            phone: currentUser.phone_user,
            verified: Boolean(currentUser.verified_user),
            favorites: [],
            orders: [],
            createdAt: currentUser.created_user,
            updatedAt: currentUser.updated_user
        };

        // Generar un JWT con el perfil
        const token = jwt.sign(profile, JWT_SECRET, {expiresIn: "7d"});

        return res.status(200).json({
            ok: true,
            message: "Perfil obtenido correctamente.",
            token,
            code: 200
        });

    } catch (error) {
        return res.status(500).json({
            ok: false,
            message: `Error: ${error.message}`,
            error: ERROR_CODES.SERVER_ERROR,
            code: 500
        });
    }
}

export const updateProfile = async (req, res) => {
    const { sub } = req.params;
    const { field, value } = req.body;

    // Validación → sin rodeos
    if (!sub) {
        return res.status(400).json({
            ok: false,
            message: "El parámetro 'sub' es obligatorio.",
            error: ERROR_CODES.BAD_REQUEST,
            code: 400
        });
    }

    if (!field || value === undefined) {
        return res.status(400).json({
            ok: false,
            message: "Los parámetros 'field' y 'value' son obligatorios.",
            error: ERROR_CODES.BAD_REQUEST,
            code: 400
        });
    }

    // Validar campo permitido
    if (!ALLOWED_FIELDS[field]) {
        return res.status(400).json({
            ok: false,
            message: `El campo '${field}' no está permitido.`,
            error: ERROR_CODES.BAD_REQUEST,
            code: 400
        });
    }

    try {
        // Buscar usuario
        const [user] = await pool.query(
            "SELECT * FROM users WHERE sub_user = ?",
            [sub]
        );

        if (user.length === 0) {
            return res.status(404).json({
                ok: false,
                message: "Usuario no encontrado.",
                error: ERROR_CODES.NOT_FOUND,
                code: 404
            });
        }

        // Construimos query de forma segura
        const sql = `UPDATE users SET ${ALLOWED_FIELDS[field]} = ?, updated_user = CURRENT_TIMESTAMP WHERE sub_user = ?`;
        const [result] = await pool.query(sql, [value, sub]);

        if (result.affectedRows === 0) {
            return res.status(400).json({
                ok: false,
                message: "No se pudo actualizar el perfil.",
                error: ERROR_CODES.BAD_REQUEST,
                code: 400
            });
        }

        return res.status(200).json({
            ok: true,
            message: "Perfil actualizado correctamente.",
            field,
            value,
            code: 200
        });

    } catch (error) {
        return res.status(500).json({
            ok: false,
            message: `Error: ${error.message}`,
            error: ERROR_CODES.SERVER_ERROR,
            code: 500
        });
    }
};