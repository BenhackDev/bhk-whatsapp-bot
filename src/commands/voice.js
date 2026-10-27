const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');
const execFileAsync = promisify(execFile);
const { BotMedia } = require('../infrastructure/whatsapp/client');
const { sendImageWithCaption } = require('../utils/mediaHelper');
const logger = require('../utils/logger');
const registry = require('../cli/serviceRegistry');
const { error, status } = require('../config/branding');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = 'EkK5I93UQWFDigLMpZcX';

if (ELEVENLABS_API_KEY) {
    registry.setService('elevenlabs', 'ok');
} else {
    registry.setService('elevenlabs', 'optional', 'opcional', true);
}
registry.setService('google_tts', 'ok');

async function convertToOpus(inputPath, outputPath) {
    // BHK-05: execFile con argumentos separados y sin shell. No bloquea el
    // event loop (el bot sigue procesando mensajes durante la conversión).
    await execFileAsync(
        'ffmpeg',
        [
            '-y', '-loglevel', 'error', '-i', inputPath,
            '-c:a', 'libopus', '-b:a', '64k',
            '-vbr', 'on', '-application', 'voip',
            outputPath
        ],
        { timeout: 30000, maxBuffer: 4 * 1024 * 1024 }
    );
}

async function generateGoogleTTS(texto) {
    const lang = 'es';
    const encoded = encodeURIComponent(texto);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${lang}&client=tw-ob`;

    const res = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    });

    return Buffer.from(res.data);
}

async function generateAudio(texto) {
    if (ELEVENLABS_API_KEY) {
        try {
            const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;
            const response = await axios.post(url, {
                text: texto,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5
                }
            }, {
                headers: {
                    'Accept': 'audio/mpeg',
                    'xi-api-key': ELEVENLABS_API_KEY,
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer',
                timeout: 30000
            });
            return Buffer.from(response.data);
        } catch (err) {
            if (err.response && (err.response.status === 402 || err.response.status === 401)) {
                logger.debug('[VOZ] ElevenLabs sin crédito, usando Google TTS gratuito...');
            } else {
                throw err;
            }
        }
    }
    return await generateGoogleTTS(texto);
}

// BHK-12: Google TTS gratuito rechaza textos largos y ElevenLabs cobra por
// caracteres; se limita el texto para no catalogar errores ni gastar cuota.
const MAX_VOZ_TEXT_LENGTH = 500;

async function processVoiceCommand(client, message) {
    let mp3Path = null;
    let oggPath = null;

    try {
        const parsed = require('../utils/commandParser').parseCommand(message.body);
        const texto = parsed ? parsed.args : '';

        if (!texto) {
            await sendImageWithCaption(client, message.from, 'voz', error('Escribe el texto después del comando.\nEjemplo: .voz Hola mundo'));
            return;
        }

        // BHK-12: rechazo temprano antes de consumir la TTS.
        if (texto.length > MAX_VOZ_TEXT_LENGTH) {
            await sendImageWithCaption(client, message.from, 'voz',
                error(`Tu texto es demasiado largo (${texto.length} caracteres; el límite es ${MAX_VOZ_TEXT_LENGTH}).\nDivide el texto en partes más cortas.`));
            return;
        }

        await message.reply(status('🎙️ Generando audio...'));

        const audioBuffer = await generateAudio(texto);
        const tempDir = path.join(__dirname, '..', '..', 'temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        mp3Path = path.join(tempDir, `voz_${Date.now()}.mp3`);
        oggPath = mp3Path.replace('.mp3', '.ogg');
        fs.writeFileSync(mp3Path, audioBuffer);

        await convertToOpus(mp3Path, oggPath);

        const oggBuffer = fs.readFileSync(oggPath);
        const media = BotMedia.fromBuffer(oggBuffer, 'audio/ogg; codecs=opus', `voz_${Date.now()}.ogg`);
        await client.sendMedia(message.from, media, { asVoice: true });
    } catch (err) {
        // Sin sombreado de la función `error` de branding (patrón BHK-02).
        logger.error('[VOZ]', err.message);
        logger.debug('[VOZ] Stack:', err.stack);
        await sendImageWithCaption(client, message.from, 'voz', error('Error al generar el audio. Intenta de nuevo.'));
    } finally {
        // BHK-06: los temporales se limpian también si el envío o ffmpeg fallan.
        for (const file of [mp3Path, oggPath]) {
            if (file && fs.existsSync(file)) {
                try { fs.unlinkSync(file); } catch (e) { /* ya no existe */ }
            }
        }
    }
}

module.exports = { processVoiceCommand };
