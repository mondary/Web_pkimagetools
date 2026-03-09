# ImgRalph

![Project icon](icon.png)

[🇫🇷 FR](README.md) · [🇬🇧 EN](README_en.md)

✨ Détourage d'images local dans le navigateur : supprime l'arrière‑plan via ONNX + rembg‑web, recadre automatiquement avec bordure 1 px, et propose un téléchargement direct.

## ✅ Fonctionnalités
- Glisser‑déposer ou sélection de fichier (PNG/JPG/WEBP)
- Détourage local via `@bunnio/rembg-web` + ONNX Runtime
- Recadrage automatique au contenu (bordure 1 px)
- Barre de progression plein écran, téléchargement en un clic
- Variante avec curseur de tolérance alpha (`/imgralph/`)

## 🧠 Utilisation
1. Lancer un serveur statique local (ex. `python3 -m http.server 4173`).
2. Ouvrir `http://localhost:4173/index.html` (ou `imgralph/index.html` pour la variante tolérance).
3. Déposer une image ou cliquer sur la zone pour choisir un fichier.
4. Attendre 100 % puis cliquer sur « Télécharger » pour récupérer le PNG détouré.

## ⚙️ Réglages
- Variante tolérance : curseur « Tolérance » (0‑255) pour ajuster le seuil alpha du recadrage.

## 🧾 Commandes
Aucune commande spécifique : tout se fait dans l'UI.

## 📦 Build & Package
Aucune build : fichiers statiques (HTML/CSS/JS) servis tels quels.

## 🧪 Installation (Antigravity)
- Dépendances : accès réseau pour charger `onnxruntime-web` et `@bunnio/rembg-web` depuis les CDN.
- Compatible navigateurs modernes (Chrome/Edge/Firefox) avec WebAssembly.

## 🧾 Changelog
- 2.0.0 (2026-03-09) : passage au CDN `@bunnio/rembg-web`, écran de progression plein écran, page tolérance.
- 1.0.0 : version initiale (détourage + recadrage auto).

## 🔗 Liens
- README EN : README_en.md
