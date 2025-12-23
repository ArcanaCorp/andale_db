import { pool, poolPlaces } from "#src/db/db.js";
import { getDistance } from "#src/helpers/distance.js";
import { ERROR_CODES } from "#src/helpers/errores.js"
import { normalizePlace } from "#src/helpers/normalizers.js";

export const toggleLike = async (req, res) => {
    try {
        const { slug } = req.params;
        const { sub_user } = req.body; // usuario que da like

        if (!slug || !sub_user) {
            return res.status(400).json({
                ok: false,
                message: "Falta slug o sub_user",
                error: ERROR_CODES.BAD_REQUEST,
                code: 400
            });
        }

        // Obtenemos el lugar
        const [places] = await poolPlaces.query("SELECT liked_place FROM places WHERE sub_place = ? LIMIT 1", [slug]);

        if (!places.length) {
            return res.status(404).json({
                ok: false,
                message: "Lugar no encontrado",
                error: ERROR_CODES.NOT_FOUND,
                code: 404
            });
        }

        const currentLikes = places[0].liked_place || 0;

        // Revisamos si el usuario ya dio like
        const [existing] = await poolPlaces.query("SELECT id_liked_place FROM liked_places WHERE sub_place = ? AND sub_user = ? LIMIT 1", [slug, sub_user]);

        let action;
        let newLikes;

        if (existing.length) {
            // Usuario ya dio like → eliminar
            await poolPlaces.query("DELETE FROM liked_places WHERE id_liked_place = ?", [existing[0].id_liked_place]);
            newLikes = currentLikes > 0 ? currentLikes - 1 : 0;
            action = "removed";
        } else {
            // Usuario no ha dado like → agregar
            await poolPlaces.query("INSERT INTO liked_places (sub_place, sub_user, created_liked_place) VALUES (?, ?, NOW())", [slug, sub_user]);
            newLikes = currentLikes + 1;
            action = "added";
        }

        // Actualizamos contador en places
        await poolPlaces.query("UPDATE places SET liked_place = ? WHERE sub_place = ?", [newLikes, slug]);

        return res.status(200).json({
            ok: true,
            data: { slug, liked: newLikes, action },
            message: action === "added" ? "Like agregado" : "Like removido",
            error: "",
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

export const toggleShare = async (req, res) => {
    
    try {
    
        const { slug } = req.params;
        const { payload } = req.body;

        if (!slug || !payload?.user_id) {
            return res.status(400).json({
                ok: false,
                message: "Falta slug o user_id",
                error: ERROR_CODES.BAD_REQUEST,
                code: 400
            });
        }

        const {
            user_id,
            content_type,
            content_id,
            source_page,
            platform,
            device_info,
            browser,
            os,
            metadata,
            shared_at
        } = payload;

        // 1. Validamos lugar
        const [places] = await poolPlaces.query("SELECT shared_place FROM places WHERE sub_place = ? LIMIT 1", [slug]);

        if (!places.length) {
            return res.status(404).json({
                ok: false,
                message: "Lugar no encontrado",
                error: ERROR_CODES.NOT_FOUND,
                code: 404
            });
        }

        // 2. Registro básico en shared_places
        await poolPlaces.query("INSERT INTO shared_places (sub_place, sub_user, created_shared_places) VALUES (?, ?, NOW())", [content_id, user_id]);

        // 3. Insertamos analítica avanzada
        await pool.query(`INSERT INTO analytics_shared (user_id, content_type, content_id, source_page, platform, device_info, browser, os, metadata, shared_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                user_id,
                content_type || "other",
                content_id,
                source_page,
                platform || "other",
                device_info || "unknown",
                browser || null,
                os || null,
                JSON.stringify(metadata || {}),
                shared_at
            ]
        );

        // 4. Incrementamos contador del lugar
        const newSharedCount = (places[0].shared_place || 0) + 1;

        await poolPlaces.query(
            "UPDATE places SET shared_place = ? WHERE sub_place = ?",
            [newSharedCount, slug]
        );

        return res.status(200).json({
            ok: true,
            message: "Lugar compartido y analizado correctamente",
            data: { shared: newSharedCount },
            error: "",
            code: 200
        });

    } catch (error) {
        console.error("toggleShare error:", error);
        return res.status(500).json({
            ok: false,
            message: `Error: ${error.message}`,
            error: ERROR_CODES.SERVER_ERROR,
            code: 500
        });
    }
};

export const getRecommendations = async (req, res) => {
    try {
        const { slug } = req.params;
        if (!slug) {
            return res.status(400).json({
                ok: false,
                message: "Falta slug del lugar",
                error: ERROR_CODES.BAD_REQUEST,
                code: 400
            });
        }

        // Obtenemos el lugar actual
        const [places] = await poolPlaces.query("SELECT * FROM places WHERE sub_place = ? LIMIT 1", [slug]);

        if (!places.length) {
            return res.status(404).json({
                ok: false,
                message: "Lugar no encontrado",
                error: ERROR_CODES.NOT_FOUND,
                code: 404
            });
        }

        const currentPlace = places[0];

        // Buscamos recomendaciones: misma categoría y excluyendo el lugar actual
        const [recommendationsRows] = await poolPlaces.query(
            `SELECT p.*, GROUP_CONCAT(i.image_iplaces) as images
             FROM places p
             LEFT JOIN images_places i ON i.sub_place = p.sub_place
             WHERE p.category_place = ? AND p.sub_place != ?
             GROUP BY p.id_place
             ORDER BY p.liked_place DESC, p.shared_place DESC
             LIMIT 5`,
            [currentPlace.category_place, slug]
        );

        const recommendations = recommendationsRows.map(row => {
            const images = row.images ? row.images.split(",") : [];
            return normalizePlace(row, images);
        });

        return res.status(200).json({
            ok: true,
            data: recommendations,
            message: "Recomendaciones obtenidas",
            error: "",
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

export const getMostPopular = async (req, res) => {
    try {
        const [popularRows] = await poolPlaces.query(
            `SELECT p.*, GROUP_CONCAT(i.image_iplaces) as images
             FROM places p
             LEFT JOIN images_places i ON i.sub_place = p.sub_place
             GROUP BY p.id_place
             ORDER BY p.liked_place DESC, p.shared_place DESC
             LIMIT 5`
        );

        let places = popularRows.map(row => normalizePlace(row, row.images ? row.images.split(",") : []));

        // Si hay menos de 5, completar con lugares aleatorios
        if (places.length < 5) {
            const needed = 5 - places.length;
            const [randomRows] = await poolPlaces.query(
                `SELECT p.*, GROUP_CONCAT(i.image_iplaces) as images
                 FROM places p
                 LEFT JOIN images_places i ON i.sub_place = p.sub_place
                 WHERE p.id_place NOT IN (${places.map(p => p.id).join(",") || 0})
                 GROUP BY p.id_place
                 ORDER BY RAND()
                 LIMIT ?`,
                [needed]
            );
            places = [...places, ...randomRows.map(row => normalizePlace(row, row.images ? row.images.split(",") : []))];
        }

        return res.status(200).json({
            ok: true,
            data: places,
            message: "Lugares más populares",
            error: "",
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

export const getNearbyPlaces = async (req, res) => {
    try {
        const { lat, lng } = req.query; // lat/lng enviados desde frontend

        if (!lat || !lng) {
            return res.status(400).json({
                ok: false,
                message: "Faltan coordenadas lat/lng",
                error: ERROR_CODES.BAD_REQUEST,
                code: 400
            });
        }

        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);

        // Traemos lugares que tengan location_place
        const [rows] = await poolPlaces.query(`
            SELECT p.*, GROUP_CONCAT(i.image_iplaces) as images
            FROM places p
            LEFT JOIN images_places i ON i.sub_place = p.sub_place
            WHERE p.location_place IS NOT NULL
            GROUP BY p.id_place
        `);

        const nearby = rows
            .map(row => {
                const images = row.images ? row.images.split(",") : [];
                if (!row.location_place) return null;
        
                let loc;
                try {
                    loc = JSON.parse(row.location_place);
                } catch {
                    return null; // JSON inválido
                }
        
                if (!loc || typeof loc.lat !== "number" || typeof loc.lng !== "number") return null;
        
                const distance = getDistance(userLat, userLng, loc.lat, loc.lng);
                return { place: normalizePlace(row, images), distance };
            })
            .filter(Boolean)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 10)
            .map(p => p.place);

        return res.status(200).json({
            ok: true,
            data: nearby,
            message: "Lugares cercanos",
            error: "",
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

export const getPlaceStats = async (req, res) => {
    try {
        const { slug } = req.params;
        if (!slug) {
            return res.status(400).json({
                ok: false,
                message: "Falta slug del lugar",
                error: ERROR_CODES.BAD_REQUEST,
                code: 400
            });
        }

        const [rows] = await poolPlaces.query(
            `SELECT p.liked_place, p.shared_place, COUNT(i.id_iplaces) as images_count
             FROM places p
             LEFT JOIN images_places i ON i.sub_place = p.sub_place
             WHERE p.sub_place = ?
             GROUP BY p.id_place`,
            [slug]
        );

        if (!rows.length) {
            return res.status(404).json({
                ok: false,
                message: "Lugar no encontrado",
                error: ERROR_CODES.NOT_FOUND,
                code: 404
            });
        }

        const stats = {
            likes: rows[0].liked_place,
            shares: rows[0].shared_place,
            images: rows[0].images_count
        };

        return res.status(200).json({
            ok: true,
            data: stats,
            message: "Estadísticas del lugar",
            error: "",
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