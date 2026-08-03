const axios = require('axios');
require('dotenv/config');
const { sendImageWithCaption } = require('../utils/mediaHelper');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY || GEMINI_API_KEY === 'PEGA-TU-CLAVE-AQUI-BRO') {
    console.warn('[AI] ⚠️ GEMINI_API_KEY no configurada en .env. El comando .ia no funcionará.');
}

async function handleAICommand(message, client) {
    try {
        const prompt = message.body.replace(/^[.#\/$!%]/, '').trim().slice(2);

        if (!prompt) {
            await message.reply('❌ Por favor escribe una pregunta después del comando. Ej: .ia ¿Qué es Node.js?');
            return;
        }

        const respuesta = await getGeminiResponse(prompt);
        await sendImageWithCaption(client, message.from, 'ia', respuesta);
    } catch (error) {
        console.error('[ERROR IA] No se pudo obtener respuesta:', error);
        await message.reply('⚠️ Lo siento, hubo un problema al procesar tu solicitud. Intenta más tarde.');
    }
}

async function getGeminiResponse(texto) {
    const MAX_RETRIES = 2;
    const model = 'gemini-2.0-flash';

    for (let intento = 1; intento <= MAX_RETRIES; intento++) {
        try {
            const respuesta = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
                {
                    contents: [{
                        parts: [{ text: texto }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1000,
                        topP: 0.8,
                        topK: 40
                    }
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );

            const contenido = respuesta.data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!contenido) {
                console.log('[DEBUG] Respuesta completa de Gemini:', JSON.stringify(respuesta.data, null, 2));
                return '🤖 No se pudo generar una respuesta adecuada.';
            }

            return contenido;
        } catch (error) {
            if (error.response && error.response.status === 429) {
                const msg = error.response.data?.error?.message || '';
                const match = msg.match(/retry in (\d+(?:\.\d+)?)s/);
                const espera = match ? Math.min(parseInt(match[1]) + 1, 30) : 20;

                if (intento < MAX_RETRIES) {
                    console.log(`[AI] Cuota excedida, reintentando en ${espera}s (intento ${intento}/${MAX_RETRIES})...`);
                    await new Promise(r => setTimeout(r, espera * 1000));
                    continue;
                }
                return '❌ Límite de la cuota gratuita de Gemini excedido. Espera un momento o genera una nueva API key en https://aistudio.google.com/apikey';
            }
            throw error;
        }
    }
}

module.exports = { handleAICommand };
