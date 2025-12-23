import { io } from '#src/index.js' 

export const sendGlobalNotification = (req, res) => {
    
    const { titulo, descripcion, link, info } = req.body;

    const payload = {
        titulo,
        descripcion,
        link,
        info,
        fecha: new Date()
    };

    io.emit("global:notification", payload);

    return res.json({ success: true, message: "Enviado a todos", payload });
};