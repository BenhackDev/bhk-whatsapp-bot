const PREFIXES = (process.env.PREFIX_LIST || '.').split(',');
const SESSION_NAME = process.env.SESSION_NAME || 'session-client-one';
const SELF_CHAT = process.env.SELF_CHAT !== 'false';

module.exports = { PREFIXES, SESSION_NAME, SELF_CHAT };
