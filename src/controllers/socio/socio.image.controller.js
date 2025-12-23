import path from "path";
import fs from "fs-extra";
import { poolSocio } from "#src/db/db.js";
import { ERROR_CODES } from "#src/helpers/errores.js"

const BUSSINES_IMAGES_DIR = path.join(process.cwd(), "bussines");

export const uploadProductImage = async (req, res) => {}
export const getProductImage = async (req, res) => {}
export const uploadBussinesImage = async (req, res) => {}

export const getBussinesImage = async (req, res) => {
    try {
        
        const { sub, imageName } = req.params;
        if (!sub || !imageName) {
            return res.status(400).json({
                ok: false,
                message: "Faltan parámetros",
                error: ERROR_CODES.BAD_REQUEST,
                code: 400
            });
        }
        
        const imagePath = path.join(BUSSINES_IMAGES_DIR, sub, imageName);

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
            message: `Error: ${error.message}`,
            error: ERROR_CODES.SERVER_ERROR,
            code: 500,
        });
    }
}