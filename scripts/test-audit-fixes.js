/**
 * Pruebas de aceptación de la corrección de hallazgos de auditoría.    * Cubre: BHK-01 (sin shell en .tk), BHK-03 (destinos + límite de bytes),
 * BHK-04 (compuerta de comandos pesados), BHK-07 (loggedOut sin reconexión
 * infinita), BHK-09 (manejadores de proceso), BHK-11 (tamaño real del download
 * en .yt), BHK-12 (límites de longitud) y guardas de regresión de
 * BHK-02/BHK-05/BHK-06/BHK-08.
 *
 * No usa la red salvo en el caso final de .img con una clave de prueba
 * inválida (nunca la clave real de .env: se fuerza antes de cargar el módulo).
 * Uso: node scripts/test-audit-fixes.js
 */

// Debe ejecutarse ANTES de requerir los módulos que leen la clave.
process.env.GEMINI_API_KEY = 'INVALID_TEST_KEY_FOR_TESTS';

const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const EventEmitter = require('events');
const { DisconnectReason } = require('@whiskeysockets/baileys');

const { validateTikTokUrl, isAllowedDownloadUrl, saveStreamWithLimit } = require('../src/commands/tiktok');
const { wireEvents } = require('../src/infrastructure/whatsapp/events');
const { BaileysAdapter } = require('../src/infrastructure/whatsapp/adapter');
const { tryAcquireHeavy, resetLimiter, MAX_CONCURRENT } = require('../src/utils/rateLimiter');
const { installProcessGuards } = require('../src/utils/processGuards');
const logger = require('../src/utils/logger');

const ROOT = path.join(__dirname, '..', 'src', 'commands');

function readSrc(file) {
    return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

let failed = 0;

function check(label, condition, detail = '') {
    const icon = condition ? '✔' : '✖';
    console.log(`${icon} ${label}${detail && !condition ? ' — ' + detail : ''}`);
    if (!condition) failed++;
}

(async () => {
    // ================= BHK-01 =================
    console.log('== BHK-01: validación estricta de URLs de TikTok ==');
    check('URL real de video aceptada', validateTikTokUrl('https://www.tiktok.com/@usuario/video/1234567890') !== null);
    check('URL corta vm.tiktok.com aceptada', validateTikTokUrl('https://vm.tiktok.com/ZMabcdefg/') !== null);
    check('inyección con comillas y ; rechazada',
        validateTikTokUrl('https://www.tiktok.com/@v" -o /tmp/HOLA --postprocessor-args "ffmpeg:-i foo ; rm -rf /tmp/DEMO') === null);
    check('inyección con backticks y $() rechazada', validateTikTokUrl('https://tiktok.com/`$(whoami)`/x') === null);
    check('host no-tiktok.com rechazado', validateTikTokUrl('https://evil.com/x?u=tiktok.com') === null);
    check('dominio imitador *.evil.com rechazado', validateTikTokUrl('https://tiktok.com.evil.com/video') === null);
    check('pseudo-host not-tiktok.com rechazado', validateTikTokUrl('https://not-tiktok.com/video') === null);
    check('esquema file:// rechazado', validateTikTokUrl('file:///etc/passwd') === null);
    check('credenciales en URL rechazadas', validateTikTokUrl('https://user:pass@www.tiktok.com/x') === null);
    check('URL sin esquema rechazada', validateTikTokUrl('tiktok.com/video') === null);

    // ================= BHK-03 =================
    console.log('\n== BHK-03: destinos de descarga permitidos ==');
    check('tikwm.com aceptado', isAllowedDownloadUrl('https://www.tikwm.com/video/media/hdplay/756319.mp4') === true);
    check('tiktokcdn-us.com aceptado', isAllowedDownloadUrl('https://v16m-default.tiktokcdn-us.com/obj/x.mp4') === true);
    check('SSRF a link-local rechazado', isAllowedDownloadUrl('http://169.254.169.254/latest/meta-data/') === false);
    check('localhost rechazado', isAllowedDownloadUrl('http://127.0.0.1:9200/_search') === false);
    check('file:// rechazado como destino', isAllowedDownloadUrl('file:///etc/passwd') === false);
    check('dominio ajeno rechazado', isAllowedDownloadUrl('https://evil.example.com/obj/x.mp4') === false);

    console.log('\n== BHK-03: límite de bytes al descargar ==');
    const tempFile = path.join(__dirname, '..', 'temp', 'audit_test_stream.bin');

    // Bajo el límite: el archivo se completa.
    const mbData = Buffer.alloc(1024 * 1024, 1);
    const within = Readable.from([mbData, mbData, mbData, mbData]);
    await saveStreamWithLimit(within, tempFile, 8 * 1024 * 1024);
    check('4 MB bajo límite de 8 MB se guarda completo',
        fs.existsSync(tempFile) && fs.statSync(tempFile).size === 4 * 1024 * 1024);
    try { fs.rmSync(tempFile, { force: true }); } catch (e) {}

    // Por encima del límite: la promesa se rechaza.
    const over = Readable.from(Array.from({ length: 12 }, () => mbData));
    let rejected = false;
    try {
        await saveStreamWithLimit(over, tempFile, 8 * 1024 * 1024);
    } catch (e) {
        rejected = true;
    }
    check('12 MB contra límite de 8 MB aborta la descarga', rejected);
    try { fs.rmSync(tempFile, { force: true }); } catch (e) {}

    // ================= BHK-07 =================
    console.log('\n== BHK-07: cierre de conexión y loggedOut ==');
    const calls = { reconnect: 0, loggedOut: 0, auth: 0, disconnected: 0 };
    const spyAdapter = {
        markConnected() {},
        scheduleReconnect() { calls.reconnect++; },
        onLoggedOut() { calls.loggedOut++; }
    };
    const spyCallbacks = {
        onAuthFailure: () => { calls.auth++; },
        onDisconnect: () => { calls.disconnected++; }
    };
    const sock = new EventEmitter();
    sock.ev = sock; // wireEvents usa sock.ev.on(...)

    wireEvents(sock, spyCallbacks, spyAdapter);

    sock.ev.emit('connection.update', {
        connection: 'close',
        lastDisconnect: { error: { output: { statusCode: DisconnectReason.loggedOut } } }
    });
    check('loggedOut NO re agenda reconexión', calls.reconnect === 0);
    check('loggedOut limpia sesión vía adapter.onLoggedOut', calls.loggedOut === 1);
    check('loggedOut avisa de la falla de autenticación', calls.auth === 1);

    sock.ev.emit('connection.update', {
        connection: 'close',
        lastDisconnect: { error: { output: { statusCode: 515 } } }
    });
    check('cierre normal SÍ agenda reconexión', calls.reconnect === 1);

    const adapter = new BaileysAdapter({});
    check('BaileysAdapter expone onLoggedOut', typeof adapter.onLoggedOut === 'function');
    // No se invoca sobre un adapter real (borraría la sesión real del usuario).

    // ========== Guardas de regresión BHK-02 / 05 / 06 / 08 ==========
    console.log('\n== Regresiones: fuentes sin patrones prohibidos ==');
    const srcTiktok = readSrc('tiktok.js');
    const srcYoutube = readSrc('youtube.js');
    const srcImage = readSrc('image.js');
    const srcVoice = readSrc('voice.js');
    const srcAI = readSrc('ai.js');
    const srcAdapter = fs.readFileSync(path.join(__dirname, '..', 'src/infrastructure/whatsapp/adapter.js'), 'utf8');

    check('tiktok.js no monta comandos de shell (bash -c / shell:true / execPromise)',
        !srcTiktok.includes('bash -c') && !srcTiktok.includes('shell:') && !srcTiktok.includes('execPromise'));
    check('tiktok.js ejecuta yt-dlp con execFile', srcTiktok.includes('execFileAsync(ytDlpPath, args'));
    check('youtube.js ejecuta yt-dlp con execFile (sin plantillas de shell)',
        !srcYoutube.includes('execPromise') && srcYoutube.includes('execFileAsync'));
    check('image.js no sombrea catch (error)', !/catch \(error\)/.test(srcImage));
    check('ai.js no sombrea catch (error)', !/catch \(error\)/.test(srcAI));
    check('voice.js ya no usa execSync ni shell:true', !srcVoice.includes('execSync') && !srcVoice.includes('shell:'));
    check('image.js limpia en finally', srcImage.includes('} finally {'));
    check('voice.js limpia en finally', srcVoice.includes('} finally {'));
    check('tiktok.js limpia en finally', srcTiktok.includes('} finally {'));
    check('youtube.js limpia en finally', srcYoutube.includes('} finally {'));
    check('ai.js ya no manda la clave en la query', !srcAI.includes('generateContent?key='));
    check('ai.js usa la clave en el header', srcAI.includes("'x-goog-api-key': GEMINI_API_KEY"));
    check('adapter.js llama clearSession en onLoggedOut', srcAdapter.includes('clearSession();'));

    // ========== Guardas de regresión BHK-04 / BHK-09 ==========
    console.log('\n== Regresiones: compuerta y guards en el código ==');
    const srcRateLimiter = fs.readFileSync(path.join(__dirname, '..', 'src/utils/rateLimiter.js'), 'utf8');
    const srcProcessGuards = fs.readFileSync(path.join(__dirname, '..', 'src/utils/processGuards.js'), 'utf8');
    const srcBot = fs.readFileSync(path.join(__dirname, '..', 'bhk-bot.js'), 'utf8');
    const srcIndexRouter = readSrc('index.js');

    check('rateLimiter.js soporta HEAVY_COOLDOWN_MS y HEAVY_MAX_CONCURRENT',
        srcRateLimiter.includes('HEAVY_COOLDOWN_MS') && srcRateLimiter.includes('HEAVY_MAX_CONCURRENT'));
    check('rateLimiter.js limita la memoria interna de usuarios', srcRateLimiter.includes('MAX_TRACKED_USERS'));
    check('router solo somete comandos pesados a la compuerta', srcIndexRouter.includes('HEAVY_COMMANDS.has(parsed.command)'));
    // El exit(1) legítimo del bloque uncaughtException no invalida el guard:
    // el comportamiento real (rechazos sin tumbar el proceso) se prueba en runtime más arriba.
    check('processGuards.js atiende unhandledRejection registrándolo',
        srcProcessGuards.includes("process.on('unhandledRejection'") && srcProcessGuards.includes('logger.error'),
        'falta el handler o el registro del error');
    check('processGuards.js atiende uncaughtException (exit ordenado)', srcProcessGuards.includes("process.on('uncaughtException'") && srcProcessGuards.includes('process.exit(1)'));
    check('bhk-bot.js instala los guards al arrancar', srcBot.includes('installProcessGuards'));

    // ================= BHK-02: el error se comunica al usuario =================
    console.log('\n== BHK-02: .img con clave inválida responde con un error visible ==');
    const { generateImage } = require('../src/commands/image');
    const sent = [];
    const fakeClient = {
        async sendText(chatId, text) { sent.push(text); },
        async sendMedia(chatId, media, options) { sent.push(options.caption || ''); }
    };
    const fakeMessage = { body: '.img un gato volador', from: '9999@c.us', hasMedia: false };

    await generateImage(fakeClient, fakeMessage);
    const lastSent = sent[sent.length - 1] || '';
    check('el usuario recibe al menos una respuesta', sent.length >= 1);
    check('la respuesta final comunica el error (no silencio)', /Error|error/i.test(lastSent), lastSent.slice(0, 60));

    // ================= BHK-04 =================
    console.log('\n== BHK-04: compuerta de comandos pesados ==');
    resetLimiter();
    const g1 = tryAcquireHeavy('user-a');
    check('primer comando pesado se admite', g1.ok === true && typeof g1.release === 'function');
    const g2 = tryAcquireHeavy('user-a');
    check('mismo usuario en cooldown es rechazado', g2.ok === false && g2.reason === 'cooldown');
    check('el cooldown informa tiempo de espera', typeof g2.retryAfterMs === 'number' && g2.retryAfterMs > 0);
    const g3 = tryAcquireHeavy('user-b');
    check('el cooldown es por usuario: otro usuario pasa', g3.ok === true);
    check('el límite global default es 2 procesos', MAX_CONCURRENT === 2);
    const g4 = tryAcquireHeavy('user-c');
    check('límite global lleno rechaza a nuevos usuarios', g4.ok === false && g4.reason === 'busy');
    g1.release();
    g3.release();
    g3.release(); // doble release debe ser inofensivo
    const g5 = tryAcquireHeavy('user-c');
    check('tras liberar, un usuario vuelve a ser admitido', g5.ok === true);
    g5.release();
    resetLimiter();

    // Comportamiento end-to-end del router con la compuerta.
    console.log('\n== BHK-04: router somete comandos pesados a la compuerta ==');
    const gateSends = [];
    const gateClient = { async sendText(chatId, text) { gateSends.push(text); }, async sendMedia() {} };
    const gateMsg = { body: '', from: 'gate-user@c.us' };
    const { routeCommand } = require('../src/commands/index');

    await routeCommand({ command: 'yt', prefix: '.' }, gateMsg, gateClient);
    const firstCount = gateSends.length;
    check('la primera invocación llega al comando (respuesta normal)', firstCount >= 1, 'sin respuestas');
    await routeCommand({ command: 'yt', prefix: '.' }, gateMsg, gateClient);
    const lastGate = gateSends[gateSends.length - 1] || '';
    check('el segundo intento inmediato recibe el aviso de cooldown',
        gateSends.length === firstCount + 1 && /espera/i.test(lastGate), lastGate.slice(0, 60));

    // BHK-09
    console.log('\n== BHK-09: manejadores globales de proceso ==');
    installProcessGuards(logger);
    check('unhandledRejection tiene manejador instalado', process.listenerCount('unhandledRejection') > 0);
    check('uncaughtException tiene manejador instalado', process.listenerCount('uncaughtException') > 0);
    installProcessGuards(logger);
    check('la instalación es idempotente (sin duplicar manejadores)',
        process.listenerCount('unhandledRejection') === 1 && process.listenerCount('uncaughtException') === 1);

    // Una promesa rechazada sin manejar debe registrarse, no tumbar el proceso.
    let guardLogged = false;
    const origConsoleError = console.error;
    console.error = (...args) => {
        if (String(args.join(' ')).includes('Promesa rechazada')) guardLogged = true;
        origConsoleError(...args);
    };
    Promise.reject(new Error('rej_seed_prueba'));
    await new Promise((resolve) => setTimeout(resolve, 250));
    console.error = origConsoleError;
    check('unhandledRejection se registra y el proceso sobrevive', guardLogged);

    // ================= BHK-11 =================
    console.log('\n== BHK-11: check de tamaño del archivo descargado (.yt) ==');
    const { fileExceedsLimit } = require('../src/commands/youtube');
    const bigFile = path.join(__dirname, '..', 'temp', 'audit_test_big.bin');
    fs.writeFileSync(bigFile, Buffer.alloc(1024 * 1024, 1)); // 1 MB
    check('archivo de 1 MB contra límite de 0.5 MB se rechaza', fileExceedsLimit(bigFile, 512 * 1024) === true);
    check('archivo de 1 MB contra límite de 2 MB se acepta', fileExceedsLimit(bigFile, 2 * 1024 * 1024) === false);
    check('archivo inexistente no asume exceso', fileExceedsLimit(bigFile + '.no-existe', 1) === false);
    try { fs.rmSync(bigFile, { force: true }); } catch (e) {}

    // ================= BHK-12 =================
    console.log('\n== BHK-12: límites de longitud en .ia / .img / .voz ==');
    function makeCaptureClient() {
        const out = [];
        return {
            out,
            async sendText(chatId, text) { out.push(text); },
            async sendMedia(chatId, media, options) { out.push(options.caption || ''); }
        };
    }

    // .ia con 1100 caracteres: debe rechazarse ANTES de tocar la API de
    // Gemini (con la clave de prueba inválida, cualquier llamada fallaria).
    const { handleAICommand } = require('../src/commands/ai');
    const capAI = makeCaptureClient();
    await handleAICommand({ body: '.ia ' + 'x'.repeat(1100), from: 'lim-ia@c.us' }, capAI);
    check('.ia rechaza prompts de más de 1000 caracteres',
        capAI.out.length === 1 && /demasiado largo/i.test(capAI.out[0]), capAI.out.join(' | ').slice(0, 80));
    check('.ia no gasta cuota de Gemini con prompts largos', !capAI.out.join(' ').includes('Hubo un problema'));

    // .img con 600 caracteres: rechazo antes del estado "Generando imagen".
    const { generateImage: genImgLimit, generateImageAI: genImgAILimit } = require('../src/commands/image');
    const capImg = makeCaptureClient();
    await genImgLimit(capImg, { body: '.img ' + 'y'.repeat(600), from: 'lim-img@c.us', hasMedia: false });
    check('.img rechaza prompts de más de 500 caracteres',
        capImg.out.length === 1 && /demasiado larga/i.test(capImg.out[0]), capImg.out.join(' | ').slice(0, 80));
    check('.img no llama a la API con prompts largos', !capImg.out.join(' ').includes('Generando'));

    // .editar (generateImageAI) aplica el mismo límite.
    const capEdit = makeCaptureClient();
    await genImgAILimit(capEdit, { body: '.editar ' + 'z'.repeat(600), from: 'lim-edit@c.us', hasMedia: false });
    check('.editar rechaza prompts de más de 500 caracteres',
        capEdit.out.length === 1 && /demasiado larga/i.test(capEdit.out[0]), capEdit.out.join(' | ').slice(0, 80));

    // .voz con 600 caracteres: rechazo antes de llamar a la TTS.
    const { processVoiceCommand: vozLimit } = require('../src/commands/voice');
    const capVoz = makeCaptureClient();
    await vozLimit(capVoz, { body: '.voz ' + 'w'.repeat(600), from: 'lim-voz@c.us', reply: async (t) => capVoz.out.push(t) });
    check('.voz rechaza textos de más de 500 caracteres',
        capVoz.out.length === 1 && /demasiado largo/i.test(capVoz.out[0]), capVoz.out.join(' | ').slice(0, 80));
    check('.voz no llama a la TTS con textos largos', !capVoz.out.join(' ').includes('Generando audio'));

    console.log('\n' + (failed === 0 ? 'Todos los tests de aceptación pasaron ✔' : `${failed} test(s) fallaron ✖`));
    process.exit(failed === 0 ? 0 : 1);
})();
