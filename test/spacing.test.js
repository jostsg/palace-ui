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

test('a card in space-md is 16px from the next card', async () => {
  const page = await render(
    '<div class="space-md"><div class="card" id=a>a</div><div class="card" id=b>b</div></div>',
  );
  const [a, b] = [await box(page, '#a'), await box(page, '#b')];
  await page.close();
  assert.equal(b.top - a.bottom, 16);
});

test('a card in a gap-md grid is 16px from the next', async () => {
  const page = await render(
    '<div class="gap-md" style="display:grid"><div class="card" id=a>a</div><div class="card" id=b>b</div></div>',
  );
  const [a, b] = [await box(page, '#a'), await box(page, '#b')];
  await page.close();
  assert.equal(b.top - a.bottom, 16);
});

test('components set no outer margin', async () => {
  const page = await render(`
    <div class="card">a</div><div class="card-static">b</div><label>c</label>
    <div class="stat-row">d</div>
    <div class="page-header"><h1>t</h1><p class="subtitle">s</p></div>`);
  for (const sel of ['.card', '.card-static', 'label', '.stat-row']) {
    const m = await page.$eval(sel, (el) => {
      const s = getComputedStyle(el);
      return [s.marginTop, s.marginBottom];
    });
    assert.deepEqual(m, ['0px', '0px'], sel);
  }
  // Inside a page-header the subtitle gets 8px above it from the header, never below.
  for (const sel of ['.page-header .subtitle', '.page-header h1']) {
    assert.equal(await page.$eval(sel, (el) => getComputedStyle(el).marginBottom), '0px', sel);
  }
  assert.equal(await page.$eval('.page-header h1', (el) => getComputedStyle(el).marginTop), '0px');
  await page.close();
});

test('a dialog spaces its own children', async () => {
  const page = await render(
    '<dialog open><h2 id=a>t</h2><p class="subtitle" id=b>s</p><p id=c>c</p><menu id=d><li>x</li></menu></dialog>',
  );
  const [a, b, c, d] = [await box(page, '#a'), await box(page, '#b'), await box(page, '#c'), await box(page, '#d')];
  await page.close();
  assert.deepEqual([b.top - a.bottom, c.top - b.bottom, d.top - c.bottom], [4, 24, 24]);
});

test('.page-header keeps 8px between its heading and subtitle', async () => {
  const page = await render('<div class="page-header"><h1 id=a>t</h1><p class="subtitle" id=b>s</p></div>');
  const [a, b] = [await box(page, '#a'), await box(page, '#b')];
  await page.close();
  assert.equal(b.top - a.bottom, 8);
});

test('list items and code-reveal keep their inside spacing', async () => {
  const page = await render(
    '<div class="container"><ul><li id=a>a</li><li id=b>b</li></ul></div><div class="code-reveal"><p id=c>c</p><code id=d>d</code></div>',
  );
  const [a, b, c, d] = [await box(page, '#a'), await box(page, '#b'), await box(page, '#c'), await box(page, '#d')];
  await page.close();
  assert.equal(b.top - a.bottom, 4);
  assert.equal(d.top - c.bottom, 8);
});
