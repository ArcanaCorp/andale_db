import { poolSocio } from "#src/db/db.js";
import { ERROR_CODES } from "#src/helpers/errores.js"
import { normalizeBussines } from "#src/helpers/normalizers.js"
import { ENDPOINT } from '#src/config.js'

export const getBussinesBySub = async (req, res) => {
    try {
        
        const { sub } = req.params;

        if (!sub) {
            return res.status(400).json({
                ok: false,
                message: "Falta el parámetro 'sub'",
                error: ERROR_CODES.BAD_REQUEST,
                code: 400,
            });
        }

        // Buscar el negocio por sub_bussines o short_bussines
        const [rows] = await poolSocio.query(`SELECT * FROM bussines WHERE sub_bussines = ? OR short_bussines = ? LIMIT 1`, [sub, sub]);

        if (!rows.length) {
            return res.status(404).json({
                ok: false,
                message: "No se encontró ningún negocio asociado a este socio",
                error: ERROR_CODES.NOT_FOUND,
                code: 404,
            });
        }

        // Normalización simple para la respuesta
        const bussines = rows[0];
        const normalized = normalizeBussines(bussines);
        
        const [categories] = await poolSocio.query(`SELECT * FROM bussines_category WHERE sub_bussines = ?`, [normalized.id_sub]);
        
        const normalizeCategories = (rows = []) => {
            return rows.map(ctg => ({
                id: ctg.id_bcategory,
                name: ctg.name_bcategory,
                created: ctg.created_bcategory
            }));
        };

        // 🔹 Aplicación
        const categoriesList = normalizeCategories(categories);

        // 🔹 Configuración por tipo de negocio
        const queries = {
            agency: {
                table: "packs",
                fields: row => ({
                    id: row.id_pack,
                    name: row.name_pack,
                    text: row.text_pack,
                    category: row.category_pack,
                    price: Number(row.price_pack),
                    image: row.image_pack,
                    created: row.created_product,
                    update: row.update_product
                })
            },
            restaurant: {
                table: "dishes",
                fields: row => ({
                    id: row.id_dish,
                    name: row.name_dish,
                    description: row.text_dish,
                    category: row.category_dish,
                    price: Number(row.price_dish),
                    image: row.image_dish,
                    created: row.created_dish,
                    update: row.update_dish
                })
            },
            ecommerce: {
                table: "products",
                fields: row => ({
                    id: row.id_product,
                    name: row.name_product,
                    description: row.text_product,
                    category: row.category_product,
                    price: Number(row.price_product),
                    image: row.image_product,
                    stock: row.stock_product,
                    created: row.created_product,
                    update: row.update_product
                })
            },
            hotel: {
                table: "bedrooms",
                fields: row => ({
                    id: row.id_bedroom,
                    name: row.name_bedroom,
                    description: row.text_bedroom,
                    category: row.category_bedroom,
                    price: Number(row.price_bedroom),
                    image: row.image_bedroom,
                    capacity: row.capacity_bedroom,
                    created: row.created_bedroom,
                    update: row.update_bedroom
                })
            }
        };

        const config = queries[normalized.category];
        let resultData = {};

        // 🔹 Si la categoría tiene tabla asociada, ejecutar consulta
        if (config) {
            const [rows] = await poolSocio.query(`SELECT * FROM ${config.table} WHERE sub_bussines = ?`, [normalized.id_sub]);

            const normalizedData = rows.map(config.fields);

            // Agregar con el nombre correcto (packs, dishes, products o bedrooms)
            resultData[config.table] = normalizedData;
        }

        return res.status(200).json({
            ok: true,
            data: {
                ...normalized,
                categories: categoriesList,
                ...resultData,
            },
            message: "Negocio encontrado correctamente",
            error: "",
            code: 200,
        });
    
    } catch (error) {
        return res.status(500).json({
            ok: false,
            message: `Error: ${error.message}`,
            error: ERROR_CODES.SERVER_ERROR,
            code: 500,
        });
    }
}

export const getBussinesByCategory = async (req, res) => {
    
    try {
        
        const { category } = req.params;

        if (!category) {
            return res.status(400).json({
                ok: false,
                message: "Falta el parámetro 'category'",
                error: ERROR_CODES.BAD_REQUEST,
                code: 400,
            });
        }

        // Buscar negocios por categoría
        const [rows] = await poolSocio.query(`SELECT * FROM bussines WHERE category_bussines = ? ORDER BY created_bussines DESC`, [category]);

        if (!rows.length) {
            return res.status(200).json({
                ok: true,
                data: [],
                message: "No se encontraron negocios en esta categoría",
                error: "",
                code: 200,
            });
        }

        const normalized = rows.map(normalizeBussines);

        return res.status(200).json({
            ok: true,
            data: normalized,
            message: `Negocios de la categoría "${category}" listados correctamente`,
            error: "",
            code: 200,
            total: normalized.length,
        });
        
    } catch (error) {
        return res.status(500).json({
            ok: false,
            message: `Error: ${error.message}`,
            error: ERROR_CODES.SERVER_ERROR,
            code: 500,
        });
    }
}

export const createBussines = async (req, res) => {}

export const updateBussines = async (req, res) => {}

export const deleteBussines = async (req, res) => {}