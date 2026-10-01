const task = await taskSpace("ImgRalph Store 3 demo geometry");
const page = await task.newPage();
await page.goto("file:///Users/clm/Documents/GitHub/PROJECTS/Web_PKimagetools/store3/index.html");
await page.waitForSelector(".hero h1");
await page.cdp("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await page.evaluate(() => document.querySelector(".signature").scrollIntoView({ behavior: "instant", block: "center" }));
await page.waitForTimeout(3400);
const geometry = await page.evaluate(() => ({
  shell: document.querySelector(".demo-shell").getBoundingClientRect().toJSON(),
  result: document.querySelector(".demo-result").getBoundingClientRect().toJSON(),
  image: document.querySelector(".demo-result img").getBoundingClientRect().toJSON(),
  percent: document.getElementById("demoPercent").getBoundingClientRect().toJSON(),
  controls: document.getElementById("demoControls").getBoundingClientRect().toJSON(),
  imageStyle: getComputedStyle(document.querySelector(".demo-result img")).cssText
}));
console.log(JSON.stringify(geometry, null, 2));
await task.finish({ keep: [] });
