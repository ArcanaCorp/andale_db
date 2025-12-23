// src/services/serviceNotifyOrder.js
import fetch from 'node-fetch';
import { API_FACTILIZA_WHATSAPP, INSTANCIA_FACTILIZA } from '../config.js';

export const serviceNotifyOrder = async (phone, message) => {
    if (!phone || !message) return { ok: false, message: 'Faltan datos' };

    try {
        const response = await fetch(`https://apiwsp.factiliza.com/v1/message/sendtext/${INSTANCIA_FACTILIZA}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${API_FACTILIZA_WHATSAPP}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                number: `51${phone}`,
                text: message,
            }),
        });

        const data = await response.json();
        if (!response.ok) return { ok: false, message: data.message || 'No se pudo enviar el mensaje' };
            return { ok: data.succes, message: data.message };
            
    } catch (error) {
        return { ok: false, message: 'No se pudo enviar el mensaje', error };
    }
};