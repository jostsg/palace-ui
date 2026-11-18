import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { render, close } from './render.js';

after(close);

const source = await readFile(new URL('../palace.css', import.meta.url), 'utf8');

test('the stylesheet carries no merge-conflict markers', () => {
  assert.deepEqual(source.split('\n').filter((line) => /^(<{7}|={7}|>{7})( |$)/.test(line)), []);
});

test('every @font-face in the source reaches the browser', async () => {
  const page = await render('<p>x</p>');
  const parsed = await page.evaluate(() => [...document.styleSheets]
    .flatMap((sheet) => [...sheet.cssRules])
    .filter((rule) => rule instanceof CSSFontFaceRule).length);
  await page.close();
  assert.equal(parsed, source.match(/@font-face/g).length);
});
