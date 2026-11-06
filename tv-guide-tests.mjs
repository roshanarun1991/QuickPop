import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PNG} from 'pngjs';
import jsQR from 'jsqr';
const image=PNG.sync.read(await readFile('quickpop-tv.png'));
assert.equal(image.width,3840);assert.equal(image.height,2160);
assert.equal(jsQR(new Uint8ClampedArray(image.data),image.width,image.height)?.data,'https://quickpop.rans-quiz.workers.dev/#join');
assert.deepEqual(await readFile('dist/quickpop-tv.png'),await readFile('quickpop-tv.png'));
console.log('PASS 4K TV guide QR points to live joining; published image matches source');
