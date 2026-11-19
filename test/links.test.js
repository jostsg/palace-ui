import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { render, close } from './render.js';

after(close);

const kinds = ['btn btn-primary', 'btn btn-secondary', 'btn btn-outline', 'btn btn-danger', 'btn btn-danger-fill', 'cta cta-primary', 'cta cta-secondary'];

// A link styled as a button looks like the button, hovered too: the links' own hover colours never show through.
const hovered = async (tag, cls) => {
  const page = await render(`<p style="padding:40px"><${tag} id=b class="${cls}" href="#">Go</${tag}></p>`);
  await page.hover('#b');
  await page.evaluate(() => Promise.allSettled(document.getAnimations().map((a) => a.finished)));
  const s = await page.$eval('#b', (el) => {
    const cs = getComputedStyle(el);
    return { color: cs.color, background: cs.backgroundColor, border: ['Top', 'Right', 'Bottom', 'Left'].map((side) => cs[`border${side}Color`]) };
  });
  await page.close();
  return s;
};

for (const cls of kinds) {
  test(`a hovered a.${cls.split(' ').at(-1)} looks like the hovered button`, async () => {
    assert.deepEqual(await hovered('a', cls), await hovered('button', cls));
  });
}
