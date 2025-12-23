import path from "path";
import fs from "fs-extra";
import { ERROR_CODES } from "#src/helpers/errores.js";

const PLACES_IMAGES_DIR = path.join(process.cwd(), "places/images");

export const getImages = async (req, res) => {
    
    try {
        const { slug, image } = req.params;
        if (!slug || !image) {
            return res.status(400).json({
                ok: false,
                message: "Faltan parámetros",
                error: ERROR_CODES.BAD_REQUEST,
                code: 400
            });
        }

        const imagePath = path.join(PLACES_IMAGES_DIR, slug, image);

        const exists = await fs.pathExists(imagePath);
        if (!exists) {
            return res.status(404).json({
                ok: false,
                message: `Imagen no encontrada en ${imagePath}`,
                error: ERROR_CODES.NOT_FOUND,
                code: 404
            });
        }

        res.setHeader("Cache-Control", "public, max-age=86400");
        return res.sendFile(imagePath);
    
    } catch (error) {
        return res.status(500).json({
            ok: false,
            message: `Error al obtener la imagen: ${error.message}`,
            error: ERROR_CODES.SERVER_ERROR,
            code: 500
        });
    }
};