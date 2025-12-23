import { pool } from '#src/db/db.js';
import { ERROR_CODES } from '#src/helpers/errores.js';
import { pushToAll, pushToGroup, pushToUser } from '#src/services/push.service.js';

export const subscribeNotifications = async (req, res) => {
    try {
        const { subscription } = req.body;
        const userId = req.user.sub;

        if (!subscription) return res.status(400).json({ ok: false, message: 'No se recibió la subscripción', data: [], error: ERROR_CODES.NOT_FOUND, status: ERROR_CODES.NOT_FOUND, code: 400 });

            const { endpoint, keys } = subscription;

            const sql = `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth) VALUES (?, ?, ?, ?)`;

            await pool.query(sql, [userId, endpoint, keys.p256dh, keys.auth]);

                return res.status(200).json({ok: true, message: 'Se subscribió las notificaciones push de Ándale Ya!', data: [], error: '', status: ERROR_CODES.SUCCESS, code: 200});

    } catch (error) {
        return res.status(500).json({
            ok: false,
            message: `Error interno del servidor`,
            data: [],
            error: error.message,
            status: ERROR_CODES.SERVER_ERROR,
            code: 500
        })
    }
}

const handlers = {
    USER: async ({ userId, payload }) => {
        if (!userId) throw new Error("USER_ID_REQUIRED");
        await pushToUser(userId, payload);
    },

    GROUP: async ({ groupId, payload }) => {
        if (!groupId) throw new Error("GROUP_ID_REQUIRED");
        await pushToGroup(groupId, payload);
    },

    GLOBAL: async ({ payload }) => {
        await pushToAll(payload);
    }
};

export const sendPushNotification = async (req, res) => {
    try {
        
        const { type, payload, userId, groupId } = req.body;
        if (!handlers[type]) return res.status(400).json({ok: false, message: "Tipo de notificación inválido", status: ERROR_CODES.BAD_REQUEST, code: 400});
        if (!payload?.title || !payload?.body) return res.status(400).json({ok: false, message: "Payload incompleto", status: ERROR_CODES.BAD_REQUEST, code: 400});

            await handlers[type]({ userId, groupId, payload });

            return res.status(200).json({
                ok: true,
                message: "Notificación enviada correctamente",
                error: '',
                status: ERROR_CODES.SUCCESS,
                code: 200
            });

    } catch (error) {
        const errorMap = {
            USER_ID_REQUIRED: "userId es requerido",
            GROUP_ID_REQUIRED: "groupId es requerido"
        };
        return res.status(400).json({
            ok: false,
            message: errorMap[error.message] || "Error interno en el servidor",
            status: errorMap[error.message]
                ? ERROR_CODES.BAD_REQUEST
                : ERROR_CODES.SERVER_ERROR,
            code: errorMap[error.message] ? 400 : 500
        });
    }
}