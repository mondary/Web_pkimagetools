const task = await taskSpace("ImgRalph Store 3 page QA");
const page = await task.newPage();
await page.goto("file:///Users/clm/Documents/GitHub/PROJECTS/Web_PKimagetools/store3/index.html");
await page.waitForSelector(".hero h1");
const root = "/Users/clm/Documents/GitHub/PROJECTS/Web_PKimagetools/store3/media-kit";
const widths = [390, 768, 1440, 1920];
const results = [];

for (const width of widths) {
  const height = width === 390 ? 844 : width === 768 ? 1024 : 900;
  await page.cdp("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width === 390 });
  await page.waitForTimeout(250);
  await page.screenshot({ path: root + "/page-" + width + ".png" });
  results.push(await page.evaluate((viewport) => ({
    viewport,
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1
  }), width));
}

await page.cdp("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await page.focus('[data-set-lang="en"]');
await page.keyboard.press("Enter");
await page.waitForTimeout(250);
await page.screenshot({ path: root + "/page-1440-en.png" });
const enState = await page.evaluate(() => ({
  lang: document.documentElement.lang,
  title: document.querySelector("h1").textContent,
  overflow: document.documentElement.scrollWidth > window.innerWidth + 1
}));

await page.cdp("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
await page.waitForTimeout(250);
await page.screenshot({ path: root + "/page-1440-reduced-motion.png" });
await page.cdp("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });

await page.cdp("Emulation.setScriptExecutionDisabled", { value: true });
await page.reload();
await page.waitForSelector(".hero h1");
await page.waitForTimeout(250);
await page.screenshot({ path: root + "/page-1440-no-js.png" });
const noJsState = await page.evaluate(() => ({
  title: document.querySelector("h1").textContent,
  visibleSections: Array.from(document.querySelectorAll(".reveal")).filter((node) => getComputedStyle(node).opacity !== "0").length
}));
await page.cdp("Emulation.setScriptExecutionDisabled", { value: false });

console.log(JSON.stringify({ results, enState, noJsState }, null, 2));
await task.finish({ keep: [] });
