# Chrome Web Store Assets (PK Chrome Shortcuts)

Ce dossier regroupe les livrables à fournir à la fiche du Chrome Web Store. Aucune image n’est générée automatiquement : remplis les placeholders avec tes propres visuels, puis exporte aux dimensions imposées.

## Outil de redimensionnement/crop
Ouvre `src2/resizer.html` (ex. `php -S 0.0.0.0:4174 -t src2`) :
- Charge ton visuel source
- Choisis un preset (128×128, 1280×800, 640×400, 440×280, 1400×560)
- Zoom/molette et drag pour positionner
- Choisis la couleur de fond (pas d’alpha pour le Chrome Web Store)
- Export PNG ou JPEG directement aux bonnes dimensions

## À produire (minimum)
- `icon-128.png` — 128×128 (PNG 24 bits, sans alpha si possible)
- `screenshot-1.png` — 1280×800 (ou 640×400) — PNG/JPEG 24 bits, pas d’alpha

## Optionnel mais recommandé
- `screenshot-2.png` à `screenshot-5.png` — mêmes specs que ci‑dessus
- `promo-small-440x280.png` — 440×280
- `promo-1400x560.png` — 1400×560
- `video-url.txt` — URL YouTube promo

## Texte (rappel)
Titre: ⚡ PK Chrome Shortcuts
Résumé: Chrome shortcuts: simulated split view and tab utilities.
Description: Power-user Chrome shortcuts: split view, advanced tab navigation, and tab actions.
Detailed description: (fourni dans le prompt original)
Catégorie: Fonctionnalités et UI
Homepage: https://github.com/mondary/Chrome_PKchromeShortcuts
Site officiel: mondary.design

## Flux de travail suggéré
1) Capture dans Chrome : mets en scène ton extension (options, infobulle, badge compteur). Utilise `Cmd+Shift+P` → « Capture full size screenshot » dans DevTools pour obtenir du 1280×800 ; recadre si besoin.
2) Promo 440×280 et 1400×560 : design léger (fond coloré, icône + tagline courte). Tu peux utiliser `src2/templates/promo.html` et prendre une capture plein écran en ajustant la taille de la fenêtre au canvas indiqué.
3) Place les fichiers exportés dans `src2/assets/` avec les noms ci‑dessus.
4) Vérifie le poids (<1 Mo par image si possible) et absence d’alpha sur les promos/screen.

## Validation rapide
- Dimensions exactes (pas de redimensionnement côté Store).
- PNG/JPEG 24 bits, sans alpha pour les captures/promo.
- Icône centrée, sur fond net et lisible à 128 px.

## Templates fournis
- `templates/promo.html` — canevas simple pour générer les formats 440×280 ou 1400×560 (modifier `--w` et `--h`).

## Commandes utiles
```bash
php -S 0.0.0.0:4174 -t src2
# Ouvre http://localhost:4174/resizer.html ou templates/promo.html
```
