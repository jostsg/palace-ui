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
