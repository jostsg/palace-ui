import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';

const css = fileURLToPath(new URL('../palace.css', import.meta.url));
let browser;

export async function render(html, { width = 800 } = {}) {
  browser ??= await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width, height: 600 } });
  await page.setContent(html);
  await page.addStyleTag({ path: css });
  // Controls and cards transition when the stylesheet lands; measure once they settle.
  await page.evaluate(() => Promise.allSettled(document.getAnimations().map((a) => a.finished)));
  return page;
}

export async function close() {
  await browser?.close();
  browser = undefined;
}

export function box(page, selector) {
  return page.$eval(selector, (el) => {
    const { top, bottom, left, right, height, width } = el.getBoundingClientRect();
    return { top, bottom, left, right, height, width };
  });
}
