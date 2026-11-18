import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { render, close } from './render.js';

after(close);

const kinds = ['btn btn-primary', 'btn btn-secondary', 'btn btn-outline', 'btn btn-danger', 'btn btn-danger-fill', 'cta cta-primary', 'cta cta-secondary', 'btn btn-sm btn-primary'];

// Focus by keyboard, so :focus-visible matches; hover with the mouse.
const state = async (cls, { focus = false, hover = false } = {}) => {
  const page = await render(`<p style="padding:40px"><button id=a>A</button> <button id=b class="${cls}">Go</button></p>`);
  if (focus) { await page.focus('#a'); await page.keyboard.press('Tab'); }
  if (hover) await page.hover('#b');
  await page.evaluate(() => Promise.allSettled(document.getAnimations().map((a) => a.finished)));
  const s = await page.$eval('#b', (el) => {
    const cs = getComputedStyle(el);
    return { transform: cs.transform, boxShadow: cs.boxShadow, outlineStyle: cs.outlineStyle, outlineOffset: cs.outlineOffset, outlineColor: cs.outlineColor };
  });
  await page.close();
  return s;
};

const violet = 'rgb(91, 76, 255)';
const spread = (shadow) => shadow.match(/(-?[\d.]+px) (-?[\d.]+px) (-?[\d.]+px) (-?[\d.]+px)$/).slice(1);

for (const cls of kinds) {
  test(`a focused .${cls.split(' ').at(-1)} is a violet ring 2px out, with no lift and no shadow`, async () => {
    const s = await state(cls, { focus: true });
    assert.deepEqual(s, { transform: 'none', boxShadow: 'none', outlineStyle: 'solid', outlineOffset: '2px', outlineColor: violet });
  });

  test(`a focused and hovered .${cls.split(' ').at(-1)} keeps hover's lift and shadow, the ring on its edge`, async () => {
    const hover = await state(cls, { hover: true });
    const both = await state(cls, { focus: true, hover: true });
    assert.equal(both.transform, hover.transform);
    assert.notEqual(hover.transform, 'none');
    assert.equal(both.outlineOffset, '0px');
    assert.equal(both.outlineColor, violet);
    // Same colour and offset as hover's shadow; it grows by the ring's 2px to start outside it.
    const [hx, hy, hb, hs] = spread(hover.boxShadow);
    assert.deepEqual(spread(both.boxShadow), [hx, hy, hb, '2px']);
    assert.equal(hs, '0px');
    assert.equal(both.boxShadow.replace(/ -?[\d.]+px$/, ''), hover.boxShadow.replace(/ -?[\d.]+px$/, ''));
  });
}

test('a focused button inside .input-action has its ring on its edge', async () => {
  const page = await render('<div class=input-action><input type=password id=i><button id=b class="btn btn-sm btn-outline">Show</button></div>');
  await page.focus('#i');
  await page.keyboard.press('Tab');
  const s = await page.$eval('#b', (el) => [document.activeElement === el, getComputedStyle(el).outlineOffset]);
  await page.close();
  assert.deepEqual(s, [true, '0px']);
});

test('.btn-danger-fill: the error fill, a black label and border; dark with a red label on hover', async () => {
  const page = await render('<p style="padding:40px"><button id=b class="btn btn-danger-fill">Delete</button></p>');
  const get = () => page.$eval('#b', (el) => { const cs = getComputedStyle(el); return [cs.backgroundColor, cs.color, cs.borderTopColor, cs.boxShadow]; });
  const rest = await get();
  await page.hover('#b');
  await page.evaluate(() => Promise.allSettled(document.getAnimations().map((a) => a.finished)));
  const hover = await get();
  await page.close();
  assert.deepEqual(rest, ['rgb(255, 68, 68)', 'rgb(10, 10, 10)', 'rgb(10, 10, 10)', 'none']);
  assert.deepEqual(hover, ['rgb(10, 10, 10)', 'rgb(255, 68, 68)', 'rgb(10, 10, 10)', 'rgb(255, 68, 68) 3px 3px 0px 0px']);
});

test('a disabled .btn-danger-fill takes the shared disabled look', async () => {
  const page = await render('<button id=b class="btn btn-danger-fill" disabled>Delete</button><button id=p class="btn btn-primary" disabled>Save</button>');
  const looks = await page.evaluate(() => ['b', 'p'].map((id) => { const cs = getComputedStyle(document.getElementById(id)); return [cs.backgroundColor, cs.color, cs.borderTopColor]; }));
  await page.close();
  assert.deepEqual(looks[0], looks[1]);
});

test('a focused field keeps an outline in forced-colors mode, and none otherwise', async () => {
  const page = await render('<input id=t type=text><select id=s><option>x</select><input id=n type=number><textarea id=a></textarea><input id=e type=email>');
  const styles = async () => {
    const out = [];
    for (const id of ['t', 's', 'n', 'a', 'e']) {
      await page.focus('#' + id);
      await page.evaluate(() => Promise.allSettled(document.getAnimations().map((a) => a.finished)));
      out.push(await page.$eval('#' + id, (el) => getComputedStyle(el).outlineStyle));
    }
    return out;
  };
  const normal = await styles();
  await page.emulateMedia({ forcedColors: 'active' });
  const forced = await styles();
  await page.close();
  assert.deepEqual(normal, ['none', 'none', 'none', 'none', 'none']);
  assert.deepEqual(forced, ['solid', 'solid', 'solid', 'solid', 'solid']);
});
