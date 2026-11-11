import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { render, close, box } from './render.js';

after(close);

const heights = async (html, selectors) => {
  const page = await render(html);
  const out = [];
  for (const s of selectors) out.push((await box(page, s)).height);
  await page.close();
  return out;
};

test('controls share one height', async () => {
  const hs = await heights(
    `<input id=a type=text><input id=b type=email value="a very long value that overflows">
     <input id=c type=password><select id=d><option>x</select><input id=e type=number>
     <button id=f>Go</button><a id=g class="btn" href="#">Go</a>`,
    ['#a', '#b', '#c', '#d', '#e', '#f', '#g'],
  );
  assert.deepEqual(hs, [44, 44, 44, 44, 44, 44, 44]);
});

test('small and large buttons', async () => {
  const hs = await heights(
    `<button id=a class="btn-sm">Go</button><a id=b class="btn btn-sm" href="#">Go</a>
     <button id=c class="btn-lg">Go</button><a id=d class="cta cta-primary" href="#">Go</a>`,
    ['#a', '#b', '#c', '#d'],
  );
  assert.deepEqual(hs, [32, 32, 52, 52]);
});

test('a field and a button in a flex row line up', async () => {
  const page = await render(
    '<div style="display:flex;align-items:end"><input type=text id=i><button id=b>Go</button><a class=btn id=l href="#">Go</a></div>',
  );
  const bs = [await box(page, '#i'), await box(page, '#b'), await box(page, '#l')];
  await page.close();
  assert.deepEqual(bs.map((b) => b.top), [bs[0].top, bs[0].top, bs[0].top]);
  assert.deepEqual(bs.map((b) => b.bottom), [bs[0].bottom, bs[0].bottom, bs[0].bottom]);
});

test('textarea is at least one control tall', async () => {
  const [h] = await heights('<textarea id=t></textarea>', ['#t']);
  assert.ok(h >= 44, `height ${h}`);
});

test("input-action's button sits inside the field", async () => {
  const page = await render(
    '<div class="input-action"><input type=password id=i><button class="btn btn-sm" id=b>Show</button></div>',
  );
  const [i, b] = [await box(page, '#i'), await box(page, '#b')];
  await page.close();
  assert.equal(b.top - i.top, i.bottom - b.bottom);
  assert.equal(i.right - b.right, 8);
});

test('a navbar menu panel button keeps its own height', async () => {
  const [h] = await heights('<div class="navbar-menu-panel"><button id=a>Sign out</button></div>', ['#a']);
  assert.equal(h, 34.1875);
});
