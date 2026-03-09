const presets = [
  { id: 'icon-128', label: 'Icône magasin', detail: '128 × 128', w: 128, h: 128, filename: 'icon-128.png' },
  { id: 'screenshot-local-1280x800', label: 'Capture locale', detail: '1280 × 800', w: 1280, h: 800, filename: 'screenshot-1280x800.png' },
  { id: 'screenshot-intl-1280x800', label: 'Capture internationale', detail: '1280 × 800', w: 1280, h: 800, filename: 'screenshot-intl-1280x800.png' },
  { id: 'promo-440x280', label: 'Petite promo', detail: '440 × 280', w: 440, h: 280, filename: 'promo-440x280.png' },
  { id: 'promo-1400x560', label: 'Grande promo', detail: '1400 × 560', w: 1400, h: 560, filename: 'promo-1400x560.png' },
];

const els = {
  file: document.getElementById('file'),
  fileDrop: document.getElementById('fileDrop'),
  fileName: document.getElementById('fileName'),
  fileBrowse: document.getElementById('fileBrowse'),
  presets: document.getElementById('presets'),
  zoom: document.getElementById('zoom'),
  zoomLabel: document.getElementById('zoomLabel'),
  bg: document.getElementById('bg'),
  downloadPng: document.getElementById('downloadPng'),
  downloadJpg: document.getElementById('downloadJpg'),
  reset: document.getElementById('reset'),
  fitW: document.getElementById('fitW'),
  fitH: document.getElementById('fitH'),
  center: document.getElementById('center'),
  canvas: document.getElementById('canvas'),
  sizeLabel: document.getElementById('sizeLabel'),
  dropHint: document.getElementById('dropHint'),
  canvasWrap: document.querySelector('.canvas-wrap'),
  magnet: document.getElementById('magnet'),
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
let magnet = false;

function loadPresets() {
  presets.forEach((p, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'preset-btn' + (idx === 0 ? ' active' : '');
    btn.dataset.id = p.id;
    btn.innerHTML = `<span>${p.label}</span><span class="preset-meta">${p.detail}</span>`;
    btn.addEventListener('click', () => selectPreset(p.id));
    els.presets.appendChild(btn);
  });
  selectPreset(presets[0].id);
}

function currentPreset() {
  return presets.find((p) => p.id === els.presets.dataset.active) || presets[0];
}

function selectPreset(id) {
  els.presets.dataset.active = id;
  Array.from(els.presets.querySelectorAll('.preset-btn')).forEach((b) => {
    b.classList.toggle('active', b.dataset.id === id);
  });
  updateCanvasSize();
  fitImage();
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

function fitWidth() {
  if (!img) return;
  const { w } = currentPreset();
  baseScale = w / imgW;
  scale = baseScale;
  els.zoom.value = 1;
  els.zoomLabel.textContent = '1.00×';
  offsetX = 0;
  offsetY = 0;
  draw();
}

function fitHeight() {
  if (!img) return;
  const { h } = currentPreset();
  baseScale = h / imgH;
  scale = baseScale;
  els.zoom.value = 1;
  els.zoomLabel.textContent = '1.00×';
  offsetX = 0;
  offsetY = 0;
  draw();
}

function centerView() {
  if (!img) return;
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
  els.fileName.textContent = file.name;
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
  if (magnet) {
    if (Math.abs(offsetX) < 12) offsetX = 0;
    if (Math.abs(offsetY) < 12) offsetY = 0;
    draw();
  }
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
  els.zoom.addEventListener('input', onZoomChange);
  els.bg.addEventListener('input', draw);
  els.downloadPng.addEventListener('click', () => download(false));
  els.downloadJpg.addEventListener('click', () => download(true));
  els.reset.addEventListener('click', resetView);
  els.fitW.addEventListener('click', fitWidth);
  els.fitH.addEventListener('click', fitHeight);
  els.center.addEventListener('click', centerView);
  els.magnet.addEventListener('change', (e) => { magnet = e.target.checked; });
  els.fileBrowse.addEventListener('click', () => els.file.click());
  els.fileDrop.addEventListener('dragover', onDragOver);
  els.fileDrop.addEventListener('dragleave', onDragLeave);
  els.fileDrop.addEventListener('drop', onDrop);

  els.canvasWrap.addEventListener('dragover', onDragOver);
  els.canvasWrap.addEventListener('dragleave', onDragLeave);
  els.canvasWrap.addEventListener('drop', onDrop);

  els.canvas.addEventListener('mousedown', startDrag);
  window.addEventListener('mousemove', drag);
  window.addEventListener('mouseup', stopDrag);
  els.canvas.addEventListener('wheel', wheelZoom, { passive: false });
}

document.addEventListener('DOMContentLoaded', init);
function onDropFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  const dt = new DataTransfer();
  dt.items.add(file);
  els.file.files = dt.files;
  onFile({ target: els.file });
}

function onDragOver(e) {
  e.preventDefault();
  els.canvasWrap.classList.add('dragover');
  els.fileDrop.classList.add('dragover');
}

function onDragLeave() {
  els.canvasWrap.classList.remove('dragover');
  els.fileDrop.classList.remove('dragover');
}

function onDrop(e) {
  e.preventDefault();
  els.canvasWrap.classList.remove('dragover');
  els.fileDrop.classList.remove('dragover');
  const file = e.dataTransfer?.files?.[0];
  onDropFile(file);
}
