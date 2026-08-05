require('dotenv/config');

const BOT_NAME = process.env.BOT_NAME || 'BHK-BOT';
const BOT_EMOJI = '🤖';

const CREATOR = {
    name: process.env.CREATOR_NAME || 'Tutos Benhack',
    youtube: process.env.CREATOR_YOUTUBE || 'https://www.youtube.com/@Tutos_benhack',
    tiktok: process.env.CREATOR_TIKTOK || 'https://www.tiktok.com/@tutosbenhack',
    github: process.env.CREATOR_GITHUB || 'https://github.com/tutosbenhack'
};

const SOCIALS = [
    { icon: '🎥', label: 'YouTube', url: CREATOR.youtube },
    { icon: '🎵', label: 'TikTok', url: CREATOR.tiktok },
    { icon: '🐙', label: 'GitHub', url: CREATOR.github }
].map((s) => ({ ...s, handle: shortHandle(s.url), link: shortLink(s.url) }));

function shortHandle(url) {
    const match = String(url).match(/@?([^/@\s]+)\/?$/);
    const name = match ? match[1] : url;
    return String(url).includes('@') ? `@${name}` : name;
}

function shortLink(url) {
    return String(url)
        .replace(/^https?:\/\//i, '')
        .replace(/^www\./i, '');
}

const DECOR = {
    open: '╭─୨ৎ',
    branch: '├─⟡',
    leaf: '⤷',
    bar: '│',
    close: '╰─❀'
};

const ICONS = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warn: '⚠️',
    config: '⚙️',
    money: '💰',
    games: '🎮',
    ia: '🤖',
    downloads: '📥',
    user: '👤',
    group: '👥',
    stats: '📊',
    time: '⏱️',
    security: '🔒',
    docs: '📋',
    tip: '💡',
    heart: '💚',
    crown: '👑',
    video: '🎬',
    voice: '🗣️',
    art: '🎨',
    wave: '👋',
    folder: '📁',
    mail: '📧'
};

const TITLES = {
    menu: 'Menú Principal',
    help: 'Ayuda',
    creator: 'Creador',
    profile: 'Perfil',
    config: 'Configuración',
    info: 'Información',
    success: 'Éxito',
    error: 'Error',
    warn: 'Advertencia',
    welcome: 'Bienvenido',
    stats: 'Estadísticas',
    downloads: 'Descargas',
    economy: 'Economía',
    games: 'Juegos',
    voice: 'Texto a Voz',
    image: 'Imagen IA',
    tiktok: 'TikTok',
    tagall: 'Mención Masiva'
};

const MUÑECO_LINES = [
    '∧🎩∧',
    '(⌒‿⌒) ♡ʙᴇɴʜᴀᴄᴋ♡',
    ' ⊃⊂ \\○'
];

const BLESSING = '*ʙᴇɴᴅɪᴄɪᴏɴᴇꜱ ʏ Éxɪᴛᴏꜱ* ✨';

function frame(title) {
    return `${DECOR.open} ✨ ${title} ✨`;
}

function branch(text) {
    return `${DECOR.branch} ${text}`;
}

function leaf(text) {
    return `${DECOR.bar}   ${DECOR.leaf} ${text}`;
}

function blank() {
    return DECOR.bar;
}

function closeLine(text) {
    return `${DECOR.close} ${text}`;
}

function title(icon, text) {
    return `${icon} *${text}*`;
}

function creditLine() {
    return `${BOT_EMOJI} *${BOT_NAME}* — 💻 *${CREATOR.name}*`;
}

function signatureItems() {
    return [
        { icon: '👨‍💻', label: 'Creado por', desc: CREATOR.name },
        { icon: '🌐', label: 'Sígueme', desc: SOCIALS.map((s) => `${s.icon} ${s.link}`) }
    ];
}

function muñecoBlock() {
    return MUÑECO_LINES.map((line, i) => (
        i === 0 ? `${DECOR.bar}   ${DECOR.leaf} ${line}` : `${DECOR.bar}    ${line}`
    ));
}

function tip(text) {
    return { icon: '💡', label: 'Consejo', desc: text };
}

function important(text) {
    return { icon: '⚠️', label: 'Importante', desc: text };
}

function successNote(text) {
    return { icon: '✅', label: 'Éxito', desc: text };
}

function errorNote(text) {
    return { icon: '❌', label: 'Error', desc: text };
}

function textToItem(body, icon) {
    const lines = String(body).trim().split('\n').map((l) => l.trim()).filter(Boolean);
    const [first, ...rest] = lines;
    if (!first) return { branch: icon, desc: [] };
    return { branch: `${icon} ${first}`, desc: rest };
}

function build(items, options = {}) {
    const { type = 'info', notes = [], withSignature = false, close = null } = options;

    const lines = [];
    lines.push(frame(TITLES[type] || BOT_NAME));
    lines.push(blank());

    const addItem = (item) => {
        if (typeof item === 'string') {
            lines.push(branch(item));
        } else if (item && item.branch) {
            lines.push(branch(item.branch));
            const descs = Array.isArray(item.desc) ? item.desc : (item.desc ? [item.desc] : []);
            descs.filter(Boolean).forEach((d) => lines.push(leaf(d)));
        } else if (item && (item.icon || item.label)) {
            const head = [item.icon, item.label ? `*${item.label}*` : ''].filter(Boolean).join(' ');
            lines.push(branch(head));
            const descs = Array.isArray(item.desc) ? item.desc : (item.desc ? [item.desc] : []);
            descs.filter(Boolean).forEach((d) => lines.push(leaf(d)));
        }
        lines.push(blank());
    };

    items.forEach(addItem);
    notes.forEach(addItem);

    if (withSignature) {
        lines.push(branch(`💻 *Creado por*`));
        muñecoBlock().forEach((l) => lines.push(l));
        lines.push(blank());
        lines.push(branch(`🌐 *Sígueme*`));
        SOCIALS.forEach((s) => lines.push(leaf(`${s.icon} ${s.link}`)));
        lines.push(blank());
    }

    lines.push(closeLine(close || (withSignature ? BLESSING : `${BOT_EMOJI} ${BOT_NAME}`)));

    return lines.join('\n');
}

function info(body, options = {}) {
    return build([textToItem(body, ICONS.info)], { type: 'info', ...options });
}

function success(body, options = {}) {
    return build([textToItem(body, ICONS.success)], { type: 'success', ...options });
}

function warn(body, options = {}) {
    return build([textToItem(body, ICONS.warn)], { type: 'warn', ...options });
}

function error(body, options = {}) {
    return build([textToItem(body, ICONS.error)], { type: 'error', ...options });
}

function status(body) {
    return build([textToItem(body, '⏳')], { type: null, close: `${BOT_EMOJI} ${BOT_NAME}` });
}

function creatorCard() {
    return build(
        [
            { icon: '👋', label: `¡Hola! Soy ${BOT_NAME}`, desc: 'Asistente de WhatsApp con IA, listo para ayudarte.' },
            { icon: '🏆', label: 'Proyecto', desc: '100% open source, hecho con 💚 para la comunidad.' }
        ],
        { type: 'creator', withSignature: true }
    );
}

module.exports = {
    BOT_NAME,
    BOT_EMOJI,
    CREATOR,
    SOCIALS,
    DECOR,
    ICONS,
    TITLES,
    MUÑECO_LINES,
    BLESSING,
    frame,
    branch,
    leaf,
    blank,
    closeLine,
    title,
    creditLine,
    signatureItems,
    muñecoBlock,
    tip,
    important,
    successNote,
    errorNote,
    textToItem,
    build,
    info,
    success,
    warn,
    error,
    status,
    creatorCard
};
