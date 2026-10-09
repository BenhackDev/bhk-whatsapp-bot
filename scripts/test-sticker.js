/**
 * Test manual del comando sticker (no forma parte del bot).
 * Verifica: conversión image/gif/video -> webp e inyección de EXIF.
 * Uso: node scripts/test-sticker.js
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { convertToStickerWebp, addExifToWebp, classifyMedia } = require('../src/commands/sticker');

const TMP = path.join(__dirname, '..', 'temp');
if (!fs.existsSync(TMP)) fs.mkdirSync(TMP, { recursive: true });

function parseWebpChunks(buffer) {
    const chunks = [];
    let offset = 12;
    while (offset + 8 <= buffer.length) {
        const fourcc = buffer.toString('ascii', offset, offset + 4);
        const size = buffer.readUInt32LE(offset + 4);
        chunks.push({ fourcc, size });
        offset += 8 + size + (size % 2);
    }
    return chunks;
}

function ffmpeg(args) {
    execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'pipe' });
}

let failures = 0;

function check(label, condition, detail = '') {
    const icon = condition ? '✔' : '✖';
    console.log(`${icon} ${label}${detail ? ' — ' + detail : ''}`);
    if (!condition) failures++;
}

async function testKind(kind, makeInput) {
    const inputExt = kind === 'image' ? 'png' : kind === 'gif' ? 'gif' : 'mp4';
    const inputPath = path.join(TMP, `test_input_${kind}.${inputExt}`);
    makeInput(inputPath);
    const outputPath = path.join(TMP, `test_output_${kind}.webp`);

    await convertToStickerWebp(kind, inputPath, outputPath);
    const raw = fs.readFileSync(outputPath);
    check(`${kind}: ffmpeg produce WebP válido`,
        raw.length > 0 && raw.toString('ascii', 0, 4) === 'RIFF' && raw.toString('ascii', 8, 12) === 'WEBP',
        `${(raw.length / 1024).toFixed(1)} KB`);

    const patched = addExifToWebp(raw, 'Gatos', 'BHK-BOT');
    const chunks = parseWebpChunks(patched);
    const hasVp8x = chunks.some(c => c.fourcc === 'VP8X');
    const hasExif = chunks.some(c => c.fourcc === 'EXIF');

    check(`${kind}: VP8X presente tras parchar`, hasVp8x);
    check(`${kind}: chunk EXIF inyectado`, hasExif);
    check(`${kind}: tamaño RIFF coherente`, patched.readUInt32LE(4) === patched.length - 8);

    // Validar que el webp parchado sigue siendo legible por ffmpeg
    const patchedPath = path.join(TMP, `test_patched_${kind}.webp`);
    fs.writeFileSync(patchedPath, patched);
    try {
        execFileSync('ffprobe', ['-v', 'error', patchedPath], { stdio: 'pipe' });
        check(`${kind}: webp parchado legible por ffprobe`, true);
    } catch (e) {
        check(`${kind}: webp parchado legible por ffprobe`, false, e.message.split('\n')[0]);
    }

    // El EXIF debe contener el nombre del pack
    const exifOffset = (() => {
        let offset = 12;
        while (offset + 8 <= patched.length) {
            const fourcc = patched.toString('ascii', offset, offset + 4);
            const size = patched.readUInt32LE(offset + 4);
            if (fourcc === 'EXIF') return offset + 8;
            offset += 8 + size + (size % 2);
        }
        return -1;
    })();
    if (exifOffset >= 0) {
        const payload = patched.toString('utf-8', exifOffset, patched.length);
        check(`${kind}: EXIF contiene pack name/author`,
            payload.includes('Gatos') && payload.includes('BHK-BOT'));
    }

    for (const f of [inputPath, outputPath, patchedPath]) {
        try { fs.unlinkSync(f); } catch (e) {}
    }
}

(async () => {
    console.log('== Test: classifyMedia ==');
    check('image/jpeg → image', classifyMedia('image/jpeg') === 'image');
    check('image/gif → gif', classifyMedia('image/gif') === 'gif');
    check('video/mp4 → video', classifyMedia('video/mp4') === 'video');
    check('application/pdf → null', classifyMedia('application/pdf') === null);
    check('vacío → null', classifyMedia('') === null);

    console.log('\n== Test: conversión image ==');
    await testKind('image', (out) => {
        ffmpeg(['-f', 'lavfi', '-i', 'color=c=red:s=800x600:d=1', '-frames:v', '1', out]);
    });

    console.log('\n== Test: conversión gif ==');
    await testKind('gif', (out) => {
        ffmpeg(['-f', 'lavfi', '-i', 'testsrc=s=320x240:d=1:r=10', out]);
    });

    console.log('\n== Test: conversión video (2s) ==');
    await testKind('video', (out) => {
        ffmpeg(['-f', 'lavfi', '-i', 'testsrc=s=640x480:d=2:r=24', '-pix_fmt', 'yuv420p', out]);
    });

    console.log(failures === 0 ? '\nTodos los tests pasaron ✔' : `\n${failures} test(s) fallaron ✖`);
    process.exit(failures === 0 ? 0 : 1);
})();
