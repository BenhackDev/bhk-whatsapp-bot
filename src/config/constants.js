const PREFIXES = (process.env.PREFIX_LIST || '.,#,/,$,!,%').split(',');
const SESSION_NAME = process.env.SESSION_NAME || 'session-client-one';

module.exports = { PREFIXES, SESSION_NAME };
