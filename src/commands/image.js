const fs = require('fs');
const path = require('path');
const { BotMedia } = require('../infrastructure/whatsapp/client');
const { PREFIXES } = require('../config/constants');
const { sendImageWithCaption } = require('../utils/mediaHelper');
const logger = require('../utils/logger');
const registry = require('../cli/serviceRegistry');
const { error, warn, status, build } = require('../config/branding');

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY || API_KEY === 'PEGA-TU-CLAVE-AQUI-BRO') {
    registry.setService('gemini', 'optional', 'no configurada', true);
} else {
    registry.setService('gemini', 'ok');
}
const MODEL = 'gemini-2.0-flash-preview-image-generation';

// BHK-12: los prompts de imagen se limitan (payload y cuota de la API).
const MAX_IMAGE_PROMPT_LENGTH = 500;

let GoogleGenAI;

async function loadSDK() {
    if (GoogleGenAI) return;
    try {
        GoogleGenAI = require('@google/genai').GoogleGenAI;
    } catch (e) {
        try {
            const mod = await import('@google/genai');
            GoogleGenAI = mod.GoogleGenAI;
        } catch (e2) {
            throw new Error(
                'No se pudo cargar @google/genai. Ejecuta: npm install @google/genai'
            );
        }
    }
}

function extractPrompt(message) {
    const body = message.body;
    const prefix = PREFIXES.find(p => body.startsWith(p)) || '.';
    const withoutPrefix = body.slice(prefix.length).trim();
    const parts = withoutPrefix.split(/\s+/);
    const command = parts[0]?.toLowerCase() || '';
    const prompt = parts.slice(1).join(' ').trim();
    return { command, prompt };
}

async function generateImageWithGemini(prompt, attachedImage) {
    await loadSDK();
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const parts = [{ text: prompt }];
    if (attachedImage) {
        parts.push({
            inlineData: {
                mimeType: attachedImage.mimetype,
                data: attachedImage.data
            }
        });
    }

    const response = await ai.models.generateContent({
        model: MODEL,
        contents: [{ role: 'user', parts }],
        config: {
            responseModalities: ['TEXT', 'IMAGE']
        }
    });

    const candidate = response.candidates?.[0];
    if (!candidate?.content?.parts) {
        throw new Error('La API de Gemini no devolvió una respuesta válida.');
    }

    let imageData = null;
    let mimeType = 'image/png';
    let textoRespuesta = '';

    for (const part of candidate.content.parts) {
        if (part.inlineData) {
            imageData = part.inlineData.data;
            mimeType = part.inlineData.mimeType || 'image/png';
        }
        if (part.text) {
            textoRespuesta = part.text;
        }
    }

    if (!imageData) {
        throw new Error('No se pudo generar la imagen. Intenta con otro prompt.');
    }

    return { imageData, mimeType, textoRespuesta };
}

function saveTempImage(imageData, mimeType) {
    const tempDir = path.join(__dirname, '..', '..', 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    const ext = mimeType.split('/')[1] || 'png';
    const nombreArchivo = `gemini_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const rutaArchivo = path.join(tempDir, nombreArchivo);
    const buffer = Buffer.from(imageData, 'base64');
    fs.writeFileSync(rutaArchivo, buffer);

    return rutaArchivo;
}

async function generateImage(client, message) {
    const filesToClean = [];

    try {
        const { prompt } = extractPrompt(message);

        if (!prompt) {
            await sendImageWithCaption(client, message.from, 'img',
                error('Debes escribir una descripción para la imagen.\nEjemplo: .img un gato volador sobre una ciudad cyberpunk')
            );
            return;
        }

        // BHK-12: rechazo temprano antes de gastar cuota de la API.
        if (prompt.length > MAX_IMAGE_PROMPT_LENGTH) {
            await sendImageWithCaption(client, message.from, 'img',
                error(`Tu descripción es demasiado larga (${prompt.length} caracteres; el límite es ${MAX_IMAGE_PROMPT_LENGTH}).\nAcórtala e inténtalo de nuevo.`)
            );
            return;
        }

        await sendImageWithCaption(client, message.from, 'img', status('🎨 Generando imagen... esto puede tomar unos segundos.'));

        const { imageData, mimeType, textoRespuesta } = await generateImageWithGemini(prompt);
        const rutaArchivo = saveTempImage(imageData, mimeType);
        filesToClean.push(rutaArchivo);

        const caption = build(
            [
                { icon: '📝', label: 'Prompt', desc: prompt.length > 80 ? prompt.slice(0, 80) + '...' : prompt },
                ...(textoRespuesta ? [{ icon: '💬', label: 'Gemini', desc: textoRespuesta.slice(0, 200) }] : [])
            ],
            { type: 'image', withSignature: true }
        );

        const media = BotMedia.fromFilePath(rutaArchivo);
        await client.sendMedia(message.from, media, { caption });

    } catch (err) {
        // BHK-02: el parámetro se renombra a `err` para no sombrear la
        // función `error` de branding; si no, el catch mismo se estrellaba.
        logger.error('[IMAGEN]', err.message);
        logger.debug('[IMAGEN] Stack:', err.stack);

        if (err.message && err.message.includes('@google/genai')) {
            await sendImageWithCaption(client, message.from, 'img', error('Falta instalar @google/genai. Ejecuta: npm install @google/genai'));
            return;
        }

        if (err.message && err.message.includes('API key not valid')) {
            await sendImageWithCaption(client, message.from, 'img', error('La clave de API de Gemini no es válida. Verifica tu API key.'));
            return;
        }

        await sendImageWithCaption(client, message.from, 'img',
            warn('Ocurrió un error al generar la imagen.')
        );
    } finally {
        // BHK-06: la limpieza ocurre también si el envío falla.
        for (const file of filesToClean) {
            try { fs.unlinkSync(file); } catch (e) { /* ya no existe */ }
        }
    }
}

async function generateImageAI(client, message) {
    const filesToClean = [];

    try {
        const { prompt } = extractPrompt(message);

        if (!prompt) {
            await sendImageWithCaption(client, message.from, 'img-ia',
                error('Debes escribir una descripción.\nEjemplo: .editar haz esto más colorido (con una imagen adjunta)')
            );
            return;
        }

        // BHK-12: rechazo temprano antes de gastar cuota de la API.
        if (prompt.length > MAX_IMAGE_PROMPT_LENGTH) {
            await sendImageWithCaption(client, message.from, 'img-ia',
                error(`Tu descripción es demasiado larga (${prompt.length} caracteres; el límite es ${MAX_IMAGE_PROMPT_LENGTH}).\nAcórtala e inténtalo de nuevo.`)
            );
            return;
        }

        let attachedImage = null;
        if (message.hasMedia) {
            const media = await message.downloadMedia();
            if (media && media.mimetype && media.mimetype.startsWith('image/')) {
                attachedImage = {
                    mimetype: media.mimetype,
                    data: media.data
                };
            }
        }

        await sendImageWithCaption(client, message.from, 'img-ia', status('🎨 Procesando imagen con IA... esto puede tomar unos segundos.'));

        const { imageData, mimeType, textoRespuesta } = await generateImageWithGemini(prompt, attachedImage);
        const rutaArchivo = saveTempImage(imageData, mimeType);
        filesToClean.push(rutaArchivo);

        const caption = build(
            [
                { icon: '📝', label: 'Prompt', desc: prompt.length > 80 ? prompt.slice(0, 80) + '...' : prompt },
                ...(attachedImage ? [{ icon: '🖼️', label: 'Referencia', desc: 'Imagen adjunta incluida' }] : []),
                ...(textoRespuesta ? [{ icon: '💬', label: 'Gemini', desc: textoRespuesta.slice(0, 200) }] : [])
            ],
            { type: 'image', withSignature: true }
        );

        const media = BotMedia.fromFilePath(rutaArchivo);
        await client.sendMedia(message.from, media, { caption });

    } catch (err) {
        // BHK-02: sin sombreado de la función `error` de branding.
        logger.error('[IMAGEN-IA]', err.message);
        logger.debug('[IMAGEN-IA] Stack:', err.stack);

        if (err.message && err.message.includes('@google/genai')) {
            await sendImageWithCaption(client, message.from, 'img-ia', error('Falta instalar @google/genai. Ejecuta: npm install @google/genai'));
            return;
        }

        if (err.message && err.message.includes('API key not valid')) {
            await sendImageWithCaption(client, message.from, 'img-ia', error('La clave de API de Gemini no es válida. Verifica tu API key.'));
            return;
        }

        await sendImageWithCaption(client, message.from, 'img-ia',
            warn('Ocurrió un error al procesar la imagen.')
        );
    } finally {
        // BHK-06: la limpieza ocurre también si el envío falla.
        for (const file of filesToClean) {
            try { fs.unlinkSync(file); } catch (e) { /* ya no existe */ }
        }
    }
}

module.exports = { generateImage, generateImageAI };

