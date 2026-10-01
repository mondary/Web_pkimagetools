const task = await taskSpace("ImgRalph Store 3 animation");
const page = await task.newPage();
await page.goto("file:///Users/clm/Documents/GitHub/PROJECTS/Web_PKimagetools/store3/media-kit/production-replica.html");
await page.waitForSelector(".dropzone span");
await page.cdp("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

await page.evaluate(() => {
  const cursor = document.createElement("div");
  cursor.id = "capture-cursor";
  cursor.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M5 2l14 10-6 1 3 7-3 1-3-7-5 4z" fill="#fff" stroke="#171715" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  cursor.style.cssText = "position:fixed;left:0;top:0;z-index:4000;pointer-events:none;transform:translate(-100px,-100px);filter:drop-shadow(0 3px 8px rgba(0,0,0,.35));";
  document.body.appendChild(cursor);
});

const frameRoot = "/private/tmp/store3-frames-8c3f";
const setCursor = (x, y) => page.evaluate((left, top) => {
  document.getElementById("capture-cursor").style.transform = "translate(" + left + "px," + top + "px)";
}, x, y);
const shot = (index) => page.screenshot({ path: frameRoot + "/frame-" + String(index).padStart(3, "0") + ".png" });

let frame = 0;
for (let i = 0; i < 5; i += 1) {
  const t = i / 4;
  await setCursor(70 + (610 * t), 790 - (360 * t));
  await shot(frame++);
}

await page.evaluate(() => document.getElementById("voile").classList.add("active"));
for (let i = 0; i < 8; i += 1) {
  const t = i / 7;
  await setCursor(680 + (70 * t), 430 + (25 * t));
  await shot(frame++);
}

await page.evaluate(() => {
  document.getElementById("voile").classList.remove("active");
  const progress = document.getElementById("fullscreenProgress");
  progress.classList.add("active", "processing");
  document.getElementById("status").textContent = "Image chargée. Lancement du détourage...";
});
for (let i = 0; i < 27; i += 1) {
  const pct = Math.round((i / 26) * 100);
  await setCursor(1250, 815);
  await page.evaluate((value) => {
    document.getElementById("fullscreenProgressBar").style.width = value + "%";
    document.getElementById("percent").textContent = value + "%";
    document.getElementById("status").textContent = value > 18 ? "Traitement en cours..." : "Image chargée. Lancement du détourage...";
  }, pct);
  await shot(frame++);
}

await page.evaluate(() => {
  const progress = document.getElementById("fullscreenProgress");
  progress.classList.remove("processing");
  progress.classList.add("done");
  document.getElementById("fullscreenProgressBar").style.width = "100%";
  document.getElementById("percent").textContent = "Télécharger";
  document.getElementById("status").textContent = "Terminé !";
  document.getElementById("controls").hidden = false;
});
for (let i = 0; i < 10; i += 1) {
  const t = i / 9;
  await setCursor(1230 - (500 * t), 800 - (315 * t));
  await shot(frame++);
}

console.log({ frames: frame, width: 1440, height: 900, fps: 12 });
await task.finish({ keep: [] });
