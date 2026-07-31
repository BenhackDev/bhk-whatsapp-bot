/**
 * BHK WhatsApp Bot — Verificador de sintaxis
 *
 * Recorre todos los archivos .js del proyecto (excepto node_modules,
 * session, temp y carpetas de caché) y ejecuta `node --check` sobre
 * cada uno. Se ejecuta con: npm run check
 *
 * Útil en desarrollo, pre-commit y en CI (GitHub Actions).
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const IGNORED_DIRS = new Set(['node_modules', 'session', 'temp', '.wwebjs_cache', '.git']);

const files = [];

function collect(dir) {
    let entries;
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
        return;
    }
    for (const entry of entries) {
        if (entry.isDirectory()) {
            if (!IGNORED_DIRS.has(entry.name)) {
                collect(path.join(dir, entry.name));
            }
        } else if (entry.name.endsWith('.js')) {
            files.push(path.join(dir, entry.name));
        }
    }
}

collect('.');

let ok = 0;
const failures = [];

for (const file of files) {
    try {
        execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
        ok++;
    } catch (error) {
        failures.push(file);
        console.error(`❌ Error de sintaxis en: ${file}`);
        console.error(String(error.stderr || error.message).trim());
        console.error('');
    }
}

console.log(`✔ ${ok} archivos verificados.`);

if (failures.length > 0) {
    console.error(`✖ ${failures.length} archivo(s) con errores de sintaxis.`);
    process.exit(1);
}

console.log('Sintaxis correcta en todo el proyecto.');
