const task = await taskSpace("ImgRalph Store 3 section QA");
const page = await task.newPage();
await page.goto("file:///Users/clm/Documents/GitHub/PROJECTS/Web_PKimagetools/store3/index.html");
await page.waitForSelector(".hero h1");
await page.cdp("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1150, deviceScaleFactor: 1, mobile: false });
const root = "/Users/clm/Documents/GitHub/PROJECTS/Web_PKimagetools/store3/media-kit";
const sections = [
  ["sequence", "#geste"],
  ["signature", ".signature"],
  ["facts", "#reglages"],
  ["final", ".final"]
];
for (const [name, selector] of sections) {
  await page.evaluate((data) => document.querySelector(data.target).scrollIntoView({ behavior: "instant", block: data.block }), {
    target: selector,
    block: selector === ".signature" ? "center" : "start"
  });
  await page.waitForTimeout(selector === ".signature" ? 3400 : 600);
  await page.screenshot({ path: root + "/section-" + name + ".png" });
}
console.log(await page.info());
await task.finish({ keep: [] });
