# ImgRalph

![Project icon](icon.png)

[FR](README.md) · [EN](README_en.md)

PK · version **2026.10.05**

Détourage via remove.bg (API, par défaut) ou localement dans le navigateur avec ONNX et rembg-web. Le mode API transmet l’image au service externe.

![ImgRalph](store/website/screenshots/01-app-empty-1440x900.png)

## Fonctionnalités

- Glisser-déposer ou sélection de fichier PNG/JPG/WebP.
- Progression plein écran et téléchargement du PNG transparent.
- Recadrage automatique avec une bordure de 1 px.
- Curseur de détourage de −50 à 200 et modèles locaux u2net, u2netp, u2net_human_seg.

## Installation et utilisation

Aucune compilation. Pour le mode API, utiliser PHP avec cURL et configurer la clé côté serveur selon [secrets/README.md](secrets/README.md).

```sh
php -S localhost:4173 -t src
```

Ouvrir http://localhost:4173, déposer une image, puis cliquer sur « Télécharger » à la fin du traitement. Le mode local télécharge ses dépendances et son modèle ; il nécessite un navigateur moderne avec WebAssembly.

Pour consulter la page promotionnelle FR/EN :

```sh
python3 -m http.server 4174
```

Ouvrir http://localhost:4174/store/website/index.html. La landing montre une séquence animée de dépôt à résultat avec une voiture synthwave et un bouton de soutien Ko-fi ; ce traitement promotionnel est simulé et n’envoie pas d’image. La version précédente reste dans `store/v1/`.

## Historique

Voir le [CHANGELOG](CHANGELOG.md).

## Soutenir

Soutenir ce projet sur [Ko-fi](https://ko-fi.com/pouark).
