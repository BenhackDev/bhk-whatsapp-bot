const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { BotMedia } = require('../infrastructure/whatsapp/client');
const { sendImageWithCaption } = require('../utils/mediaHelper');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = 'EkK5I93UQWFDigLMpZcX';

function convertToOpus(inputPath, outputPath) {
    execSync(
        `ffmpeg -y -loglevel error -i "${inputPath}" -c:a libopus -b:a 64k -vbr on -application voip "${outputPath}"`,
        { shell: true, timeout: 30000 }
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
                console.log('[VOZ] ElevenLabs sin crédito, usando Google TTS gratuito...');
            } else {
                throw err;
            }
        }
    }
    return await generateGoogleTTS(texto);
}

async function processVoiceCommand(client, message) {
    try {
        const parsed = require('../utils/commandParser').parseCommand(message.body);
        const texto = parsed ? parsed.args : '';

        if (!texto) {
            await sendImageWithCaption(client, message.from, 'voz', '❌ Escribe el texto después del comando. Ej: .voz Hola mundo');
            return;
        }

        await message.reply('🎙️ Generando audio...');

        const audioBuffer = await generateAudio(texto);
        const tempDir = path.join(__dirname, '..', '..', 'temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const mp3Path = path.join(tempDir, `voz_${Date.now()}.mp3`);
        const oggPath = mp3Path.replace('.mp3', '.ogg');
        fs.writeFileSync(mp3Path, audioBuffer);

        convertToOpus(mp3Path, oggPath);

        const oggBuffer = fs.readFileSync(oggPath);
        const media = BotMedia.fromBuffer(oggBuffer, 'audio/ogg; codecs=opus', `voz_${Date.now()}.ogg`);
        await client.sendMedia(message.from, media, { asVoice: true });

        fs.unlinkSync(mp3Path);
        fs.unlinkSync(oggPath);
    } catch (error) {
        console.error('[ERROR VOZ]', error);
        await sendImageWithCaption(client, message.from, 'voz', '⚠️ Error al generar el audio. Intenta de nuevo.');
    }
}

module.exports = { processVoiceCommand };
