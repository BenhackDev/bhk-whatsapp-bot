const axios = require('axios');
const { execFile } = require('child_process');
const util = require('util');
const fs = require('fs');
const path = require('path');
const { sendTikTokVideo } = require('./sendTikTokVideo');
const { sendImageWithCaption } = require('../utils/mediaHelper');
const logger = require('../utils/logger');
const { error, warn, status } = require('../config/branding');
const { PREFIXES } = require('../config/constants');

const execFileAsync = util.promisify(execFile);

const YTDLP_PATHS = [
    'yt-dlp',
    'yt-dlp.exe',
    path.join(process.env.USERPROFILE || '', 'AppData', 'Roaming', 'Python', 'Python312', 'Scripts', 'yt-dlp.exe'),
    path.join(process.env.USERPROFILE || '', 'AppData', 'Roaming', 'Python', 'Python313', 'Scripts', 'yt-dlp.exe'),
    path.join(process.env.USERPROFILE || '', 'AppData', 'Roaming', 'Python', 'Python311', 'Scripts', 'yt-dlp.exe'),
    'C:\\ProgramData\\chocolatey\\bin\\yt-dlp.exe',
    '/data/data/com.termux/files/usr/bin/yt-dlp',
    path.join(process.env.HOME || '', '.local', 'bin', 'yt-dlp')
];

function findYtDlp() {
    for (const p of YTDLP_PATHS) {
        try {
            const result = require('child_process').execFileSync(p, ['--version'], { timeout: 5000, stdio: 'pipe' });
            const version = result.toString().trim();
            logger.info('[TIKTOK] yt-dlp encontrado en:', p, '- Versión:', version);
            return p;
        } catch (e) { }
    }
    return null;
}

// Caracteres que permitirían alterar un comando de shell o una URL.
const URL_FORBIDDEN_CHARS = /[\s"'`;$&|<>\\*]/;

function isAllowedTikTokHostname(hostname) {
    const host = String(hostname || '').toLowerCase().replace(/\.+$/, '');
    return host === 'tiktok.com' || host.endsWith('.tiktok.com');
}

/**
 * BHK-01: valida de forma estricta una URL de TikTok y devuelve la URL
 * normalizada, o null si no es segura. Solo acepta http(s) con host
 * *.tiktok.com, sin credenciales en la URL ni caracteres que puedan
 * alterar un comando de shell.
 */
function validateTikTokUrl(raw) {
    const candidate = String(raw || '').trim();
    if (!candidate || !/^https?:\/\//i.test(candidate)) return null;
    if (URL_FORBIDDEN_CHARS.test(candidate)) return null;

    try {
        const u = new URL(candidate);
        if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
        if (u.username || u.password) return null;
        if (!isAllowedTikTokHostname(u.hostname)) return null;
        return u.toString();
    } catch (e) {
        return null;
    }
}

function extractUrl(message) {
    const body = message.body || '';
    const prefix = PREFIXES.find(p => body.startsWith(p)) || '.';
    const withoutPrefix = body.slice(prefix.length).trim();
    let candidate;

    if (withoutPrefix.toLowerCase().startsWith('tiktok ')) {
        candidate = withoutPrefix.slice(7).trim();
    } else if (withoutPrefix.toLowerCase().startsWith('tk ')) {
        candidate = withoutPrefix.slice(3).trim();
    } else {
        const regex = /https?:\/\/(?:www\.|vm\.|m\.|[a-z]+\.)?tiktok\.com\/?\S*/i;
        const match = body.match(regex);
        candidate = match ? match[0] : '';
    }

    return validateTikTokUrl(candidate);
}

// ===== BHK-03: destinos de descarga permitidos =====

//hosts de los que es razonable descargar media de TikTok.
const ALLOWED_MEDIA_DOMAINS = [
    'tiktok.com',
    'tiktokcdn.com',
    'tiktokcdn-us.com',
    'tiktokcdn-eu.com',
    'tiktokv.com',
    'tiktokv.us',
    'tikwm.com',
    'tikdown.org'
];

/** true si la URL es http(s), sin credenciales y de un host permitido. */
function isAllowedDownloadUrl(raw) {
    let u;
    try {
        u = new URL(String(raw || ''));
    } catch (e) {
        return false;
    }
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
    if (u.username || u.password) return false;
    const host = u.hostname.toLowerCase().replace(/\.+$/, '');
    return ALLOWED_MEDIA_DOMAINS.some(d => host === d || host.endsWith('.' + d));
}

const MAX_VIDEO_DOWNLOAD_BYTES = 64 * 1024 * 1024;

/**
 * BHK-03: guarda un stream en filePath abortando la descarga si se supera
 * maxBytes, antes de que pueda llenar el disco.
 */
async function saveStreamWithLimit(stream, filePath, maxBytes) {
    return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(filePath);
        let received = 0;
        let settled = false;

        const fail = (err) => {
            if (settled) return;
            settled = true;
            try { stream.destroy && stream.destroy(); } catch (e) {}
            writer.destroy();
            reject(err);
        };

        stream.on('data', (chunk) => {
            received += chunk.length;
            if (received > maxBytes) {
                fail(new Error(
                    `La descarga supera el límite de ${Math.round(maxBytes / (1024 * 1024))} MB`
                ));
            }
        });
        stream.on('error', (err) => fail(err));
        writer.on('error', (err) => fail(err));

        stream.pipe(writer);
        writer.on('finish', () => {
            if (!settled) {
                settled = true;
                resolve();
            }
        });
    });
}

async function tryApiDownload(url) {
    const apis = [
        { name: 'TikWM', url: `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}` },
        { name: 'TikDown', url: `https://api.tikdown.org/api/download?url=${encodeURIComponent(url)}` }
    ];

    for (const api of apis) {
        try {
            logger.info(`[TIKTOK] Intentando API ${api.name}...`);
            const response = await axios.get(api.url, { 
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json'
                }
            });
            
            let videoUrl = null;
            let title = 'Video de TikTok';
            let author = 'Desconocido';

            if (api.name === 'TikWM' && response.data.code === 0) {
                videoUrl = response.data.data?.play;
                title = response.data.data?.title || title;
                author = response.data.data?.author?.nickname || author;
            } else if (api.name === 'TikDown' && response.data.status === true) {
                videoUrl = response.data.result?.video || response.data.result?.nowm;
                title = response.data.result?.title || title;
                author = response.data.result?.author?.nickname || author;
            }

            if (videoUrl && !isAllowedDownloadUrl(videoUrl)) {
                logger.warn(`[TIKTOK] API ${api.name} devolvió una URL de descarga no permitida; se descarta.`);
                videoUrl = null;
            }

            if (videoUrl) {
                logger.info(`[TIKTOK] API ${api.name} exitosa`);
                return { videoUrl, title, author, method: `API-${api.name}` };
            }
        } catch (e) {
            logger.warn(`[TIKTOK] API ${api.name} falló:`, e.message);
        }
    }
    
    throw new Error('Todas las APIs fallaron');
}

async function processTikTokCommand(client, message) {
    const tempDir = path.join(__dirname, '..', '..', 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    let filePath = null;
    let ytdlpPrefix = null;

    try {
        const url = extractUrl(message);
        logger.info('[TIKTOK] URL validada:', url ? '(correcta)' : '(no válida)');

        if (!url) {
            await sendImageWithCaption(client, message.from, 'tiktok',
                error(
                    'Debes escribir un enlace de TikTok válido.\n' +
                    'Ejemplo: *.tiktok* https://vm.tiktok.com/ABCDEF/\n\n' +
                    'Solo se aceptan URLs de tiktok.com.'
                )
            );
            return;
        }

        await message.reply(status('⏳ Descargando video de TikTok...'));

        let result = null;

        // INTENTO 1: APIs externas
        try {
            result = await tryApiDownload(url);
            logger.info('[TIKTOK] API exitosa. Descargando video...');
            
            const videoResponse = await axios.get(result.videoUrl, {
                responseType: 'stream',
                timeout: 60000,
                maxRedirects: 3,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            filePath = path.join(tempDir, `tiktok_${Date.now()}.mp4`);

            try {
                await saveStreamWithLimit(videoResponse.data, filePath, MAX_VIDEO_DOWNLOAD_BYTES);
            } catch (e) {
                // El intento vía API no dejó un archivo utilizable: limpiarlo
                // antes de pasar al respaldo con yt-dlp.
                try { fs.rmSync(filePath, { force: true }); } catch (e2) {}
                throw e;
            }

            logger.info('[TIKTOK] Video descargado vía API:', filePath);
        } catch (apiErr) {
            logger.warn('[TIKTOK] APIs fallaron:', apiErr.message);
            if (filePath) {
                try { fs.rmSync(filePath, { force: true }); } catch (e) {}
                filePath = null;
            }
            result = null;
        }
        // INTENTO 2: yt-dlp (respaldo local)
        if (!result || !filePath) {
            logger.info('[TIKTOK] Activando respaldo con yt-dlp...');
            const ytDlpPath = findYtDlp();
            
            if (!ytDlpPath) {
                throw new Error('No se encontró yt-dlp y las APIs fallaron');
            }
            
            const idUnico = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
            ytdlpPrefix = `tiktok_${idUnico}`;
            const plantillaSalida = path.join(tempDir, `${ytdlpPrefix}_%(id)s.%(ext)s`);

            // BHK-01: sin shell. Argumentos separados y execFile; la URL ya
            // fue validada de forma estricta antes de llegar aquí.
            const args = ['-o', plantillaSalida, '--no-playlist', '--no-warnings', '--no-check-certificate', url];
            logger.info('[TIKTOK] Ejecutando yt-dlp (execFile, sin shell):', ytDlpPath);
            
            try {
                await execFileAsync(ytDlpPath, args, { timeout: 120000, maxBuffer: 8 * 1024 * 1024 });
            } catch (e) {
                logger.error('[TIKTOK] yt-dlp STDERR:', (e.stderr || '').slice(0, 500));
                throw e;
            }
            
            const archivos = fs.readdirSync(tempDir)
                .filter(f => f.startsWith(`${ytdlpPrefix}_`))
                .map(f => path.join(tempDir, f));
            
            if (archivos.length === 0) {
                throw new Error('yt-dlp no generó ningún archivo');
            }
            
            filePath = archivos[0];
            result = { title: 'Video de TikTok', author: 'Desconocido', duration: 0, method: 'yt-dlp' };
            logger.info('[TIKTOK] Video descargado vía yt-dlp:', filePath);
        }

        const datosVideo = {
            title: result.title || 'Video de TikTok',
            duration: result.duration || 0,
            hashtags: [],
            uploader: result.author || 'Desconocido',
            filePath: filePath
        };

        await sendTikTokVideo(client, message, datosVideo);
        logger.info('[TIKTOK] Video enviado OK (método:', result.method, ')');

    } catch (err) {
        logger.error('[TIKTOK] Error:', err.message);
        logger.error('[TIKTOK] Stack:', err.stack);

        let msg = 'No se pudo descargar el video de TikTok.\nPuede ser privado, estar restringido o haber sido eliminado.';
        if (err.message && err.message.includes('timeout')) {
            msg = 'La solicitud tardó demasiado. Intenta de nuevo.';
        } else if (err.message && err.message.includes('ECONNREFUSED')) {
            msg = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
        } else if (err.message && err.message.includes('ENOTFOUND')) {
            msg = 'No se pudo resolver el servidor. Verifica tu conexión a internet.';
        } else if (err.message && err.message.includes('No se encontró yt-dlp')) {
            msg = 'No se pudo descargar el video. Instala yt-dlp o intenta más tarde.';
        }

        await sendImageWithCaption(client, message.from, 'tiktok', warn(msg));

    } finally {
        // BHK-06: limpieza tolerante a fallos, siempre, y solo de archivos
        // creados por ESTA operación (filePath propio o prefijo único de yt-dlp).
        if (filePath && fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath); } catch (e) {}
        }
        if (ytdlpPrefix) {
            try {
                for (const f of fs.readdirSync(tempDir)) {
                    if (f.startsWith(ytdlpPrefix)) {
                        try { fs.unlinkSync(path.join(tempDir, f)); } catch (e) {}
                    }
                }
            } catch (e) {}
        }
    }
}

module.exports = {
    processTikTokCommand,
    // Exportados para pruebas de aceptación (scripts/test-audit-fixes.js)
    validateTikTokUrl,
    isAllowedDownloadUrl,
    saveStreamWithLimit
};
