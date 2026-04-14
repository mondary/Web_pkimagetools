/**
 * ImgRalph - Détourage avec animation voile et barre de progression
 * Entry point loaded from `src/index.html` as an ES module.
 */

const voile = document.getElementById('voile');
const dropzone = document.getElementById('dropzone');
const dropzoneArea = document.getElementById('dropzoneArea');
const fileInput = document.getElementById('fileInput');
const fullscreenResultImg = document.getElementById('fullscreenResultImg');
const statusEl = document.getElementById('status');
const toleranceRange = document.getElementById('toleranceRange');
const toleranceValue = document.getElementById('toleranceValue');
const downloadControls = document.getElementById('downloadControls');
const modelSelect = document.getElementById('modelSelect');
const engineSelect = document.getElementById('engineSelect');

// Fullscreen progress elements
const fullscreenProgress = document.getElementById('fullscreenProgress');
const fullscreenProgressBar = document.getElementById('fullscreenProgressBar');
const fullscreenProgressPercent = document.getElementById('fullscreenProgressPercent');

let displayedProgress = 0;
let targetProgress = 0;
let progressRaf = null;
let resultReady = false;
let pendingResultUrl = null;

let selectedFile = null;
let resultBlob = null;
let modelResultBlob = null;
let resultUrl = null;
const sessionsByModel = new Map();
let currentEngine = 'api'; // 'api' | 'local'
let currentModel = 'u2net';
let processing = false;
let matteControl = 80; // -50..200 (positive = keep more)

// --- Status & Progress ---
function setStatus(msg, isError = false) {
  if (!statusEl) return;
  statusEl.textContent = msg;
  statusEl.classList.toggle('error', isError);
}

function setProgress(value, text) {
  // Show fullscreen progress
  fullscreenProgress.classList.add('active');

  if (value === null || typeof value === 'undefined') {
    // Fullscreen: show 0% when indeterminate
    targetProgress = 0;
    displayedProgress = 0;
    fullscreenProgressBar.style.width = '0%';
    fullscreenProgressPercent.textContent = '0%';
    if (progressRaf) {
      cancelAnimationFrame(progressRaf);
      progressRaf = null;
    }
  } else {
    const nextTarget = Math.max(0, Math.min(100, Math.round(value)));
    if (displayedProgress === 0 && nextTarget > 0) {
      displayedProgress = 3;
    }
    targetProgress = nextTarget;
    if (!progressRaf) {
      const tick = () => {
        const diff = targetProgress - displayedProgress;
        if (Math.abs(diff) < 0.5) {
          displayedProgress = targetProgress;
        } else {
          displayedProgress += diff * 0.08;
        }
        const pct = Math.max(0, Math.min(100, Math.round(displayedProgress)));
        fullscreenProgressBar.style.width = `${pct}%`;
        fullscreenProgressPercent.textContent = pct >= 100 ? 'Télécharger' : `${pct}%`;
        if (downloadControls) downloadControls.hidden = !(pct >= 100 && resultReady);
        if (pct >= 100 && resultReady && pendingResultUrl) {
          fullscreenResultImg.src = pendingResultUrl;
        }
        if (displayedProgress >= 100 && targetProgress >= 100) {
          progressRaf = null;
          return;
        }
        progressRaf = requestAnimationFrame(tick);
      };
      progressRaf = requestAnimationFrame(tick);
    }
  }
}

function hideProgress() {
  // Hide fullscreen progress
  fullscreenProgress.classList.remove('active');
  fullscreenProgressBar.style.width = '0%';
  fullscreenProgressPercent.textContent = '0%';
  displayedProgress = 0;
  targetProgress = 0;
  if (progressRaf) {
    cancelAnimationFrame(progressRaf);
    progressRaf = null;
  }
  if (downloadControls) downloadControls.hidden = true;
}

// --- Voile (veil) animation for drag ---
let dragCounter = 0;

function showVoile() {
  voile.classList.add('active');
}

function hideVoile() {
  voile.classList.remove('active');
}

function isImageDrag(e) {
  const dt = e.dataTransfer;
  if (!dt) return false;
  if (dt.items && dt.items.length) {
    return Array.from(dt.items).some(
      (item) => item.kind === 'file' && item.type.startsWith('image/')
    );
  }
  if (dt.files && dt.files.length) {
    return Array.from(dt.files).some((file) => file.type.startsWith('image/'));
  }
  return false;
}

document.addEventListener('dragenter', (e) => {
  if (!isImageDrag(e)) return;
  e.preventDefault();
  dragCounter++;
  if (dragCounter === 1) {
    showVoile();
  }
});

document.addEventListener('dragleave', (e) => {
  if (!isImageDrag(e)) return;
  e.preventDefault();
  dragCounter--;
  if (dragCounter <= 0) {
    dragCounter = 0;
    hideVoile();
  }
});

document.addEventListener('dragover', (e) => {
  if (!isImageDrag(e)) return;
  e.preventDefault();
});

document.addEventListener('drop', (e) => {
  if (!isImageDrag(e)) return;
  e.preventDefault();
  dragCounter = 0;
  hideVoile();

  const file = e.dataTransfer.files && e.dataTransfer.files[0];
  if (file) handleFile(file);
});

// Dropzone local hover effect
dropzone.addEventListener('dragenter', (e) => {
  if (!isImageDrag(e)) return;
  dropzone.classList.add('dragover');
});
dropzone.addEventListener('dragleave', (e) => {
  if (!isImageDrag(e)) return;
  dropzone.classList.remove('dragover');
});
dropzone.addEventListener('dragover', (e) => {
  if (!isImageDrag(e)) return;
  e.preventDefault();
});
dropzone.addEventListener('drop', () => dropzone.classList.remove('dragover'));

// Click to select file
dropzone.addEventListener('click', () => fileInput.click());
dropzone.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fileInput.click();
  }
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  if (file) handleFile(file);
});

// --- File handling ---
function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    setStatus('Fichier non valide. Choisissez une image.', true);
    return;
  }

  selectedFile = file;
  resultBlob = null;
  baseResultBlob = null;
  resultReady = false;
  pendingResultUrl = null;
  if (resultUrl) {
    URL.revokeObjectURL(resultUrl);
    resultUrl = null;
  }
  fullscreenResultImg.src = '';

  if (dropzoneArea) dropzoneArea.style.display = 'none';

  setStatus('Image chargée. Lancement du détourage...');
  autoProcess();
}

// --- rembg-web Sessions ---
function getSelectedModel() {
  const value = modelSelect?.value;
  if (value === 'u2netp' || value === 'u2net' || value === 'u2net_human_seg') return value;
  return 'u2net';
}

async function ensureSession(modelName) {
  const existing = sessionsByModel.get(modelName);
  if (existing) return existing;

  if (!window.RembgWeb) {
    setStatus('Librairie rembg-web non chargée.', true);
    throw new Error('RembgWeb indisponible');
  }
  if (typeof ort === 'undefined') {
    setStatus('ONNX Runtime non chargé.', true);
    throw new Error('ort indisponible');
  }

  // Single-threaded to avoid COOP/COEP requirements
  ort.env.wasm.numThreads = 1;
  ort.env.wasm.proxy = false;

  const { newSession, rembgConfig } = window.RembgWeb;

  // Use explicit URLs so models load reliably from the same repo.
  // Note: larger models (u2net / u2net_human_seg) can take longer to download.
  const modelUrls = {
    u2net: 'https://huggingface.co/tomjackson2023/rembg/resolve/main/u2net.onnx?download=true',
    u2netp: 'https://huggingface.co/tomjackson2023/rembg/resolve/main/u2netp.onnx?download=true',
    u2net_human_seg:
      'https://huggingface.co/tomjackson2023/rembg/resolve/main/u2net_human_seg.onnx?download=true',
  };

  const url = modelUrls[modelName];
  if (!url) throw new Error(`Modèle inconnu: ${modelName}`);
  rembgConfig.setCustomModelPath(modelName, url);

  const newSess = await newSession(modelName, {
    numThreads: 1,
    proxy: false,
    simd: true,
  });
  sessionsByModel.set(modelName, newSess);
  return newSess;
}

// --- Processing ---
async function runProcess() {
  if (!selectedFile || processing) return;

  processing = true;
  setStatus('Traitement en cours...');
  setProgress(null, currentEngine === 'api' ? 'Upload vers remove.bg...' : 'Initialisation du modèle...');

  try {
    let result;
    if (currentEngine === 'api') {
      setProgress(10, 'Upload vers remove.bg...');
      result = await removeViaApi(selectedFile);
      setProgress(85, 'Résultat reçu, crop...');
    } else {
      currentModel = getSelectedModel();
      const session = await ensureSession(currentModel);
      setProgress(5, 'Modèle prêt, détourage...');

      result = await window.RembgWeb.remove(selectedFile, {
        session,
        onProgress: (p) => {
          // p is 0-1, map to 5-85 for détourage phase
          const pct = Math.round(5 + p * 80);
          if (!Number.isFinite(pct)) {
            setProgress(null, 'Détourage en cours...');
            return;
          }
          setProgress(pct, 'Détourage...');
        },
      });
    }

    modelResultBlob = result;
    await applyMatteAndCrop();
  } catch (err) {
    console.error(err);
    const message = err && typeof err.message === 'string' ? err.message : 'Impossible de détourer.';
    setStatus('Erreur: ' + message, true);
    hideProgress();
  } finally {
    processing = false;
  }
}

async function removeViaApi(file) {
  const form = new FormData();
  form.append('image', file, file.name || 'image');

  const res = await fetch('./lib/removebg-api.php', {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    let details = '';
    try {
      const json = await res.json();
      details = json?.error ? json.error : '';
    } catch {
      // ignore
    }
    const hint =
      res.status === 500 && /api key/i.test(details)
        ? 'Vérifie `secrets/removebg.php` (api_key) sur le serveur.'
        : res.status === 402 || /insufficient|credits|payment|required/i.test(details)
          ? 'Quota/crédits remove.bg épuisés.'
          : '';
    throw new Error(
      `remove.bg API: HTTP ${res.status}${details ? ` — ${details}` : ''}${hint ? ` — ${hint}` : ''}`
    );
  }

  const blob = await res.blob();
  if (!blob || blob.size === 0) {
    throw new Error('remove.bg API returned empty response');
  }
  return blob;
}

function setResult(blob) {
  resultBlob = blob;
  if (resultUrl) URL.revokeObjectURL(resultUrl);
  resultUrl = URL.createObjectURL(blob);
  pendingResultUrl = resultUrl;
  resultReady = true;
}

function clampByte(value) {
  return Math.max(0, Math.min(255, value));
}

async function loadImageFromBlob(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Chargement image échoué.'));
    };
    img.src = url;
  });
}

function applyMatteToImageData(imageData, control) {
  const { data, width, height } = imageData;

  // Gamma curve on alpha.
  // control > 0 => gamma < 1 => boosts semi-transparent pixels (keeps more)
  // control < 0 => gamma > 1 => makes edges thinner (more aggressive)
  const tRaw = Number(control) || 0;
  const t = Math.max(-50, Math.min(200, tRaw));

  // Make the top of the slider much stronger without being too jumpy near 0.
  const keepStrength = t > 0 ? Math.pow(t / 200, 0.55) : 0; // 0..1
  const cutStrength = t < 0 ? Math.pow(Math.abs(t) / 50, 0.85) : 0; // 0..1

  const gamma = t >= 0
    ? Math.max(0.12, 1 - keepStrength * 0.92) // 1 -> ~0.08..0.12
    : Math.min(2.8, 1 + cutStrength * 1.8); // 1 -> up to ~2.8

  for (let i = 3; i < data.length; i += 4) {
    const a = data[i] / 255;
    const next = Math.pow(a, gamma) * 255;
    data[i] = clampByte(Math.round(next));
  }

  // Light dilation when control is positive.
  // radius 0..6, but only kicks in progressively (so it's still stable near 0).
  const radius = t > 0 ? Math.min(6, Math.floor(keepStrength * 6)) : 0;
  if (radius <= 0) return imageData;

  const alpha = new Uint8ClampedArray(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      alpha[y * width + x] = data[(y * width + x) * 4 + 3];
    }
  }

  const out = new Uint8ClampedArray(width * height);
  const r = radius;
  for (let y = 0; y < height; y++) {
    const y0 = Math.max(0, y - r);
    const y1 = Math.min(height - 1, y + r);
    for (let x = 0; x < width; x++) {
      const x0 = Math.max(0, x - r);
      const x1 = Math.min(width - 1, x + r);
      let m = 0;
      for (let yy = y0; yy <= y1; yy++) {
        const row = yy * width;
        for (let xx = x0; xx <= x1; xx++) {
          const v = alpha[row + xx];
          if (v > m) m = v;
        }
      }
      out[y * width + x] = m;
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      data[(y * width + x) * 4 + 3] = out[y * width + x];
    }
  }

  return imageData;
}

async function applyMatteAndCrop() {
  const sourceBlob = modelResultBlob || resultBlob;
  if (!sourceBlob) return;

  setProgress(90, 'Recadrage...');

  try {
    const img = await loadImageFromBlob(sourceBlob);
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0);

    let imageData = ctx.getImageData(0, 0, width, height);
    imageData = applyMatteToImageData(imageData, matteControl);
    const { data } = imageData;
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    const boundsThreshold = 1;

    for (let y = 0; y < height; y++) {
      const rowOffset = y * width * 4;
      for (let x = 0; x < width; x++) {
        const alpha = data[rowOffset + x * 4 + 3];
        if (alpha > boundsThreshold) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);

    setProgress(95, 'Finalisation...');

    if (maxX < 0 || maxY < 0) {
      setStatus('Image entièrement transparente.');
      setProgress(100, 'Terminé');
      return;
    }

    // 1px border
    minX = Math.max(0, minX - 1);
    minY = Math.max(0, minY - 1);
    maxX = Math.min(width - 1, maxX + 1);
    maxY = Math.min(height - 1, maxY + 1);

    const newW = maxX - minX + 1;
    const newH = maxY - minY + 1;

    const outCanvas = document.createElement('canvas');
    const outCtx = outCanvas.getContext('2d');
    outCanvas.width = newW;
    outCanvas.height = newH;
    outCtx.drawImage(canvas, minX, minY, newW, newH, 0, 0, newW, newH);

    const croppedBlob = await new Promise((resolve) =>
      outCanvas.toBlob(resolve, 'image/png')
    );

    if (!croppedBlob) {
      throw new Error('Export PNG échoué.');
    }

    setResult(croppedBlob);
    setStatus('Terminé !');
    setProgress(100, 'Terminé');
  } catch (err) {
    console.error(err);
    setStatus('Erreur: ' + (err.message || 'Crop impossible.'), true);
  }
}

function autoProcess() {
  if (!selectedFile || processing) return;
  runProcess();
}

if (toleranceRange) {
  toleranceRange.value = String(matteControl);
  if (toleranceValue) toleranceValue.textContent = String(matteControl);
  toleranceRange.addEventListener('input', (e) => {
    const value = Number(e.target.value);
    if (!Number.isFinite(value)) return;
    matteControl = Math.max(-50, Math.min(200, value));
    if (toleranceValue) toleranceValue.textContent = String(matteControl);
    if (processing || !modelResultBlob) return;
    applyMatteAndCrop();
  });
}

if (modelSelect) {
  modelSelect.value = currentModel;
  modelSelect.addEventListener('change', () => {
    if (processing) return;
    currentModel = getSelectedModel();
    // Re-run the model on the original file when the user switches model.
    // This is the "other tool" part; matte slider alone won't fix model misses.
    if (!selectedFile) return;
    modelResultBlob = null;
    runProcess();
  });
}

function applyEngineUiState() {
  if (modelSelect) {
    const modelLabel = modelSelect.closest('label');
    if (modelLabel) modelLabel.style.display = currentEngine === 'local' ? '' : 'none';
  }
}

if (engineSelect) {
  engineSelect.value = currentEngine;
  applyEngineUiState();
  engineSelect.addEventListener('change', () => {
    if (processing) return;
    const value = engineSelect.value;
    currentEngine = value === 'local' ? 'local' : 'api';
    applyEngineUiState();
    if (!selectedFile) return;
    modelResultBlob = null;
    runProcess();
  });
}

// --- Init ---
hideProgress();

function triggerDownload() {
  if (!resultBlob) return;
  const a = document.createElement('a');
  a.href = resultUrl || URL.createObjectURL(resultBlob);
  a.download = 'imgralph-detoure.png';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

fullscreenProgressPercent.addEventListener('click', () => {
  if (fullscreenProgressPercent.textContent !== 'Télécharger') return;
  triggerDownload();
});

fullscreenProgressPercent.addEventListener('keydown', (e) => {
  if (fullscreenProgressPercent.textContent !== 'Télécharger') return;
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    triggerDownload();
  }
});
