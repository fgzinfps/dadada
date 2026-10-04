// Renderiza só a moldura (sem a cena) em PNG transparente 2x, para montar no Canva com a cena original.
import { chromium } from "playwright";
import { readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
const dir = path.dirname(fileURLToPath(import.meta.url));
mkdirSync(path.join(dir, "overlay"), { recursive: true });
const files = readdirSync(dir).filter((f) => /^\d\d-.*\.html$/.test(f)).sort();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
const boxes = {};
for (const f of files) {
  await page.goto("file://" + path.join(dir, f));
  await page.addStyleTag({ content: `html,body,.post{background:transparent!important} img[src^="cenas/"]{visibility:hidden!important}` });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);
  boxes[f] = await page.evaluate(() => [...document.querySelectorAll('img[src^="cenas/"]')].map((i) => { const r = i.getBoundingClientRect(); return { src: i.getAttribute("src"), left: r.left, top: r.top, width: r.width, height: r.height }; }));
  await page.screenshot({ path: path.join(dir, "overlay", f.replace(".html", ".png")), omitBackground: true });
  console.log("ok", f, JSON.stringify(boxes[f]));
}
writeFileSync(path.join(dir, "overlay", "boxes.json"), JSON.stringify(boxes, null, 2));
await browser.close();
