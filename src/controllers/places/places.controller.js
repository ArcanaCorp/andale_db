import { poolPlaces } from "#src/db/db.js";
import { ERROR_CODES } from "#src/helpers/errores.js"
import { normalizePlace } from "#src/helpers/normalizers.js";

export const getAllPlaces = async (req, res) => {
    try {
        
        const [rows] = await poolPlaces.query(`SELECT p.*, i.image_iplaces FROM places p LEFT JOIN images_places i ON i.sub_place = p.sub_place ORDER BY p.id_place`);

        const placesMap = new Map();

        rows.forEach(row => {
            if (!placesMap.has(row.id_place)) {
                // Usamos normalizePlace aquí
                placesMap.set(row.id_place, normalizePlace(row));
            }
            if (row.image_iplaces) {
                placesMap.get(row.id_place).images.push(row.image_iplaces);
            }
        });

        const places = Array.from(placesMap.values());

        return res.status(200).json({ok: true, data: places, message: "Lugares listados", error: "", code: 200});
        
    } catch (error) {
        return res.status(500).json({ ok: false, message: `Error: ${error.message}`, error: ERROR_CODES.SERVER_ERROR, code: 500 })
    }
}

export const getCategories = async (req, res) => {
    try {
        // Obtenemos categorías y cantidad de lugares por cada una
        const [rows] = await poolPlaces.query(`SELECT category_place, COUNT(*) AS count FROM places GROUP BY category_place ORDER BY category_place`);

        // Normalizamos respuesta
        const categories = rows.map(row => ({
            category: row.category_place,
            count: row.count
        }));

        return res.status(200).json({
            ok: true,
            data: categories,
            message: "Categorías listadas",
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

export const getByCategory = async (req, res) => { 
    try {
        const category = req.params.category;
        const { district, province, region } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // 🔹 Construcción dinámica del WHERE
        let where = `province_location_place = ? AND region_location_place = ?`;
        const queryParamsBase = [province, region];

        // 🔹 Si district ≠ "all", agregar filtro
        if (district && district !== "all") {
            where += ` AND district_location_place = ?`;
            queryParamsBase.push(district);
        }

        let placesQuery;
        let queryParams;

        // 🔹 Caso especial: categoría = all (10 aleatorios)
        if (category === "all") {
            placesQuery = `
                SELECT *
                FROM places
                WHERE ${where}
                ORDER BY RAND()
                LIMIT 10
            `;
            queryParams = [...queryParamsBase];
        } 
        // 🔹 Categoría normal con paginación
        else {
            placesQuery = `
                SELECT *
                FROM places
                WHERE category_place = ? AND ${where}
                ORDER BY name_place
                LIMIT ? OFFSET ?
            `;
            queryParams = [category, ...queryParamsBase, limit, offset];
        }

        // 1️⃣ Ejecutar query principal
        const [places] = await poolPlaces.query(placesQuery, queryParams);

        if (places.length === 0) {
            return res.status(200).json({
                ok: true,
                data: [],
                message: category === "all" 
                    ? "No se encontraron lugares en general" 
                    : "No se encontraron lugares para esta categoría",
                error: "",
                code: 200
            });
        }

        // 2️⃣ Imágenes
        const subPlaces = places.map(p => p.sub_place);
        const [images] = await poolPlaces.query(
            `SELECT * FROM images_places WHERE sub_place IN (?)`,
            [subPlaces]
        );

        // 3️⃣ Unir datos e imágenes
        const placesWithImages = places.map(place => {
            const placeImages = images
                .filter(img => img.sub_place === place.sub_place)
                .map(img => img.image_iplaces);
            return normalizePlace(place, placeImages);
        });

        // 4️⃣ Respuesta final
        return res.status(200).json({
            ok: true,
            data: placesWithImages,
            message: category === "all"
                ? "10 lugares seleccionados aleatoriamente"
                : `Lugares de la categoría "${category}" listados`,
            error: "",
            code: 200,
            pagination: category === "all" 
                ? null 
                : { page, limit, total: placesWithImages.length }
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

export const getBySlug = async (req, res) => {
    const { slug } = req.params;

    if (!slug) {
        return res.status(400).json({
            ok: false,
            message: 'Falta el slug',
            error: ERROR_CODES.BAD_REQUEST,
            code: 400
        });
    }

    try {
        // Traemos el lugar junto con sus imágenes
        const [rows] = await poolPlaces.query(`SELECT p.*, i.image_iplaces FROM places p LEFT JOIN images_places i ON i.sub_place = p.sub_place WHERE p.sub_place = ?`, [slug]);

        if (!rows.length) {
            return res.status(404).json({
                ok: false,
                message: 'Lugar no encontrado',
                error: ERROR_CODES.NOT_FOUND,
                code: 404
            });
        }

        // Agrupamos las imágenes y normalizamos
        const placeMap = new Map();
        rows.forEach(row => {
            if (!placeMap.has(row.id_place)) {
                placeMap.set(row.id_place, normalizePlace(row));
            }
            if (row.image_iplaces) {
                placeMap.get(row.id_place).images.push(row.image_iplaces);
            }
        });

        const place = Array.from(placeMap.values())[0];

        return res.status(200).json({
            ok: true,
            data: place,
            message: 'Lugar encontrado',
            error: '',
            code: 200
        });

    } catch (error) {
        return res.status(500).json({
            ok: false,
            message: `Error interno: ${error.message}`,
            error: ERROR_CODES.SERVER_ERROR,
            code: 500
        });
    }
}