import { ERROR_CODES } from "#src/helpers/errores.js"

export const userMiddleware = (req, res, next) => {
    try {

        const header = req.headers.authorization || req.headers.Authorization;

        if (!header || !header.startsWith("Bearer ")) return res.status(401).json({ok: false, message: "Token no proporcionado", error: ERROR_CODES.TOKEN_REQUIRED, status: ERROR_CODES.TOKEN_REQUIRED, code: 401});

            const token = header.split(" ")[1];
            if (!/^\d+$/.test(token)) return res.status(401).json({ok: false, message: "Token inválido", error: ERROR_CODES.INVALID_TOKEN, status: ERROR_CODES.INVALID_TOKEN, code: 401});

            req.user = {
                sub: Number(token)
            };

            next();

    } catch (error) {
        return res.status(500).json({
            ok: false,
            message: "Error en la validación del usuario.",
            error: error.message,
            status: ERROR_CODES.SERVER_ERROR,
            code: 500
        });
    }
};