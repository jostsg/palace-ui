import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../palace.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

test('every box-shadow offset in palace.css is a --p-shadow-* token', () => {
  const bad = [];
  for (const [, value] of css.matchAll(/box-shadow:\s*([^;}]+)/g)) {
    const v = value.trim();
    if (v === 'none' || v.startsWith('inset ') || /^var\(--p-shadow-(xs|sm|md|lg)\)/.test(v)) continue;
    bad.push(v);
  }
  assert.deepEqual(bad, []);
});

test('the shadow sizes are xs 1px, sm 2px, md 3px, lg 4px', () => {
  for (const [name, px] of [['xs', 1], ['sm', 2], ['md', 3], ['lg', 4]]) {
    assert.match(css, new RegExp(`--p-shadow-${name}:\\s*${px}px ${px}px 0;`));
  }
});

test('.card-static keeps the large text shadow at rest and on hover', () => {
  for (const sel of ['\\.card-static', '\\.card-static:hover']) {
    const rule = css.match(new RegExp(`${sel}\\s*\\{([^}]*)\\}`))[1];
    assert.match(rule, /box-shadow:\s*var\(--p-shadow-lg\) var\(--p-text\);/);
  }
});

test('.navbar-menu-panel takes the large accent shadow', () => {
  const rule = css.match(/\.navbar-menu-panel\s*\{([^}]*)\}/)[1];
  assert.match(rule, /box-shadow:\s*var\(--p-shadow-lg\) var\(--p-accent-2\);/);
});
