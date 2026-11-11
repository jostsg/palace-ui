import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { render, close, box } from './render.js';

after(close);

const sizes = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, '2xl': 48 };

async function between(cls) {
  const page = await render(`<div class="${cls}"><p id=a>a</p><p id=b>b</p></div>`);
  const [a, b] = [await box(page, '#a'), await box(page, '#b')];
  await page.close();
  return b.top - a.bottom;
}

for (const [size, px] of Object.entries(sizes)) {
  test(`space-${size} puts ${px}px between children`, async () => {
    assert.equal(await between(`space-${size}`), px);
  });

  test(`gap-${size} sets gap ${px}px`, async () => {
    const page = await render(`<div id=a class="gap-${size}" style="display:flex"><p>a</p><p>b</p></div>`);
    const gaps = await page.$eval('#a', (el) => {
      const s = getComputedStyle(el);
      return [s.columnGap, s.rowGap];
    });
    await page.close();
    assert.deepEqual(gaps, [`${px}px`, `${px}px`]);
  });
}

test('stack-lg still spaces like space-lg', async () => {
  assert.equal(await between('stack-lg'), 24);
});

test("space-md wins over an element's own margin", async () => {
  const page = await render(
    '<div class="navbar-menu-panel space-md"><p id=a>a</p><ul id=b><li>x</li></ul></div>',
  );
  const [a, b] = [await box(page, '#a'), await box(page, '#b')];
  await page.close();
  assert.equal(b.top - a.bottom, 16);
});
