/**
 * ImgRalph - Détourage avec animation voile et barre de progression
 */

const voile = document.getElementById('voile');
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const previewSection = document.getElementById('previewSection');
const originalImg = document.getElementById('originalImg');
const resultImg = document.getElementById('resultImg');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const progressPercent = document.getElementById('progressPercent');
const statusEl = document.getElementById('status');

let selectedFile = null;
let resultBlob = null;
let resultUrl = null;
let session = null;
let processing = false;

// --- Status & Progress ---
function setStatus(msg, isError = false) {
  statusEl.textContent = msg;
  statusEl.classList.toggle('error', isError);
}

function setProgress(value, text) {
  progressContainer.classList.add('active');
  progressContainer.classList.remove('indeterminate');

  if (value === null || typeof value === 'undefined') {
    progressContainer.classList.add('indeterminate');
    progressBar.style.width = '30%';
    progressBar.setAttribute('aria-valuenow', '0');
    progressPercent.textContent = '...';
  } else {
    const pct = Math.max(0, Math.min(100, Math.round(value)));
    progressBar.style.width = `${pct}%`;
    progressBar.setAttribute('aria-valuenow', String(pct));
    progressPercent.textContent = `${pct}%`;
  }

  progressText.textContent = text || '';
}

function hideProgress() {
  progressContainer.classList.remove('active', 'indeterminate');
  progressBar.style.width = '0%';
  progressBar.setAttribute('aria-valuenow', '0');
  progressPercent.textContent = '0%';
  progressText.textContent = 'En attente...';
}

function updateButtons() {
  downloadBtn.disabled = !resultBlob;
}

// --- Voile (veil) animation for drag ---
let dragCounter = 0;

function showVoile() {
  voile.classList.add('active');
}

function hideVoile() {
  voile.classList.remove('active');
}

document.addEventListener('dragenter', (e) => {
  e.preventDefault();
  dragCounter++;
  if (dragCounter === 1) {
    showVoile();
  }
});

document.addEventListener('dragleave', (e) => {
  e.preventDefault();
  dragCounter--;
  if (dragCounter <= 0) {
    dragCounter = 0;
    hideVoile();
  }
});

document.addEventListener('dragover', (e) => {
  e.preventDefault();
});

document.addEventListener('drop', (e) => {
  e.preventDefault();
  dragCounter = 0;
  hideVoile();

  const file = e.dataTransfer.files && e.dataTransfer.files[0];
  if (file) handleFile(file);
});

// Dropzone local hover effect
dropzone.addEventListener('dragenter', () => dropzone.classList.add('dragover'));
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
dropzone.addEventListener('dragover', (e) => e.preventDefault());
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
  if (resultUrl) {
    URL.revokeObjectURL(resultUrl);
    resultUrl = null;
  }
  resultImg.src = '';

  originalImg.src = URL.createObjectURL(file);
  previewSection.style.display = 'block';

  setStatus('Image chargée. Lancement du détourage...');
  updateButtons();

  autoProcess();
}

// --- rembg-web Session ---
async function ensureSession() {
  if (session) return;

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
  rembgConfig.setCustomModelPath(
    'u2netp',
    'https://huggingface.co/tomjackson2023/rembg/resolve/main/u2netp.onnx?download=true'
  );

  session = await newSession('u2netp', {
    numThreads: 1,
    proxy: false,
    simd: true,
  });
}

// --- Processing ---
async function runProcess() {
  if (!selectedFile || processing) return;

  processing = true;
  setStatus('Traitement en cours...');
  setProgress(null, 'Initialisation du modèle...');

  try {
    await ensureSession();
    setProgress(5, 'Modèle prêt, détourage...');

    const result = await window.RembgWeb.remove(selectedFile, {
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

    setProgress(85, 'Détourage terminé, crop...');
    await setResult(result);

    // Crop to content
    await cropToContent();
  } catch (err) {
    console.error(err);
    setStatus('Erreur: ' + (err.message || 'Impossible de détourer.'), true);
    hideProgress();
  } finally {
    processing = false;
    updateButtons();
  }
}

function setResult(blob) {
  resultBlob = blob;
  if (resultUrl) URL.revokeObjectURL(resultUrl);
  resultUrl = URL.createObjectURL(blob);
  resultImg.src = resultUrl;
  updateButtons();
}

// --- Crop to content with 1px border ---
const CROP_ALPHA_THRESHOLD = 8;

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

async function cropToContent() {
  if (!resultBlob) return;

  setProgress(90, 'Recadrage...');

  try {
    const img = await loadImageFromBlob(resultBlob);
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0);

    const { data } = ctx.getImageData(0, 0, width, height);
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < height; y++) {
      const rowOffset = y * width * 4;
      for (let x = 0; x < width; x++) {
        const alpha = data[rowOffset + x * 4 + 3];
        if (alpha > CROP_ALPHA_THRESHOLD) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }

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

// --- Actions ---
downloadBtn.addEventListener('click', () => {
  if (!resultBlob) return;
  const a = document.createElement('a');
  a.href = resultUrl || URL.createObjectURL(resultBlob);
  a.download = 'imgralph-detoure.png';
  document.body.appendChild(a);
  a.click();
  a.remove();
});

resetBtn.addEventListener('click', () => {
  selectedFile = null;
  resultBlob = null;
  if (resultUrl) {
    URL.revokeObjectURL(resultUrl);
    resultUrl = null;
  }
  originalImg.src = '';
  resultImg.src = '';
  previewSection.style.display = 'none';
  hideProgress();
  setStatus('');
  updateButtons();
  fileInput.value = '';
});

function autoProcess() {
  if (!selectedFile || processing) return;
  runProcess();
}

// --- Init ---
setStatus('Glissez une image pour commencer');
hideProgress();
updateButtons();
