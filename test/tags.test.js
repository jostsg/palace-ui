import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { render, close } from './render.js';

after(close);

const props = ['-webkit-text-fill-color', 'color', 'text-transform', 'letter-spacing', 'line-height', 'background-color', 'height'];

const looks = async (html) => {
  const page = await render(html);
  const out = await page.evaluate((props) => Object.fromEntries(
    [...document.querySelectorAll('[id]')].map((el) => {
      const cs = getComputedStyle(el);
      return [el.id, Object.fromEntries(props.map((p) => [p, p === 'height' ? el.offsetHeight : cs.getPropertyValue(p)]))];
    }),
  ), props);
  await page.close();
  return out;
};

for (const kind of ['tag', 'tag tag-sm', 'badge', 'tag-sticker']) {
  test(`a .${kind.replace(' ', '.')} inside a heading looks as it does outside one`, async () => {
    const tag = (id) => `<span id=${id} class="${kind}">Practice</span>`;
    const l = await looks(`
      <p>${tag('body')}</p>
      <h1>Track ${tag('h1')}</h1><div class=h1>Track ${tag('dotH1')}</div>
      <h2>Track ${tag('h2')}</h2><h3>Track ${tag('h3')}</h3>
      <div class=card style="--accent: var(--p-accent-1)"><h2>Track ${tag('card')}</h2></div>`);
    for (const id of ['h1', 'dotH1', 'h2', 'h3', 'card']) assert.deepEqual(l[id], l.body, id);
  });
}

test('a tag inside an h1 has a visible fill', async () => {
  const l = await looks('<h1>Track <span id=t class=tag>Practice</span></h1>');
  assert.notEqual(l.t['-webkit-text-fill-color'], 'rgba(0, 0, 0, 0)');
});
