import { poolPlaces, poolSocio } from "../db/db.js";
import { ENDPOINT } from "../config.js";

const ERROR_CODES = {
    NOT_FOUND_PLACES: 'NOT_FOUND_PLACES',
    NOT_FOUND_FOODIES: 'NOT_FOUND_FOODIES',
    NOT_FOUND_HOTELS: 'NOT_FOUND_HOTELS',
    SUCCESS: 'SUCCESS',
    SERVER_ERROR: 'SERVER_ERROR'
};

export const controllerRecommendation = async (req, res) => {
    try {

        const [ places ] = await poolPlaces.query('SELECT p.*, ip.image_iplaces FROM places p LEFT JOIN images_places ip ON p.sub_place = ip.sub_place ORDER BY RAND() LIMIT 5');
        const [ foodies ] = await poolSocio.query('SELECT * FROM bussines WHERE category_bussines = ? ORDER BY RAND() LIMIT 5', ['restaurant']);
        const [ hotels ] = await poolSocio.query('SELECT * FROM bussines WHERE category_bussines = ? ORDER BY RAND() LIMIT 5', ['hotel']);

        const placesPersonalize = places.map((p) => ({
            id: p.id_place,
            sub: p.sub_place,
            name: p.name_place,
            text: p.locationName_place,
            image: `${ENDPOINT}/places/${p.sub_place}/image/${p.image_iplaces}`
        }))

        const foodiesPersonalize = foodies.map((f) => ({
            id: f.id_bussines,
            sub: f.short_bussines || f.sub_bussines,
            name: f.name_bussines,
            text: f.direction_bussines,
            image: f.portada_bussines || ''
        }))

        const hotelsPersonalize = hotels.map((h) => ({
            id: h.id_bussines,
            sub: h.short_bussines || h.sub_bussines,
            name: h.name_bussines,
            text: h.direction_bussines,
            image: h.portada_bussines || ''
        }))

        const recommend = [
            {
                title: 'Los mejores lugares por conocer',
                items: placesPersonalize || []
            },
            {
                title: 'Lo mejor de nuestro sabor',
                items: foodiesPersonalize || []
            },
            {
                title: 'Descansa en el paraíso',
                items: hotelsPersonalize || []
            },
            {
                title: 'Llévate los mejor de Jauja',
                items: []
            }
        ];

        // Determinar qué listas están vacías
        const emptySections = [];
        if (places.length === 0) emptySections.push({ name: 'lugares', code: ERROR_CODES.NOT_FOUND_PLACES });
        if (foodies.length === 0) emptySections.push({ name: 'restaurantes', code: ERROR_CODES.NOT_FOUND_FOODIES });
        if (hotels.length === 0) emptySections.push({ name: 'hoteles', code: ERROR_CODES.NOT_FOUND_FOODIES });

        let message, error, code;

        if (emptySections.length === 0) {
            message = 'Recomendaciones listadas';
            error = '';
            code = ERROR_CODES.SUCCESS;
        } else {
            message = 'No se encontraron ' + emptySections.map(s => s.name).join(' ni ');
            error = emptySections.map(s => s.code).join(', ');
            code = error;
        }

        return res.status(200).json({ok: true, message, data: recommend, length: {places: places.length, foodies: foodies.length, hotels: hotels.length}, error, code});

    } catch (error) {
        console.error('Error en controllerRecommendation:', error);
        return res.status(500).json({ok: false, message: `Error interno del servidor: ${error.message}`, data: [], length: 0, error: ERROR_CODES.SERVER_ERROR, code: 500});
    }
};
