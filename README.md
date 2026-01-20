# pkimagetools

Outil web local pour détourer des images (PNG, JPG, WEBP) directement dans le navigateur.
Optimisé pour les logos, avec un export PNG transparent et un outil de crop 1px.

## Utilisation

- Ouvrir `index.html` dans un navigateur moderne.
- Glisser-déposer une image, ou cliquer pour choisir un fichier.
- Télécharger le résultat en PNG.

## Structure

- `index.html` : page principale
- `icon.png` : icône du projet
- `assets/` : CSS, JS, et librairie vendor
- `-pk/` : scripts
- `meta/` : version/changelog

## Notes

Le détourage s’appuie sur `rembg-web` et ONNX Runtime (chargé via CDN).
