// Screenshot driver: captures each section of the running site (localhost:5173)
// and logs any browser console errors. Usage: node scripts/shots.mjs
import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

page.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warning") console.log(`[console:${m.type()}]`, m.text());
});
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
page.on("requestfailed", (r) => console.log("[requestfailed]", r.url(), r.failure()?.errorText));

await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
await page.waitForTimeout(3500);
await page.screenshot({ path: "shots/01-hero.png" });

// moongate diagnostics
const diag = await page.evaluate(() => {
  const el = document.querySelector(".moongate");
  const img = document.querySelector(".moongate__img img");
  const r = el?.getBoundingClientRect();
  return {
    moongate: r ? `${Math.round(r.width)}x${Math.round(r.height)}` : "missing",
    imgLoaded: img ? `${img.naturalWidth}x${img.naturalHeight} complete=${img.complete}` : "missing",
    clashLoaded: document.fonts.check('600 32px "Clash Display"'),
    satoshiLoaded: document.fonts.check('400 16px "Satoshi"'),
  };
});
console.log("[diag]", JSON.stringify(diag));

// scroll through the pinned services section — each quarter of the pin
// range should open the next panel (01 → 04)
const pinInfo = await page.evaluate(() => {
  const spacer = document.querySelector(".services").parentElement;
  return { top: spacer.getBoundingClientRect().top + window.scrollY, vh: innerHeight };
});
for (let i = 0; i < 4; i++) {
  const y = pinInfo.top + (i / 4 + 0.12) * 3.2 * pinInfo.vh;
  await page.evaluate((v) => window.scrollTo({ top: v, behavior: "instant" }), y);
  await page.waitForTimeout(1400);
  await page.screenshot({ path: `shots/02-services-step${i + 1}.png` });
}
const openStates = await page.evaluate(() =>
  [...document.querySelectorAll(".panel")].map((p) => p.classList.contains("is-open"))
);
console.log("[services] final open states:", JSON.stringify(openStates));

for (const [id, name] of [["#vision", "03-vision"], ["#about", "04-about"], ["#why", "05-why"], ["#contact", "06-footer"]]) {
  await page.evaluate((sel) => document.querySelector(sel)?.scrollIntoView({ behavior: "instant", block: "start" }), id);
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `shots/${name}.png` });
}

await browser.close();
console.log("done");
