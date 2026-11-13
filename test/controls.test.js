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
  assert.ok(h < 44, `height ${h}`);
  assert.ok(Math.abs(h - (16 + 13 * 1.4)) < 0.5, `height ${h}`);
});

test('a long label wraps inside its button, in a link and a button alike', async () => {
  const page = await render(
    '<div style="width:120px"><a id=a class="btn btn-block" href="#">Save and continue to next</a><button id=b class="btn-block">Save and continue to next</button></div>',
  );
  const out = [];
  for (const s of ['#a', '#b']) {
    out.push(await page.$eval(s, (el) => ({ h: el.getBoundingClientRect().height, spill: el.scrollHeight - el.clientHeight })));
  }
  await page.close();
  for (const o of out) {
    assert.ok(o.h > 44, `height ${o.h}`);
    assert.ok(o.spill <= 0.5, `spill ${o.spill}`);
  }
  assert.equal(out[0].h, out[1].h);
});

test('a bare button in .input-action is small and centred', async () => {
  const page = await render('<div class="input-action"><input type=password id=i><button id=b>Show</button></div>');
  const [i, b] = [await box(page, '#i'), await box(page, '#b')];
  await page.close();
  assert.equal(b.height, 32);
  assert.equal(b.top - i.top, i.bottom - b.bottom);
});

test('a multiple select grows past one control', async () => {
  const [h] = await heights('<select id=s multiple><option>a<option>b<option>c<option>d</select>', ['#s']);
  assert.ok(h > 44, `height ${h}`);
});

test('a field spaces label, control and hint by 8px', async () => {
  const page = await render(
    '<div class="field"><label id=l>Name</label><input type=text id=i><p class="field-hint" id=h>Hint</p></div>',
  );
  const [l, i, h] = [await box(page, '#l'), await box(page, '#i'), await box(page, '#h')];
  await page.close();
  assert.equal(i.top - l.bottom, 8);
  assert.equal(h.top - i.bottom, 8);
});

test('an invalid control and its error', async () => {
  const page = await render(
    '<div class="field"><label>x</label><input type=text aria-invalid="true" id=i><p class="field-error" id=e>Wrong</p></div>',
  );
  const border = await page.$eval('#i', (el) => getComputedStyle(el).borderTopColor);
  const color = await page.$eval('#e', (el) => getComputedStyle(el).color);
  await page.close();
  assert.equal(border, 'rgb(196, 0, 0)');
  assert.equal(color, 'rgb(196, 0, 0)');
});

test('a control-row lines up a field and buttons at the bottom', async () => {
  const page = await render(
    '<form class="control-row"><div class="field" id=f><label>Driver</label><select id=s><option>x</select></div><button id=b>Assign</button></form>',
  );
  const [s, b, f] = [await box(page, '#s'), await box(page, '#b'), await box(page, '#f')];
  await page.close();
  assert.equal(s.bottom, b.bottom);
  assert.ok(f.width > b.width, `${f.width} vs ${b.width}`);
});

test('a control-row wraps at 320px without overflow', async () => {
  const page = await render(
    `<form class="control-row"><div class="field"><label>Driver</label><select><option>x</select></div>
     <button>Assign this driver to the transponder now</button><a class="btn" href="#">Cancel and go back to the list</a></form>`,
    { width: 320 },
  );
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  await page.close();
  assert.ok(sw <= 320, `scrollWidth ${sw}`);
});

test('an input-action sits in a field as its control', async () => {
  const page = await render(
    '<div class="field"><label id=l>Key</label><div class="input-action" id=a><input type=password><button>Show</button></div></div>',
  );
  const [l, a] = [await box(page, '#l'), await box(page, '#a')];
  await page.close();
  assert.equal(a.top - l.bottom, 8);
});

for (const focused of [false, true]) {
  for (const [name, html] of [
    ['text input', '<input type=text id=c aria-invalid="true">'],
    ['number input', '<input type=number id=c aria-invalid="true">'],
    ['select', '<select id=c aria-invalid="true"><option>x</select>'],
    ['textarea', '<textarea id=c aria-invalid="true"></textarea>'],
  ]) {
    if (!focused && name.endsWith('input')) continue;
    test(`an invalid ${name} keeps its error border${focused ? ' and shadow when focused' : ''}`, async () => {
      const page = await render(html);
      if (focused) {
        await page.focus('#c');
        await page.evaluate(() => Promise.allSettled(document.getAnimations().map((a) => a.finished)));
      }
      const s = await page.$eval('#c', (el) => ({ b: getComputedStyle(el).borderTopColor, sh: getComputedStyle(el).boxShadow }));
      await page.close();
      assert.equal(s.b, 'rgb(196, 0, 0)');
      if (focused) assert.match(s.sh, /^rgb\(196, 0, 0\)/);
    });
  }
}

test('a button keeps the spaces between its inline children', async () => {
  const page = await render(
    `<button id=a>Save <strong>now</strong></button> <button id=b>Save<strong>now</strong></button>
     <a class="btn" id=l href="#"><span id=s>Pair</span> <kbd id=k>P</kbd></a>
     <a class="cta cta-primary" id=c href="#"><span id=cs>Start</span> <kbd id=ck>S</kbd></a>`,
  );
  const [a, b, s, k, cs, ck] = await Promise.all(['#a', '#b', '#s', '#k', '#cs', '#ck'].map((sel) => box(page, sel)));
  await page.close();
  assert.ok(a.width > b.width, `${a.width} vs ${b.width}`);
  assert.ok(k.left - s.right > 0, `gap ${k.left - s.right}`);
  assert.ok(ck.left - cs.right > 0, `gap ${ck.left - cs.right}`);
});

test("a control-row's error goes below the row and leaves the button in line", async () => {
  const page = await render(
    `<div class="space-sm"><form class="control-row"><div class="field"><label>Name</label><input type=text id=i aria-invalid="true"></div>
     <button id=b>Save</button></form><p class="field-error">Wrong</p></div>`,
  );
  const [i, b] = [await box(page, '#i'), await box(page, '#b')];
  await page.close();
  assert.equal(i.bottom, b.bottom);
});

test('an input-action grows in a control-row', async () => {
  const page = await render(
    '<form class="control-row"><div class="input-action" id=a><input type=password><button>Show</button></div><button>Save</button></form>',
  );
  const a = await box(page, '#a');
  await page.close();
  assert.ok(a.width > 500, `width ${a.width}`);
});

test('a textarea grows in a control-row', async () => {
  const page = await render('<form class="control-row"><textarea id=t></textarea><button>Save</button></form>');
  const t = await box(page, '#t');
  await page.close();
  assert.ok(t.width > 500, `width ${t.width}`);
});

for (const type of ['checkbox', 'radio']) {
  test(`a focused invalid ${type} gets no error shadow`, async () => {
    const page = await render(`<input type=${type} id=c aria-invalid="true">`);
    await page.focus('#c');
    await page.evaluate(() => Promise.allSettled(document.getAnimations().map((a) => a.finished)));
    const sh = await page.$eval('#c', (el) => getComputedStyle(el).boxShadow);
    await page.close();
    assert.doesNotMatch(sh, /rgb\(196, 0, 0\)/);
  });
}

test('a button with a key in its label stays one control tall', async () => {
  const hs = await heights(
    `<button id=a>Pair <kbd>P</kbd></button><a class="btn" id=b href="#">Pair <kbd>P</kbd></a>
     <button class="btn btn-sm" id=c>Pair <kbd>P</kbd></button><a class="btn btn-lg" id=d href="#">Pair <kbd>P</kbd></a>`,
    ['#a', '#b', '#c', '#d'],
  );
  assert.deepEqual(hs, [44, 44, 32, 52]);
});

for (const [name, html] of [
  ['a link button', '<a class="btn btn-sm" href="#" id=b><span id=t>Show</span></a>'],
  ['a small button', '<button class="btn btn-sm" id=b><span id=t>Show</span></button>'],
  ['a bare button', '<button id=b><span id=t>Show</span></button>'],
]) {
  test(`${name} in .input-action centres its label`, async () => {
    // The label sits where it sits in the same button on its own: font metrics
    // put a text box a fraction off centre, the layout must add nothing.
    const offset = async (markup) => {
      const page = await render(markup);
      const [b, t] = [await box(page, '#b'), await box(page, '#t')];
      await page.close();
      return { height: b.height, offset: (t.top + t.bottom) / 2 - (b.top + b.bottom) / 2 };
    };
    const inside = await offset(`<div class="input-action"><input type=password id=i>${html}</div>`);
    const alone = await offset(html.replace('<button id=b>', '<button class="btn-sm" id=b>'));
    assert.equal(inside.height, 32);
    assert.ok(Math.abs(inside.offset - alone.offset) <= 0.5, `inside ${inside.offset}, alone ${alone.offset}`);
  });
}

test('a key keeps dark text in a button with white text', async () => {
  const page = await render('<button class="btn btn-primary">Pair <kbd id=k>P</kbd></button>');
  const color = await page.$eval('#k', (el) => getComputedStyle(el).color);
  await page.close();
  assert.equal(color, 'rgb(10, 10, 10)');
});

test('filled controls take their text from --p-text-on-fill', async () => {
  const html = `<button id=a class="btn btn-primary">x</button><button id=b class="btn btn-secondary">x</button>
    <a id=c class="cta cta-primary" href="#">x</a><span id=d class="badge">x</span><span id=e class="tag-sticker">x</span>
    <div id=f class="code-reveal">x</div><a id=g class="navbar-brand" href="#">x</a>`;
  const page = await render(html);
  const colours = await page.$$eval('#a,#b,#c,#d,#e,#f,#g', (els) => els.map((el) => getComputedStyle(el).color));
  assert.deepEqual(colours, Array(7).fill('rgb(255, 255, 255)'));
  await page.addStyleTag({ content: ':root { --p-text-on-fill: rgb(1, 2, 3); }' });
  await page.evaluate(() => Promise.allSettled(document.getAnimations().map((a) => a.finished)));
  const changed = await page.$$eval('#a,#b,#c,#d,#e,#f,#g', (els) => els.map((el) => getComputedStyle(el).color));
  await page.close();
  assert.deepEqual(changed, Array(7).fill('rgb(1, 2, 3)'));
});

test('a navbar menu summary is as tall as a small button beside it', async () => {
  const page = await render(
    `<nav class="navbar"><div class="navbar-right"><details class="navbar-menu"><summary id=s>Username</summary></details>
     <button id=b class="btn btn-sm">Log Out</button></div></nav>`,
  );
  const [s, b] = [await box(page, '#s'), await box(page, '#b')];
  await page.close();
  assert.equal(s.height, 32);
  assert.equal(s.height, b.height);
  assert.equal(s.top, b.top);
});

test('a long navbar menu label still truncates, without the default marker', async () => {
  const page = await render(
    `<nav class="navbar"><div class="navbar-right"><details class="navbar-menu"><summary id=s>An extremely long account name that cannot fit</summary></details></div></nav>`,
  );
  const r = await page.$eval('#s', (el) => ({ w: el.getBoundingClientRect().width, sw: el.scrollWidth, ls: getComputedStyle(el).listStyleType, h: el.getBoundingClientRect().height }));
  await page.close();
  assert.equal(r.ls, 'none');
  assert.equal(r.h, 32);
  assert.ok(r.w <= 224, `width ${r.w}`);
});

test('a small tag is a smaller .tag', async () => {
  const page = await render('<span id=a class="tag">Tag</span><span id=b class="tag tag-sm">Tag</span>');
  const [a, b] = await Promise.all(
    ['#a', '#b'].map((s) =>
      page.$eval(s, (el) => {
        const c = getComputedStyle(el);
        return { size: c.fontSize, pad: `${c.paddingTop} ${c.paddingRight}`, border: c.borderTopWidth };
      }),
    ),
  );
  await page.close();
  assert.equal(a.size, '12px');
  assert.deepEqual(b, { size: '11px', pad: '2px 6px', border: a.border });
});

test('a small input and select match .btn-sm in a control row', async () => {
  const page = await render(
    `<div class="control-row"><input id=a type=search class="input-sm"><select id=b class="input-sm"><option>x</select>
     <input id=c type=text class="input-sm"><button id=d class="btn btn-sm">Go</button></div>`,
  );
  const bs = [];
  for (const s of ['#a', '#b', '#c', '#d']) bs.push(await box(page, s));
  await page.close();
  assert.deepEqual(bs.map((b) => b.height), [32, 32, 32, 32]);
  assert.deepEqual(bs.map((b) => b.top), [bs[0].top, bs[0].top, bs[0].top, bs[0].top]);
});

test('a small select leaves room for its caret; coarse pointers get 16px text', async () => {
  const page = await render('<select id=s class="input-sm"><option>x</select><input id=i type=text class="input-sm">');
  const pad = await page.$eval('#s', (el) => getComputedStyle(el).paddingRight);
  const fine = await page.$eval('#i', (el) => getComputedStyle(el).fontSize);
  await page.close();
  assert.equal(pad, '28px');
  assert.equal(fine, '13px');
  const { chromium } = await import('playwright-core');
  const b = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await b.newContext({ hasTouch: true, isMobile: true, viewport: { width: 500, height: 600 } });
  const p = await ctx.newPage();
  await p.setContent('<input id=i type=text class="input-sm"><select id=s class="input-sm"><option>x</select>');
  await p.addStyleTag({ path: new URL('../palace.css', import.meta.url).pathname });
  await p.evaluate(() => Promise.allSettled(document.getAnimations().map((a) => a.finished)));
  const sizes = await p.$$eval('#i,#s', (els) => els.map((e) => [getComputedStyle(e).fontSize, e.getBoundingClientRect().height]));
  await b.close();
  assert.deepEqual(sizes, [['16px', 32], ['16px', 32]]);
});

test('checkbox and radio labels are sentence case; field labels stay uppercase', async () => {
  const page = await render(
    `<label id=a><input type=checkbox> Email me when my record falls</label>
     <label id=b><input type=radio name=r> Clockwise</label>
     <label id=c for=t>Name</label><input id=t type=text>
     <label id=d for=k>Beside</label><input id=k type=checkbox>`,
  );
  const st = await page.$$eval('#a,#b,#c,#d', (els) =>
    els.map((el) => {
      const c = getComputedStyle(el);
      return [c.textTransform, c.letterSpacing];
    }),
  );
  await page.close();
  assert.deepEqual(st[0], ['none', 'normal']);
  assert.deepEqual(st[1], ['none', 'normal']);
  assert.deepEqual(st[2], ['uppercase', '1px']);
  assert.deepEqual(st[3], ['uppercase', '1px']); // a for= label beside its checkbox keeps the field-label style
});
