# Store 2 — ImgRalph

Landing promotionnelle indépendante, réalisée avec le workflow `premium-promo-media`. Aucun fichier du site existant n'est modifié.

- [Ouvrir la page](index.html)
- [Bannière 1544 × 500](assets/banner-1544x500.png) · [Carte 1200 × 630](assets/card-1200x630.png)
- [Démo MP4](videos/demo.mp4) · [GIF large](gifs/demo-wide.gif) · [GIF compact](gifs/demo-compact.gif)
- [Capture desktop](screenshots/01-store2-desktop.png) · [Capture mobile](screenshots/02-store2-mobile.png)
- [Kit média, commandes et limites](media-kit/README.md)
- [Storyboard et réception](PLAN.md)

## Ouvrir

Double-cliquer sur `store2/index.html`, ou, depuis la racine du dépôt :

```sh
python3 -m http.server 4186 --bind 127.0.0.1
```

Puis ouvrir <http://127.0.0.1:4186/store2/>. Aucun build, gestionnaire de paquets, CDN ou police distante.

Le dossier peut être copié séparément. Les seuls liens sortant de ce dossier sont les destinations GitHub, Ko-fi et les boutons « Ouvrir l'outil », qui pointent vers `../src/index.html`. Pour un hébergement séparé du produit, remplacer uniquement ces trois `href` par son URL réelle. Aucun appel à l'application n'est effectué par la landing.

## Contenu et interactions

FR/EN dans le même document ; détection de la première langue prise en charge, défaut FR, choix manuel mémorisé quand le stockage est accessible. `?lang=fr` et `?lang=en` permettent de forcer une langue pour les captures. Le contenu reste lisible en français sans JavaScript.

Comparateur accessible au clavier et au pointeur, animation de huit secondes à la demande, prévisualisation de cinq fonds, reset et téléchargement du PNG transparent source. Le changement de fond ne modifie pas le PNG téléchargé. La préférence système de mouvement réduit remplace l'animation par un changement statique ; la lecture s'arrête hors écran ou quand l'onglet est masqué.

La photographie botanique est une **illustration générée, déjà transparente**, pas le résultat d'une segmentation par ImgRalph. Le code réel propose remove.bg par défaut et un mode local ONNX ; la FAQ expose cette différence.

## English

Standalone bilingual promotional page. Open `index.html` directly or serve the repository with the command above. All visual assets are local. The app links target the existing `../src/index.html`; update these links if hosting Store 2 separately. The generated botanical cutout demonstrates transparency, not AI segmentation. The download provides the original transparent PNG; background colors are preview-only.

Support / Soutenir : [Ko-fi](https://ko-fi.com/pouark).
