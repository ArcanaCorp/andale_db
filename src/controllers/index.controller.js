export const controllerIndex = async (req, res) => {
    try {
        return res.status(200).json({ok: true, message: 'Éxito', error: '', code: 200})
    } catch (error) {
        return res.status(500).json({ok: false, message: `Error: ${error.message}`, error: error, code: 500})
    }
}