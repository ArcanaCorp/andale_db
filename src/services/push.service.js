import webpush from "#src/config/webpush.js";
import { pool } from "#src/db/db.js";

const buildSubscription = (row) => ({
    endpoint: row.endpoint,
    keys: {
        p256dh: row.p256dh,
        auth: row.auth,
    },
});

const sendPush = async (subscriptions, payload) => {
    for (const sub of subscriptions) {
        try {
            await webpush.sendNotification(buildSubscription(sub), JSON.stringify(payload));
        } catch (err) {
            if (err.statusCode === 410 || err.statusCode === 404) {
                await pool.query("DELETE FROM push_subscriptions WHERE endpoint = ?", [sub.endpoint]);
            } else {
                console.error("Push error:", err.message);
            }
        }
    }
};

export const pushToUser = async (userId, payload) => {
    const [subs] = await pool.query("SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = ?", [userId]);
    if (!subs.length) return;
    await sendPush(subs, {...payload, type: "USER", data: { userId }});
};

export const pushToGroup = async (groupId, payload) => {
    const sql = `SELECT ps.endpoint, ps.p256dh, ps.auth FROM push_subscriptions ps INNER JOIN user_groups ug ON ug.user_id = ps.user_id WHERE ug.group_id = ?`
    const [subs] = await pool.query(sql, [groupId]);
    if (!subs.length) return;
    await sendPush(subs, {...payload, type: "GROUP", data: { groupId }});
};

export const pushToAll = async (payload) => {
    const [subs] = await pool.query("SELECT endpoint, p256dh, auth FROM push_subscriptions");
    if (!subs.length) return;
    await sendPush(subs, {...payload, type: "GLOBAL"});
};