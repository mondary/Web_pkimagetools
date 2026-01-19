const VERSION = '1.0.5';

const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const processBtn = document.getElementById('processBtn');
const downloadBtn = document.getElementById('downloadBtn');
const originalImg = document.getElementById('originalImg');
const resultImg = document.getElementById('resultImg');
const statusEl = document.getElementById('status');
const versionLabel = document.getElementById('versionLabel');

let selectedFile = null;
let resultBlob = null;
let session = null;
let processing = false;

function setStatus(msg, isError = false) {
  statusEl.textContent = msg;
  statusEl.style.color = isError ? '#b00020' : '#0d6d5f';
}

function updateButtons() {
  processBtn.disabled = !selectedFile;
  downloadBtn.disabled = !resultBlob;
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
  setStatus('Image chargée. Détourage en cours...');
  updateButtons();
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

processBtn.addEventListener('click', async () => {
  if (!selectedFile || processing) return;

  setStatus('Traitement en cours...');
  processBtn.disabled = true;
  processing = true;

  try {
    await ensureSession();
    const inputBlob = selectedFile;

    const result = await window.RembgWeb.remove(inputBlob, {
      session,
      onProgress: (p) => {
        const pct = Math.round(p * 100);
        setStatus(`Traitement ${pct}%...`);
      },
    });

    resultBlob = result;
    resultImg.src = URL.createObjectURL(resultBlob);
    setStatus('Détourage terminé.');
  } catch (err) {
    console.error(err);
    setStatus(
      'Erreur: ' + (err.message || 'Impossible de détourer.'),
      true
    );
  } finally {
    processBtn.disabled = false;
    processing = false;
    updateButtons();
  }
});

downloadBtn.addEventListener('click', () => {
  if (!resultBlob) return;
  const url = URL.createObjectURL(resultBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'detourage.png';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

// Drag & drop / click handlers
['dragenter', 'dragover'].forEach((evt) => {
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.add('dragover');
  });
});

['dragleave', 'drop'].forEach((evt) => {
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.remove('dragover');
  });
});

dropzone.addEventListener('drop', (e) => {
  const file = e.dataTransfer.files && e.dataTransfer.files[0];
  handleFile(file);
});

dropzone.addEventListener('click', () => fileInput.click());

dropzone.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fileInput.click();
  }
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  handleFile(file);
});

function autoProcess() {
  if (!selectedFile || processing) return;
  processBtn.click();
}

setStatus('pkimagetools — choisis une image (logo) pour détourage local.');
if (versionLabel) versionLabel.textContent = VERSION;
updateButtons();
