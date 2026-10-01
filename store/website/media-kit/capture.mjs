const task = await taskSpace("ImgRalph Store 3 media");
const page = await task.newPage();
await page.goto("file:///Users/clm/Documents/GitHub/PROJECTS/Web_PKimagetools/store3/media-kit/production-replica.html");
await page.waitForSelector(".dropzone span");
await page.cdp("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 2, mobile: false });
await page.waitForTimeout(200);

const root = "/Users/clm/Documents/GitHub/PROJECTS/Web_PKimagetools/store3";
await page.screenshot({ path: root + "/screenshots/01-app-empty-1440x900.png" });
await page.evaluate(() => document.getElementById("voile").classList.add("active"));
await page.waitForTimeout(300);
await page.screenshot({ path: root + "/screenshots/02-app-drag-1440x900.png" });

await page.evaluate(() => {
  document.getElementById("voile").classList.remove("active");
  const progress = document.getElementById("fullscreenProgress");
  progress.classList.add("active", "processing");
  document.getElementById("fullscreenProgressBar").style.width = "68%";
  document.getElementById("percent").textContent = "68%";
  document.getElementById("status").textContent = "Traitement en cours...";
});
await page.waitForTimeout(400);
await page.screenshot({ path: root + "/screenshots/03-app-progress-1440x900.png" });

await page.evaluate(() => {
  const progress = document.getElementById("fullscreenProgress");
  progress.classList.remove("processing");
  progress.classList.add("done");
  document.getElementById("fullscreenProgressBar").style.width = "100%";
  document.getElementById("percent").textContent = "Télécharger";
  document.getElementById("status").textContent = "Terminé !";
  document.getElementById("controls").hidden = false;
});
await page.cdp("Emulation.setDeviceMetricsOverride", { width: 1600, height: 1000, deviceScaleFactor: 2, mobile: false });
await page.waitForTimeout(300);
await page.screenshot({ path: root + "/screenshots/04-app-result-1600x1000.png" });

const banner = await task.newPage();
await banner.goto("file:///Users/clm/Documents/GitHub/PROJECTS/Web_PKimagetools/store3/media-kit/banner-source.html");
await banner.cdp("Emulation.setDeviceMetricsOverride", { width: 1544, height: 500, deviceScaleFactor: 1, mobile: false });
await banner.waitForTimeout(200);
await banner.screenshot({ path: root + "/assets/banner-1544x500.png" });

const card = await task.newPage();
await card.goto("file:///Users/clm/Documents/GitHub/PROJECTS/Web_PKimagetools/store3/media-kit/card-source.html");
await card.cdp("Emulation.setDeviceMetricsOverride", { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });
await card.waitForTimeout(200);
await card.screenshot({ path: root + "/assets/card-1200x630.png" });

console.log(await page.info());
await task.finish({ keep: [] });
