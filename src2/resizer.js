const presets = [
  { id: 'icon-128', label: 'Icon 128×128', w: 128, h: 128, filename: 'icon-128.png' },
  { id: 'screenshot-1280x800', label: 'Screenshot 1280×800', w: 1280, h: 800, filename: 'screenshot-1280x800.png' },
  { id: 'screenshot-640x400', label: 'Screenshot 640×400', w: 640, h: 400, filename: 'screenshot-640x400.png' },
  { id: 'promo-440x280', label: 'Promo 440×280', w: 440, h: 280, filename: 'promo-440x280.png' },
  { id: 'promo-1400x560', label: 'Promo 1400×560', w: 1400, h: 560, filename: 'promo-1400x560.png' },
];

const els = {
  file: document.getElementById('file'),
  preset: document.getElementById('preset'),
  zoom: document.getElementById('zoom'),
  zoomLabel: document.getElementById('zoomLabel'),
  bg: document.getElementById('bg'),
  downloadPng: document.getElementById('downloadPng'),
  downloadJpg: document.getElementById('downloadJpg'),
  reset: document.getElementById('reset'),
  canvas: document.getElementById('canvas'),
  sizeLabel: document.getElementById('sizeLabel'),
};

const ctx = els.canvas.getContext('2d');
let img = null;
let imgW = 0;
let imgH = 0;
let baseScale = 1;
let scale = 1;
let offsetX = 0;
let offsetY = 0;
let dragging = false;
let lastX = 0;
let lastY = 0;

function loadPresets() {
  presets.forEach((p) => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.label}`;
    els.preset.appendChild(opt);
  });
  els.preset.value = presets[0].id;
  updateCanvasSize();
}

function currentPreset() {
  return presets.find((p) => p.id === els.preset.value) || presets[0];
}

function updateCanvasSize() {
  const { w, h } = currentPreset();
  els.canvas.width = w;
  els.canvas.height = h;
  els.sizeLabel.textContent = `${w} × ${h}`;
  draw();
}

function fitImage() {
  if (!img) return;
  const { w, h } = currentPreset();
  baseScale = Math.max(w / imgW, h / imgH);
  scale = baseScale;
  els.zoom.value = 1;
  els.zoomLabel.textContent = '1.00×';
  offsetX = 0;
  offsetY = 0;
  draw();
}

function draw() {
  const { w, h } = currentPreset();
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = els.bg.value || '#0b1220';
  ctx.fillRect(0, 0, w, h);
  if (!img) return;
  const s = scale;
  const dx = w / 2 + offsetX;
  const dy = h / 2 + offsetY;
  const drawW = imgW * s;
  const drawH = imgH * s;
  ctx.drawImage(img, dx - drawW / 2, dy - drawH / 2, drawW, drawH);
}

function onFile(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    img = image;
    imgW = image.naturalWidth;
    imgH = image.naturalHeight;
    URL.revokeObjectURL(url);
    fitImage();
    setControlsEnabled(true);
  };
  image.src = url;
}

function setControlsEnabled(enabled) {
  [els.zoom, els.bg, els.downloadPng, els.downloadJpg, els.reset].forEach((el) => (el.disabled = !enabled));
}

function onPresetChange() {
  updateCanvasSize();
  fitImage();
}

function onZoomChange() {
  const v = parseFloat(els.zoom.value) || 1;
  scale = baseScale * v;
  els.zoomLabel.textContent = `${v.toFixed(2)}×`;
  draw();
}

function startDrag(e) {
  if (!img) return;
  dragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
}

function drag(e) {
  if (!dragging) return;
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  lastX = e.clientX;
  lastY = e.clientY;
  offsetX += dx;
  offsetY += dy;
  draw();
}

function stopDrag() {
  dragging = false;
}

function wheelZoom(e) {
  if (!img) return;
  e.preventDefault();
  const delta = Math.sign(e.deltaY) * -0.05;
  let v = parseFloat(els.zoom.value) + delta;
  v = Math.max(0.2, Math.min(3, v));
  els.zoom.value = v;
  onZoomChange();
}

function download(asJpeg = false) {
  if (!img) return;
  const { filename } = currentPreset();
  const mime = asJpeg ? 'image/jpeg' : 'image/png';
  const data = els.canvas.toDataURL(mime, asJpeg ? 0.92 : undefined);
  const a = document.createElement('a');
  a.href = data;
  a.download = filename.replace(/\.png$/, asJpeg ? '.jpg' : '.png');
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function resetView() { fitImage(); }

function init() {
  loadPresets();
  setControlsEnabled(false);
  els.file.addEventListener('change', onFile);
  els.preset.addEventListener('change', onPresetChange);
  els.zoom.addEventListener('input', onZoomChange);
  els.bg.addEventListener('input', draw);
  els.downloadPng.addEventListener('click', () => download(false));
  els.downloadJpg.addEventListener('click', () => download(true));
  els.reset.addEventListener('click', resetView);

  els.canvas.addEventListener('mousedown', startDrag);
  window.addEventListener('mousemove', drag);
  window.addEventListener('mouseup', stopDrag);
  els.canvas.addEventListener('wheel', wheelZoom, { passive: false });
}

document.addEventListener('DOMContentLoaded', init);
