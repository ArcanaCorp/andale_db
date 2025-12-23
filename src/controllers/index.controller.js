import { poolPlaces, poolSocio } from "#src/db/db.js";
import { ERROR_CODES } from "#src/helpers/errores.js";
import { ENDPOINT } from "#src/config.js";

export const getHomeScreenData = async (req, res) => {
    const { province, region } = req.query;

    try {
        const sections = [];

        // ================================================
        // 1️⃣ PLACES: Filtra por provincia y región, si no hay -> random
        // ================================================
        const [placesRows] = await poolPlaces.query(
            `
            SELECT p.*, GROUP_CONCAT(i.image_iplaces) AS images
            FROM places p
            LEFT JOIN images_places i ON i.sub_place = p.sub_place
            WHERE p.province_location_place = ? AND p.region_location_place = ?
            GROUP BY p.id_place
            ORDER BY p.liked_place DESC
            LIMIT 5
            `,
            [province, region]
        );

        let placesList = [];

        if (placesRows.length === 0) {
            // Fallback aleatorio
            const [randomPlaces] = await poolPlaces.query(`
                SELECT p.*, GROUP_CONCAT(i.image_iplaces) AS images
                FROM places p
                LEFT JOIN images_places i ON i.sub_place = p.sub_place
                GROUP BY p.id_place
                ORDER BY RAND()
                LIMIT 5
            `);
            placesList = randomPlaces.map(row => formatPlace(row));
        } else {
            placesList = placesRows.map(row => formatPlace(row));
        }

        sections.push({
            title: `Conoce lo mejor de ${province}`,
            list: placesList,
            link: "/places",
        });

        // ================================================
        // 2️⃣ BUSSINES: Filtra por provincia y región, si no hay -> random
        // ================================================
        const categories = ["agency", "restaurant", "hotel", "ecommerce"];
        const categoryTitles = {
            agency: `Visita con los mejores ${province}`,
            restaurant: `Deliciosos manjares ${province}`,
            hotel: `Descansa como en casa ${province}`,
            ecommerce: `Llévate lo mejor ${province}`,
        };
        const categoryLink = {
            agency: "/agency",
            restaurant: "/foodies",
            hotel: "/hotels",
            ecommerce: "/store",
        };

        const businessesPromises = categories.map(async (cat) => {
            // Intentar filtrar por provincia y región
            const [rows] = await poolSocio.query(
                `
                SELECT * FROM bussines
                WHERE category_bussines = ?
                AND province_bussines = ?
                AND region_bussines = ?
                ORDER BY created_bussines DESC
                LIMIT 5
                `,
                [cat, province, region]
            );

            if (rows.length > 0) return rows;

            // Si no hay resultados, tomar random
            const [randomRows] = await poolSocio.query(
                `
                SELECT * FROM bussines
                WHERE category_bussines = ?
                ORDER BY RAND()
                LIMIT 5
                `,
                [cat]
            );

            return randomRows;
        });

        const businessesResults = await Promise.all(businessesPromises);

        categories.forEach((cat, index) => {
            const list = businessesResults[index].map(b => ({
                id: b.id_bussines,
                sub: b.short_bussines || b.sub_bussines,
                name: b.name_bussines,
                text: b.direction_bussines,
                image: b.photo_bussines
                    ? `${ENDPOINT}/socio/${b.sub_bussines}/bussines/photo/${b.photo_bussines}`
                    : null,
            }));

            sections.push({
                title: categoryTitles[cat],
                list,
                link: categoryLink[cat],
            });
        });

        // ================================================
        // ✅ RESPUESTA FINAL
        // ================================================
        return res.status(200).json({
            ok: true,
            message: "Datos para pantalla principal",
            error: "",
            code: 200,
            data: sections,
        });

    } catch (error) {
        return res.status(500).json({
            ok: false,
            message: `Error: ${error.message}`,
            error: ERROR_CODES.SERVER_ERROR,
            code: 500,
        });
    }
};

// ==============================
// 🔧 Función auxiliar
// ==============================
const formatPlace = (row) => {
    const images = row.images ? row.images.split(",") : [];
    return {
        id: row.id_place,
        sub: row.sub_place,
        name: row.name_place,
        text: row.locationName_place,
        image: images[0] ? `https://pub-487e9af8ee794e45bbd21e01543ea544.r2.dev/${row.sub_place}/${images[0]}` : null,
    };
};


export const searchController = async (req, res) => {
    try {
        const query = req.query.q;

        if (!query || query.trim() === '') return res.status(400).json({ ok: false, message: 'El parámetro de búsqueda "q" es obligatorio', data: [], length: 0, error: 'BAD_REQUEST', code: 400 });

        // Buscar en places con relevancia
        //const [ places ] = await poolPlaces.query(`SELECT id_place, sub_place, name_place, category_place, MATCH(name_place, text_place, category_place, locationName_place) AGAINST (? IN NATURAL LANGUAGE MODE) AS relevance FROM places WHERE MATCH(name_place, text_place, category_place, locationName_place) AGAINST (? IN NATURAL LANGUAGE MODE) ORDER BY relevance DESC LIMIT 10`, [query, query]);
        const [ places ] = await poolPlaces.query(`
            SELECT 
                p.id_place,
                p.sub_place,
                p.name_place,
                p.category_place,
                ip.image_iplaces,
                MATCH(p.name_place, p.text_place, p.category_place, p.locationName_place) AGAINST (? IN NATURAL LANGUAGE MODE) AS relevance
            FROM places p
            LEFT JOIN (
                SELECT sub_place, MIN(image_iplaces) AS image_iplaces
                FROM images_places
                GROUP BY sub_place
            ) ip ON p.sub_place = ip.sub_place
            WHERE MATCH(p.name_place, p.text_place, p.category_place, p.locationName_place) AGAINST (? IN NATURAL LANGUAGE MODE)
            ORDER BY relevance DESC
            LIMIT 10`, 
            [query, query]
        );

        // Buscar en bussines con relevancia
        const [ bussines ] = await poolSocio.query(`SELECT id_bussines, name_bussines, text_bussines, category_bussines, short_bussines, sub_bussines, direction_bussines, photo_bussines, MATCH(name_bussines, text_bussines, category_bussines, short_bussines, sub_bussines, direction_bussines) AGAINST (? IN NATURAL LANGUAGE MODE) AS relevance FROM bussines WHERE MATCH(name_bussines, text_bussines, category_bussines, short_bussines, sub_bussines, direction_bussines) AGAINST (? IN NATURAL LANGUAGE MODE) ORDER BY relevance DESC LIMIT 10`, [query, query]);
        
        const linkMap = {
            agency: '/agency',
            restaurant: '/foodies',
            hotel: '/hotels',
            ecommerce: '/store'
        }
        
        // Unificar resultados en una sola lista
        const results = [
            ...places.map(place => ({
                id: place.id_place,
                sub: place.sub_place,
                name: place.name_place,
                text: place.category_place,
                image: place.image_iplaces ? `${ENDPOINT}/places/${place.sub_place}/image/${place.image_iplaces}` : '',
                type: 'place',
                link: '/places',
                relevance: place.relevance
            })),
            ...bussines.map(buss => ({
                id: buss.id_bussines,
                sub: buss.short_bussines || buss.sub_bussines,
                name: buss.name_bussines,
                text: buss.direction_bussines,
                image: `${ENDPOINT}/socio/${buss.sub_bussines || buss.short_bussines}/bussines/photo/${buss.photo_bussines}`,
                type: 'bussines',
                link: linkMap[buss.category_bussines] || '/',
                relevance: buss.relevance
            }))
        ];

        // Ordenar de nuevo por relevancia global
        results.sort((a, b) => b.relevance - a.relevance);

        const totalResults = results.length;

        let message = 'Resultados encontrados';
        let error = '';
        let code = ERROR_CODES.SUCCESS;

        if (totalResults === 0) {
            message = 'No se encontraron resultados';
            error = ERROR_CODES.NO_RESULTS;
            code = error;
        }

        return res.status(200).json({ok: true, message, data: results, length: totalResults, error, code});

    } catch (error) {
        console.error('Error en controllerSearch:', error);
        return res.status(500).json({ok: false, message: `Error interno del servidor: ${error.message}`, data: [], length: 0, error: ERROR_CODES.SERVER_ERROR, code: 500});
    }
}; 