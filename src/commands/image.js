const fs = require('fs');
const path = require('path');
const { BotMedia } = require('../infrastructure/whatsapp/client');
const { PREFIXES } = require('../config/constants');
const { sendImageWithCaption } = require('../utils/mediaHelper');
const { error, warn, status, build } = require('../config/branding');

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY || API_KEY === 'PEGA-TU-CLAVE-AQUI-BRO') {
    console.warn('[AI] ⚠️ GEMINI_API_KEY no configurada en .env. Los comandos .img y .img-ia no funcionarán.');
}
const MODEL = 'gemini-2.0-flash-preview-image-generation';

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

function extractPrompt(message, command) {
    const body = message.body;
    const prefix = PREFIXES.find(p => body.startsWith(p)) || '.';
    const withoutPrefix = body.slice(prefix.length).trim();
    const prompt = withoutPrefix.slice(command.length).trim();
    return prompt;
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
    try {
        const prompt = extractPrompt(message, 'img');

        if (!prompt) {
            await sendImageWithCaption(client, message.from, 'img',
                error('Debes escribir una descripción para la imagen.\nEjemplo: .img un gato volador sobre una ciudad cyberpunk')
            );
            return;
        }

        await sendImageWithCaption(client, message.from, 'img', status('🎨 Generando imagen... esto puede tomar unos segundos.'));

        const { imageData, mimeType, textoRespuesta } = await generateImageWithGemini(prompt);
        const rutaArchivo = saveTempImage(imageData, mimeType);

        const caption = build(
            [
                { icon: '📝', label: 'Prompt', desc: prompt.length > 80 ? prompt.slice(0, 80) + '...' : prompt },
                ...(textoRespuesta ? [{ icon: '💬', label: 'Gemini', desc: textoRespuesta.slice(0, 200) }] : [])
            ],
            { type: 'image', withSignature: true }
        );

        const media = BotMedia.fromFilePath(rutaArchivo);
        await client.sendMedia(message.from, media, { caption });

        fs.unlinkSync(rutaArchivo);

    } catch (error) {
        console.error('[ERROR IMAGEN]', error);

        if (error.message && error.message.includes('@google/genai')) {
            await sendImageWithCaption(client, message.from, 'img', error('Falta instalar @google/genai. Ejecuta: npm install @google/genai'));
            return;
        }

        if (error.message && error.message.includes('API key not valid')) {
            await sendImageWithCaption(client, message.from, 'img', error('La clave de API de Gemini no es válida. Verifica tu API key.'));
            return;
        }

        await sendImageWithCaption(client, message.from, 'img',
            warn('Ocurrió un error al generar la imagen.')
        );
    }
}

async function generateImageAI(client, message) {
    try {
        const prompt = extractPrompt(message, 'img-ia');

        if (!prompt) {
            await sendImageWithCaption(client, message.from, 'img-ia',
                error('Debes escribir una descripción.\nEjemplo: .img-ia haz esto más colorido (con una imagen adjunta)')
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

        fs.unlinkSync(rutaArchivo);

    } catch (error) {
        console.error('[ERROR IMAGEN-IA]', error);

        if (error.message && error.message.includes('@google/genai')) {
            await sendImageWithCaption(client, message.from, 'img-ia', error('Falta instalar @google/genai. Ejecuta: npm install @google/genai'));
            return;
        }

        await sendImageWithCaption(client, message.from, 'img-ia',
            warn('Ocurrió un error al procesar la imagen.')
        );
    }
}

module.exports = { generateImage, generateImageAI };
