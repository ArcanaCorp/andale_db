import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';
import { poolPlaces } from '#src/db/db.js';
import { ERROR_CODES } from "#src/helpers/errores.js";

const PLACES_DIR = path.resolve('./places/images');

function generateRandomName(length = 11) {
    return Math.floor(Math.random() * Math.pow(10, length))
        .toString()
        .padStart(length, '0');
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

        return res.json({ ok: true, message: `Migración completada.`, data: { total: images.length, migradas: migrated }, error: null, code: 200});
    } catch (error) {
        console.error('❌ Error en getMigrateImages:', error);
        return res.status(500).json({ ok: false, message: `Error interno del servidor: ${error.message}`, data: null, error: ERROR_CODES.SERVER_ERROR, code: 500});
    }
};