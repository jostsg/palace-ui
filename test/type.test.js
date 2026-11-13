import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { render, close } from './render.js';

after(close);

const css = readFileSync(new URL('../palace.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

const scale = { '3xs': 10, '2xs': 11, xs: 12, sm: 13, md: 14, lg: 16, xl: 18, '2xl': 24, '3xl': 32, '4xl': 40 };
const token = /^var\(--p-text-(3xs|2xs|xs|sm|md|lg|xl|2xl|3xl|4xl)\)$/;
// A size relative to the parent (a key inside a button) follows the text around it.
const relative = /^(inherit|[\d.]+em)$/;

test('every font-size in palace.css is a --p-text-* token', () => {
  const bad = [];
  for (const [, value] of css.matchAll(/(?<![\w-])font-size:\s*([^;}]+)/g)) {
    const v = value.trim();
    if (!token.test(v) && !relative.test(v)) bad.push(v);
  }
  assert.deepEqual(bad, []);
});

test('every font shorthand in palace.css takes its size from a --p-text-* token', () => {
  const bad = [];
  for (const [, value] of css.matchAll(/(?<![\w-])font:\s*([^;}]+)/g)) {
    const size = value.trim().match(/(\S+?)\//)?.[1] ?? value;
    if (!token.test(size)) bad.push(value.trim());
  }
  assert.deepEqual(bad, []);
});

test('the type scale runs 10, 11, 12, 13, 14, 16, 18, 24, 32 and 40px', () => {
  for (const [name, px] of Object.entries(scale)) {
    assert.match(css, new RegExp(`--p-text-${name}:\\s*${px}px;`));
  }
});

test('the line heights are tight 1.1, text 1.5 and prose 1.6', () => {
  assert.match(css, /--p-leading-tight:\s*1\.1;/);
  assert.match(css, /--p-leading:\s*1\.5;/);
  assert.match(css, /--p-leading-prose:\s*1\.6;/);
});

test('components render at their step', async () => {
  const page = await render(`
    <h1 id=h1>H</h1><h1 id=hero class=h1-hero>H</h1><h2 id=h2>H</h2><p id=body>Body</p>
    <label id=label>L</label><input id=input type=text><button id=btn>B</button><button id=lg class="btn btn-lg">B</button>
    <input id=num type=number><table><tr><th id=th>T</th><td id=td>t</td></tr></table><p id=hint class=field-hint>h</p>`);
  const sizes = await page.evaluate(() => Object.fromEntries(
    [...document.querySelectorAll('[id]')].map((el) => [el.id, getComputedStyle(el).fontSize]),
  ));
  await page.close();
  assert.deepEqual(sizes, {
    h1: '32px', hero: '40px', h2: '18px', body: '14px', label: '11px', input: '16px', btn: '13px',
    lg: '16px', num: '24px', th: '10px', td: '13px', hint: '12px',
  });
});

test('body text runs at 1.5 and a card paragraph at 1.6', async () => {
  const page = await render('<p id=body>Body</p><div class=card><p id=card>Card</p></div>');
  const lh = await page.evaluate(() => ['body', 'card'].map((id) => getComputedStyle(document.getElementById(id)).lineHeight));
  await page.close();
  assert.deepEqual(lh, ['21px', '22.4px']);
});

test('on a phone, h1 and stats take 2xl and the hero 3xl', async () => {
  const page = await render('<h1 id=h1>H</h1><h1 id=hero class=h1-hero>H</h1><div id=stat class=stat>1</div>', { width: 390 });
  const sizes = await page.evaluate(() => ['h1', 'hero', 'stat'].map((id) => getComputedStyle(document.getElementById(id)).fontSize));
  await page.close();
  assert.deepEqual(sizes, ['24px', '32px', '24px']);
});
