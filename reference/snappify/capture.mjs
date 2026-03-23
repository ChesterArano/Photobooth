import { chromium } from 'playwright';
import path from 'node:path';

const url = process.argv[2] ?? 'https://snappify-photobooth.vercel.app/';

async function dumpButtons(page, label) {
  const buttons = page.locator('button');
  const count = await buttons.count();
  const texts = [];
  for (let i = 0; i < count; i += 1) {
    const text = (await buttons.nth(i).innerText()).trim().replace(/\s+/g, ' ');
    if (text) texts.push(text);
  }
  console.log(`\n[${label}] buttons (${texts.length}):`);
  for (const text of texts) console.log(`- ${text}`);
}

async function getToolbarButtons(page) {
  // Bottom fixed toolbar (desktop + mobile variants exist; pick the first visible one)
  const toolbar = page.locator('div.fixed.bottom-4').filter({ has: page.locator('button') }).first();
  const buttons = toolbar.locator('button');
  return { toolbar, buttons };
}

const localAppData = process.env.LOCALAPPDATA;
const bundledChrome = localAppData
  ? path.join(localAppData, 'ms-playwright', 'chromium-1208', 'chrome-win64', 'chrome.exe')
  : undefined;

const browser = await chromium.launch({
  headless: true,
  executablePath: bundledChrome,
  args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
});

const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
});

await context.grantPermissions(['camera', 'microphone'], { origin: new URL(url).origin });

const page = await context.newPage();

console.log('Loading:', url);
await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
await page.waitForTimeout(500);

await dumpButtons(page, 'landing');
await page.screenshot({ path: 'landing.png', fullPage: true });

const startButton = page.getByRole('button', { name: /start/i });
if (await startButton.count()) {
  console.log('Clicking START...');
  await startButton.first().click();
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1500);

  await dumpButtons(page, 'after-start');
  await page.screenshot({ path: 'after-start.png', fullPage: true });

  const html = await page.content();
  const fs = await import('node:fs/promises');
  await fs.writeFile('after-start.html', html, 'utf8');

  const { buttons: toolbarButtons } = await getToolbarButtons(page);
  const toolbarCount = await toolbarButtons.count();
  console.log(`Toolbar buttons found: ${toolbarCount}`);

  if (toolbarCount >= 1) {
    console.log('Clicking Settings (left toolbar button)...');
    await toolbarButtons.nth(0).click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'settings.png', fullPage: true });
  }

  if (toolbarCount >= 2) {
    console.log('Starting capture (middle toolbar button)...');
    await toolbarButtons.nth(1).click({ timeout: 5000 }).catch(() => {});

    // Wait for print button to become enabled (or timeout)
    if (toolbarCount >= 3) {
      const printButton = toolbarButtons.nth(2);
      const start = Date.now();
      while (Date.now() - start < 30000) {
        const disabled = await printButton.isDisabled();
        if (!disabled) break;
        await page.waitForTimeout(500);
      }
    } else {
      await page.waitForTimeout(8000);
    }

    await page.waitForTimeout(500);
    await page.screenshot({ path: 'after-capture.png', fullPage: true });
  }

  if (toolbarCount >= 3) {
    const printButton = toolbarButtons.nth(2);
    const disabled = await printButton.isDisabled();
    console.log('Print enabled:', !disabled);
    if (!disabled) {
      console.log('Clicking Print (right toolbar button)...');
      await printButton.click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(800);
      await page.screenshot({ path: 'print.png', fullPage: true });
    }
  }
} else {
  console.log('START button not found by role/name.');
}

await browser.close();
console.log('Saved screenshots to:', process.cwd());
