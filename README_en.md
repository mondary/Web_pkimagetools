# ImgRalph

![Project icon](icon.png)

[🇬🇧 EN](README_en.md) · [🇫🇷 FR](README.md)

✨ In-browser background remover: runs ONNX + rembg-web locally, auto-crops with a 1 px border, and lets you download the transparent PNG instantly.

## ✅ Features
- Drag & drop or file picker (PNG/JPG/WEBP)
- Local background removal via `@bunnio/rembg-web` + ONNX Runtime
- Auto-crop to content with 1 px border
- Fullscreen progress bar; one-click download
- Tolerance slider variant (`/imgralph/`)

## 🧠 Usage
1. Start a static server (e.g., `python3 -m http.server 4173`).
2. Open `http://localhost:4173/index.html` (or `imgralph/index.html` for the tolerance variant).
3. Drop an image or click the zone to choose a file.
4. Wait for 100 %, then click “Télécharger” to save the cutout PNG.

## ⚙️ Settings
- Tolerance variant: “Tolérance” slider (0‑255) controls the alpha threshold used during cropping.

## 🧾 Commands
None: everything is in the UI.

## 📦 Build & Package
No build step: plain static HTML/CSS/JS.

## 🧪 Installation (Antigravity)
- Needs network access to load `onnxruntime-web` and `@bunnio/rembg-web` from CDNs.
- Works on modern browsers (Chrome/Edge/Firefox) with WebAssembly enabled.

## 🧾 Changelog
- 2.0.0 (2026-03-09): switched to `@bunnio/rembg-web` CDN, fullscreen progress, tolerance page.
- 1.0.0: initial release (background removal + auto-crop).

## 🔗 Links
- README FR: README.md
