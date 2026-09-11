import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
const { chromium } = await import(pathToFileURL('C:/Users/aleks/AppData/Local/Temp/gev-worldmonitor-discovery/node_modules/playwright/index.mjs').href);

const base = 'http://localhost:4187';
const out = 'C:/Users/aleks/Projects/gods-eye-view/docs/discovery';
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await context.addInitScript(() => localStorage.setItem('worldmonitor-map-mode', JSON.stringify('globe')));
const page = await context.newPage();
const consoleErrors = [];
page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('pageerror', err => consoleErrors.push(`pageerror: ${err.message}`));

async function snapshot(label, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('#mapContainer', { timeout: 30000 });
  await page.waitForTimeout(7000);
  if (await page.locator('.map-dim-btn[title="3D Globe"]').isVisible()) {
    await page.locator('.map-dim-btn[title="3D Globe"]').click();
    await page.waitForSelector('#mapContainer.globe-mode', { timeout: 30000 });
    await page.waitForTimeout(2500);
  }
  const state = await page.evaluate(() => {
    const map = document.querySelector('#mapContainer');
    const canvas = map?.querySelector('canvas');
    const visibleDialogs = [...document.querySelectorAll('[role=dialog], .modal, .panel')]
      .filter(el => { const s = getComputedStyle(el); return s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0'; })
      .map(el => ({ cls: el.className, text: (el.textContent || '').trim().slice(0, 120) }));
    const controls = [...document.querySelectorAll('button')].map(b => ({
      text: (b.innerText || '').trim(), aria: b.getAttribute('aria-label'), title: b.title,
      cls: b.className, visible: getComputedStyle(b).display !== 'none'
    })).filter(x => x.visible && (x.text || x.aria || x.title) && /3D Globe|2D Map|Zoom|Reset|Close menu|SETTINGS/i.test(`${x.text} ${x.aria} ${x.title}`));
    const interestingWindowKeys = Object.keys(window).filter(k => /map|globe|debug|worldmonitor/i.test(k));
    return {
      href: location.href, mapClass: map?.className, mapText: map?.textContent?.trim().slice(0, 300),
      canvas: canvas ? { width: canvas.width, height: canvas.height, rect: canvas.getBoundingClientRect().toJSON() } : null,
      controls, visibleDialogs, interestingWindowKeys,
      bodyText: document.body.innerText.slice(0, 1200)
    };
  });
  await page.screenshot({ path: `${out}/borders-${label}.png`, fullPage: false });
  return state;
}

const report = { generatedAt: new Date().toISOString(), cases: {}, consoleErrors };
report.cases.urlIran = await snapshot('diagnostic-url-iran', `${base}/?lat=32&lon=53&zoom=4`);
// Use the actual visible map controls only; this second URL tests the requested Tehran target.
report.cases.tehranUrl = await snapshot('tehran', `${base}/?lat=35.689&lon=51.389&zoom=7`);
report.cases.hormuzUrl = await snapshot('hormuz', `${base}/?lat=26.6&lon=56.3&zoom=7`);
fs.writeFileSync(`${out}/globe-border-diagnostic.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
