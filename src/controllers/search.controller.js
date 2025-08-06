import { poolPlaces, poolSocio } from "../db/db.js";

const ERROR_CODES = {
    SUCCESS: 'SUCCESS',
    NO_RESULTS: 'NO_RESULTS',
    SERVER_ERROR: 'SERVER_ERROR'
};

export const controllerSearch = async (req, res) => {
    try {
        const query = req.query.q;

        if (!query || query.trim() === '') return res.status(400).json({ ok: false, message: 'El parámetro de búsqueda "q" es obligatorio', data: [], length: 0, error: 'BAD_REQUEST', code: 400 });

        // Buscar en places con relevancia
        const [ places ] = await poolPlaces.query(`SELECT id_place, sub_place, name_place, category_place, MATCH(name_place, text_place, category_place, locationName_place) AGAINST (? IN NATURAL LANGUAGE MODE) AS relevance FROM places WHERE MATCH(name_place, text_place, category_place, locationName_place) AGAINST (? IN NATURAL LANGUAGE MODE) ORDER BY relevance DESC LIMIT 10`, [query, query]);

        // Buscar en bussines con relevancia
        const [ bussines ] = await poolSocio.query(`SELECT id_bussines, name_bussines, text_bussines, short_bussines, sub_bussines, direction_bussines, MATCH(name_bussines, text_bussines, short_bussines, sub_bussines, direction_bussines) AGAINST (? IN NATURAL LANGUAGE MODE) AS relevance FROM bussines WHERE MATCH(name_bussines, text_bussines, short_bussines, sub_bussines, direction_bussines) AGAINST (? IN NATURAL LANGUAGE MODE) ORDER BY relevance DESC LIMIT 10`, [query, query]);

        // Unificar resultados en una sola lista
        const results = [
            ...places.map(place => ({
                id: place.id_place,
                sub: place.sub_place,
                name: place.name_place,
                text: place.category_place,
                image: '',
                type: 'place',
                relevance: place.relevance
            })),
            ...bussines.map(buss => ({
                id: buss.id_bussines,
                sub: buss.short_bussines || buss.sub_bussines,
                name: buss.name_bussines,
                text: buss.direction_bussines,
                image: '',
                type: 'bussines',
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