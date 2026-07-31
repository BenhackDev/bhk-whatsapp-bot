const fs = require('fs');
const path = require('path');

const PREFIXES = (process.env.PREFIX_LIST || '.,#,/,$,!,%').split(',');
const SESSION_NAME = process.env.SESSION_NAME || 'session-client-one';

const CHROME_PATHS = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    require('puppeteer').executablePath()
];

function findChrome() {
    return CHROME_PATHS.find(p => fs.existsSync(p)) || CHROME_PATHS[2];
}

const CHROME_ARGS = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--no-first-run',
    '--no-zygote',
    '--disable-extensions',
    '--disable-background-networking',
    '--disable-sync',
    '--no-default-browser-check'
];

module.exports = { PREFIXES, SESSION_NAME, findChrome, CHROME_ARGS };
