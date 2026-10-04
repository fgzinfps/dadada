// Renderiza cada post HTML em PNG 1080×1350.
// Uso: node render.mjs            (todos)
//      node render.mjs 01 04      (só os que começam com esses prefixos)
import { chromium } from "playwright";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));
const only = process.argv.slice(2);
const files = readdirSync(dir)
  .filter((f) => /^\d\d-.*\.html$/.test(f))
  .filter((f) => !only.length || only.some((p) => f.startsWith(p)))
  .sort();

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
for (const f of files) {
  await page.goto("file://" + path.join(dir, f));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  const out = path.join(dir, "png", f.replace(".html", ".png"));
  await page.screenshot({ path: out });
  console.log("ok", out);
}
await browser.close();
