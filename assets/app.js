const VERSION = '1.0.7';

const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const downloadBtn = document.getElementById('downloadBtn');
const originalImg = document.getElementById('originalImg');
const originalWrap = document.getElementById('originalWrap');
const resultImg = document.getElementById('resultImg');
const statusEl = document.getElementById('status');
const versionLabel = document.getElementById('versionLabel');
const progressWrap = document.getElementById('progress');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const toleranceSlider = document.getElementById('toleranceSlider');
const toleranceValue = document.getElementById('toleranceValue');

let selectedFile = null;
let resultBlob = null;
let originalResultBlob = null;
let resultUrl = null;
let session = null;
let processing = false;
let CROP_ALPHA_THRESHOLD = 8;

function setStatus(msg, isError = false) {
  statusEl.textContent = msg;
  statusEl.style.color = isError ? '#b00020' : '#0d6d5f';
}

function setProgress(value, text) {
  if (!progressWrap || !progressBar || !progressText) return;

  progressWrap.classList.add('active');
  progressWrap.setAttribute('aria-hidden', 'false');

  if (value === null || typeof value === 'undefined') {
    progressWrap.classList.add('indeterminate');
    progressBar.style.width = '40%';
    progressBar.setAttribute('aria-valuenow', '0');
  } else {
    const pct = Math.max(0, Math.min(100, Math.round(value)));
    progressWrap.classList.remove('indeterminate');
    progressBar.style.width = `${pct}%`;
    progressBar.setAttribute('aria-valuenow', String(pct));
  }

  progressText.textContent = text || '';
}

function hideProgress() {
  if (!progressWrap || !progressBar || !progressText) return;
  progressWrap.classList.remove('active', 'indeterminate');
  progressWrap.setAttribute('aria-hidden', 'true');
  progressBar.style.width = '0%';
  progressBar.setAttribute('aria-valuenow', '0');
  progressText.textContent = '';
}

function updateButtons() {
  downloadBtn.disabled = !resultBlob;
}

function setResult(blob) {
  resultBlob = blob;
  if (resultUrl) URL.revokeObjectURL(resultUrl);
  resultUrl = URL.createObjectURL(blob);
  resultImg.src = resultUrl;
  updateButtons();
}

function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    setStatus('Fichier non valide. Choisis une image.', true);
    return;
  }
  selectedFile = file;
  resultBlob = null;
  resultImg.src = '';
  originalImg.src = URL.createObjectURL(file);
  setStatus('Image chargée. Préparation du détourage...');
  setProgress(null, 'Préparation…');
  updateButtons();
  
  dropzone.style.display = 'none';
  originalWrap.style.display = 'grid';
  
  autoProcess();
}

async function ensureSession() {
  if (session) return;
  if (!window.RembgWeb) {
    setStatus('Librairie rembg-web non chargée. Vérifie le fichier local.', true);
    throw new Error('RembgWeb indisponible');
  }
  if (typeof ort === 'undefined') {
    setStatus('ONNX Runtime non chargé. Vérifie le chargement CDN.', true);
    throw new Error('ort indisponible');
  }

  // Avoid COOP/COEP requirements for WASM threads
  ort.env.wasm.numThreads = 1;
  ort.env.wasm.proxy = false;

  // Modèle léger et efficace pour logos/objets simples
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

async function runProcess() {
  if (!selectedFile || processing) return;

  setStatus('Traitement en cours...');
  setProgress(null, 'Initialisation…');
  processing = true;

  try {
    await ensureSession();
    const inputBlob = selectedFile;

    const result = await window.RembgWeb.remove(inputBlob, {
      session,
      onProgress: (p) => {
        const pct = Math.round(p * 100);
        if (!Number.isFinite(pct)) {
          setProgress(null, 'Traitement en cours...');
          return;
        }
        setProgress(pct, `Traitement ${pct}%`);
      },
    });

    setResult(result);
    
    await cropToOnePixelBorder(true);
  } catch (err) {
    console.error(err);
    setStatus(
      'Erreur: ' + (err.message || 'Impossible de détourer.'),
      true
    );
    hideProgress();
  } finally {
    processing = false;
    updateButtons();
  }
}

downloadBtn.addEventListener('click', () => {
  if (!resultBlob) return;
  const a = document.createElement('a');
  a.href = resultUrl || URL.createObjectURL(resultBlob);
  a.download = 'detourage.png';
  document.body.appendChild(a);
  a.click();
  a.remove();
  if (!resultUrl) URL.revokeObjectURL(a.href);
});

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

const CROP_ALPHA_THRESHOLD = 8;

async function cropToOnePixelBorder(skipProcessingCheck = false) {
  if (!resultBlob) return;
  if (!skipProcessingCheck && processing) return;
  if (!skipProcessingCheck) processing = true;

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

    if (maxX < 0 || maxY < 0) {
      setStatus('Crop ignoré : image entièrement transparente.');
      hideProgress();
      if (!skipProcessingCheck) processing = false;
      return;
    }

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
    setProgress(100, '');
  } catch (err) {
    console.error(err);
    setStatus('Erreur: ' + (err.message || 'Crop impossible.'), true);
    hideProgress();
  } finally {
    if (!skipProcessingCheck) processing = false;
  }
}

function resetDropzone() {
  dropzone.style.display = 'grid';
  originalWrap.style.display = 'none';
  resultImg.src = '';
  selectedFile = null;
  resultBlob = null;
  updateButtons();
}

// Global drag & drop handlers
['dragenter', 'dragover'].forEach((evt) => {
  document.body.addEventListener(evt, (e) => {
    e.preventDefault();
    e.stopPropagation();
    document.body.classList.add('dragover');
  });
});

['dragleave', 'drop'].forEach((evt) => {
  document.body.addEventListener(evt, (e) => {
    e.preventDefault();
    e.stopPropagation();
    document.body.classList.remove('dragover');
  });
});

document.body.addEventListener('drop', (e) => {
  const file = e.dataTransfer.files && e.dataTransfer.files[0];
  handleFile(file);
});

// Dropzone click and keyboard handlers
dropzone.addEventListener('click', () => fileInput.click());

dropzone.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fileInput.click();
  }
});

// Allow clicking on original image to reset and load new file
originalWrap.addEventListener('click', () => {
  resetDropzone();
  fileInput.click();
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  handleFile(file);
});

function autoProcess() {
  if (!selectedFile || processing) return;
  runProcess();
}

setStatus('pkimagetools — choisis une image (logo) pour détourage local.');
if (versionLabel) versionLabel.textContent = VERSION;
hideProgress();
updateButtons();
