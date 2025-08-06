import { ENDPOINT } from "../config.js";
import { poolPlaces, poolSocio } from "../db/db.js";

const ERROR_CODES = {
    SUCCESS: 'SUCCESS',
    NOT_FOUND: 'NOT_FOUND',
    SERVER_ERROR: 'SERVER_ERROR',
    BAD_REQUEST: 'BAD_REQUEST'
};

export const controllerDetailSlug = async (req, res) => {
    
    const { slug } = req.params;

    if (!slug || slug.trim() === '') return res.status(400).json({ok: false, message: 'El parámetro "slug" es obligatorio', data: null, error: ERROR_CODES.BAD_REQUEST, code: 400});

    try {
        // Buscar primero en places
        const [ places ] = await poolPlaces.query('SELECT * FROM places WHERE sub_place = ? LIMIT 1', [slug]);

        if (places.length > 0) {

            const place = places[0];
            const [ imgs ] = await poolPlaces.query('SELECT * FROM images_places WHERE sub_place = ?', [ place.sub_place ]);

            // Buscar recomendaciones basadas en la misma categoría, excluyendo el actual
            const [ recommendations ] = await poolPlaces.query('SELECT * FROM places WHERE category_place = ? AND sub_place != ? LIMIT 5', [ place.category_place, place.sub_place ]);

            const recommendationsWithImages = await Promise.all(
                recommendations.map(async (item) => {
                    const [imageRows] = await poolPlaces.query('SELECT image_iplaces FROM images_places WHERE sub_place = ? LIMIT 1', [item.sub_place]);
                    return {
                        id: item.id_place,
                        sub: item.sub_place,
                        name: item.name_place,
                        category: item.category_place,
                        locationName: item.locationName_place,
                        image: `${ENDPOINT}/places/${item.sub_place}/image/${imageRows[0]?.image_iplaces}` || '' // si no hay imagen, vacío
                    };
                })
            );
            
            const responsePlace = {
                id: place.id_place,
                sub: place.sub_place,
                name: place.name_place,
                text: place.text_place,
                category: place.category_place,
                locationName: place.locationName_place,
                location: place.location_place,
                services: place.services_place ? JSON.parse(place.services_place) : null,
                schedule: place.schedule_place,
                price: place.price_place,
                access: place.access_place ? JSON.parse(place.access_place) : null,
                recommended_time: place.recommended_time,
                activities: place.activities_place ? JSON.parse(place.activities_place) : null,
                metrics: {
                    liked: place.liked_place,
                    comments: 0,
                    shared: 0
                },
                images: imgs.map(img => ({
                    id: img.id_iplaces,
                    image: `${ENDPOINT}/places/${place.sub_place}/image/${img.image_iplaces}`,
                    created: img.created_iplaces
                })),
                recommend: recommendationsWithImages
            }
            return res.status(200).json({ok: true, message: 'Detalle encontrado en places', data: {...responsePlace, type: 'place'}, error: '', code: ERROR_CODES.SUCCESS});
        }

        // Si no se encuentra, buscar en bussines
        const [ bussines ] = await poolSocio.query('SELECT * FROM bussines WHERE short_bussines = ? OR sub_bussines = ? LIMIT 1', [slug, slug]);

        if (bussines.length > 0) {
            const company = bussines[0];
            const responseCompany = {
                id: company.id_bussines,
                sub: company.sub_bussines,
                short: company.short_bussines,
                phone: company.phone_bussines,
                name: company.name_bussines,
                text: company.text_bussines,
                category: company.category_bussines,
                location: company.direction_bussines,
                photo: company.photo_bussines,
                portada: company.portada_bussines,
            }
            return res.status(200).json({ok: true, message: 'Detalle encontrado en bussines', data: {...responseCompany, type: 'bussines'}, error: '', code: ERROR_CODES.SUCCESS});
        }

        // Si no se encuentra en ninguno
        return res.status(404).json({ok: false, message: `No se encontró ningún resultado para el slug: "${slug}"`, data: null, error: ERROR_CODES.NOT_FOUND, code: 404});

    } catch (error) {
        console.error('Error en controllerDetailSlug:', error);
        return res.status(500).json({ok: false, message: `Error interno del servidor: ${error.message}`, data: null, error: ERROR_CODES.SERVER_ERROR, code: 500});
    }
};