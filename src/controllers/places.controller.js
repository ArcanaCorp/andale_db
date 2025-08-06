import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';
import { poolPlaces } from "../db/db.js";

const ERROR_CODES = {
    SUCCESS: 'SUCCESS',
    NOT_FOUND: 'NOT_FOUND',
    SERVER_ERROR: 'SERVER_ERROR',
    BAD_REQUEST: 'BAD_REQUEST'
};

const GOOGLE_API_KEY = 'AIzaSyAUfHQAHDTtaJsMG0POlX0MO4gxdqU_b9c'

const PLACES_DIR = path.resolve('./places/images');

function generateRandomName(length = 11) {
    return Math.floor(Math.random() * Math.pow(10, length)).toString().padStart(length, '0');
}

export const getMigrateImages = async (req, res) => {
    try {

        console.log('INICIANDO...');
        

        const sql = 'SELECT * FROM images_places';
        const [images] = await poolPlaces.query(sql);

        let migrated = 0;

        for (const row of images) {
            
            const { id_iplaces, sub_place, image_iplaces } = row;

            if (!image_iplaces || !sub_place) {
                console.warn(`⚠️ Fila inválida ID ${id_iplaces}, saltando...`);
                continue;
            }

            const folderPath = path.join(PLACES_DIR, sub_place);
            await fs.ensureDir(folderPath);

            try {

                const response = await fetch(image_iplaces);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                    const buffer = Buffer.from(await response.arrayBuffer());

                    const newFileName = `${generateRandomName()}.webp`;
                    const filePath = path.join(folderPath, newFileName);

                    const webpBuffer = await sharp(buffer)
                    .resize({ width: 800 })
                    .webp({ quality: 75 })
                    .toBuffer();

                    await fs.writeFile(filePath, webpBuffer);

                    await poolPlaces.query('UPDATE images_places SET image_iplaces = ? WHERE id_iplaces = ?', [newFileName, id_iplaces]);

                    console.log(`✔️ ID ${id_iplaces} migrado como ${newFileName}`);
                    migrated++;

            } catch (err) {
                console.warn(`⚠️ Error al procesar ID ${id_iplaces}: ${err.message}`);
            }

        }

        return res.json({ok: true, message: `Migración completada.`, data: { total: images.length, migradas: migrated }, error: null, code: 200});

    } catch (error) {
        console.error('❌ Error en getMigrateImages:', error);
        return res.status(500).json({ok: false, message: `Error interno del servidor: ${error.message}`, data: null, error: ERROR_CODES.SERVER_ERROR, code: 500});
    }
};

export const updateCorsPlaces = async (req, res) => {
    try {
        const sqlPlaces = 'SELECT * FROM places';
        const [places] = await poolPlaces.query(sqlPlaces);

        let updatedCoors = 0;

        for (const row of places) {
            const { id_place, name_place, category_place, locationName_place } = row;

            try {
                const location =
                    category_place === 'FOLCLORE'
                        ? `${locationName_place}`
                        : `${name_place} - ${locationName_place}`;

                // Construir URL manualmente
                const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
                url.searchParams.append('address', location);
                url.searchParams.append('key', GOOGLE_API_KEY);

                // Fetch + parse JSON correctamente
                const response = await fetch(url);
                const json = await response.json(); // AQUÍ está el cuerpo
                const results = json.results;

                if (!results || results.length === 0) {
                    console.warn(`⚠️ No se encontraron coordenadas para ID ${id_place}`);
                    continue;
                }

                const { lat, lng } = results[0].geometry.location;

                const sql = 'UPDATE places SET location_place = POINT(?, ?) WHERE id_place = ?';
                await poolPlaces.query(sql, [lng, lat, id_place]);

                console.log(`✔️ ID ${id_place} actualizó sus coords`);
                updatedCoors++;

            } catch (error) {
                console.warn(`⚠️ Error al procesar ID ${id_place}: ${error.message}`);
                continue;
            }
        }

        res.status(200).json({
            ok: true,
            total: places.length,
            actualizadas: updatedCoors,
            message: 'Coordenadas actualizadas correctamente'
        });

    } catch (error) {
        console.error('❌ Error en updateCorsPlaces:', error);
        return res.status(500).json({
            ok: false,
            message: `Error interno del servidor: ${error.message}`,
            data: null
        });
    }
};

export const getImagePlaces = async (req, res) => {
    try {
        
        const { slug, image } = req.params;

        const imagePath = path.resolve(`./places/images/${slug}/${image}`);

        // Verifica que la imagen exista
        if (!fs.existsSync(imagePath)) return res.status(404).json({ok: false, message: `Imagen no encontrada: ${slug}/${image}`, data: null, error: ERROR_CODES.NOT_FOUND, code: 404});

            // Setea headers correctos
            res.setHeader('Content-Type', 'image/webp');
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // cache por 1 año

            const stream = fs.createReadStream(imagePath);
            stream.pipe(res);

    } catch (error) {
        console.error('❌ Error en getMigrateImages:', error);
        return res.status(500).json({ok: false, message: `Error interno del servidor: ${error.message}`, data: null, error: ERROR_CODES.SERVER_ERROR, code: 500});
    }
}