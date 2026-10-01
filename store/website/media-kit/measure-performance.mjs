const task = await taskSpace("ImgRalph Store 3 performance");
const page = await task.newPage();
await page.cdp("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await page.goto("file:///Users/clm/Documents/GitHub/PROJECTS/Web_PKimagetools/store3/index.html");
await page.waitForSelector(".hero h1");
const metrics = await page.evaluate(() => new Promise((resolve) => {
  let largestContentfulPaint = 0;
  let cumulativeLayoutShift = 0;
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    if (entries.length) largestContentfulPaint = entries[entries.length - 1].startTime;
  }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) cumulativeLayoutShift += entry.value;
    }
  }).observe({ type: "layout-shift", buffered: true });
  setTimeout(() => resolve({
    largestContentfulPaintMs: Math.round(largestContentfulPaint),
    cumulativeLayoutShift: Number(cumulativeLayoutShift.toFixed(4)),
    resources: performance.getEntriesByType("resource").map((entry) => ({
      name: entry.name.split("/").pop(),
      transferSize: entry.transferSize,
      decodedBodySize: entry.decodedBodySize
    }))
  }), 1200);
}));
console.log(JSON.stringify(metrics, null, 2));
await task.finish({ keep: [] });
