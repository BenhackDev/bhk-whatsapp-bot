/**
 * serviceRegistry.js — Registro central de estado de servicios.
 *
 * Evita advertencias dispersas y duplicadas en la terminal: cada módulo
 * reporta el estado de su servicio aquí y la capa UX lo agrupa en un
 * único resumen limpio.
 *
 * Estados:
 *   ok          -> 🟢 listo
 *   optional    -> 🟡 opcional / no configurado (no detiene el bot)
 *   error       -> 🔴 falló
 *   connecting  -> ⏳ en proceso
 */

const STATUS_ICONS = {
    ok: '🟢',
    optional: '🟡',
    error: '🔴',
    connecting: '⏳'
};

// TOP_ORDER controla el orden en que se muestran los servicios.
const TOP_ORDER = ['whatsapp', 'multimedia', 'database', 'ia', 'voz', 'descargas'];

// META describe cada servicio y sus proveedores hijos.
const META = {
    whatsapp: { label: 'WhatsApp' },
    multimedia: { label: 'Multimedia' },
    database: { label: 'Base de datos' },
    ia: { label: 'IA' },
    gemini: { label: 'Gemini', parent: 'ia' },
    voz: { label: 'Voz' },
    elevenlabs: { label: 'ElevenLabs', parent: 'voz' },
    google_tts: { label: 'Google TTS', parent: 'voz' },
    descargas: { label: 'Descargas' }
};

const states = {};

function ensure(key) {
    if (!states[key]) {
        states[key] = { status: 'connecting', detail: '', optional: false };
    }
}

/**
 * Reporta el estado de un servicio.
 * @param {string} key   Clave del servicio (ver META).
 * @param {string} status one of 'ok' | 'optional' | 'error' | 'connecting'
 * @param {string} detail  Detalle corto opcional.
 * @param {boolean} optional Marca el servicio como opcional.
 */
function setService(key, status = 'ok', detail = '', optional = false) {
    if (!META[key]) return;
    ensure(key);
    states[key].status = status;
    states[key].detail = detail || '';
    states[key].optional = !!optional;
}

function get(key) {
    if (!META[key]) return null;
    const s = states[key] || { status: 'connecting', detail: '', optional: false };
    return { key, label: META[key].label, parent: META[key].parent, ...s };
}

function topLevelKeys() {
    return TOP_ORDER.filter((k) => META[k] && !META[k].parent);
}

function childrenOf(parent) {
    return Object.keys(META).filter((k) => META[k].parent === parent);
}

function iconOf(status) {
    return STATUS_ICONS[status] || '◽';
}

function hasOptional() {
    return Object.values(states).some((s) => s.optional);
}

function hasError() {
    return Object.values(states).some((s) => s.status === 'error');
}

/**
 * Lista de etiquetas de servicios que requieren atención
 * (opcionales sin configurar o en error). Se usa para el resumen.
 */
function summaryItems() {
    const items = [];
    for (const key of Object.keys(META)) {
        const s = states[key];
        if (!s) continue;
        if (s.optional || s.status === 'error') items.push(META[key].label);
    }
    return items;
}

/**
 * Reinicia el registro (útil para pruebas).
 */
function reset() {
    for (const key of Object.keys(states)) delete states[key];
}

module.exports = {
    STATUS_ICONS,
    META,
    setService,
    get,
    topLevelKeys,
    childrenOf,
    iconOf,
    hasOptional,
    hasError,
    summaryItems,
    reset
};

