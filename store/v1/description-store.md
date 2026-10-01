# ImgRalph — Store 2

**FR — Le sujet. Et c'est tout.** Détourez vos images, affinez les contours et exportez un PNG transparent automatiquement recadré.

**EN — The subject. Nothing else.** Remove backgrounds, refine edges and export an automatically cropped transparent PNG.

## Fonctions vérifiées dans le code

- Import par glisser-déposer ou sélection d'image.
- Deux moteurs : remove.bg, sélectionné par défaut et conditionné à un serveur PHP avec clé et crédits ; traitement local ONNX après téléchargement des bibliothèques et modèles.
- Trois modèles locaux : u2net, u2netp et u2net_human_seg.
- Ajustement des contours de −50 à 200.
- Recadrage au contenu alpha avec bordure de 1 px, limitée aux dimensions de l'image.
- Téléchargement PNG.

## Visuels

Le comparateur et les GIF montrent une illustration générée déjà transparente. Ils ne constituent pas une preuve de résultat du modèle. Les captures de l'application réutilisent ses sources et simulent uniquement le moteur de détourage : interface française réelle, données de démonstration, aucune inférence ni requête remove.bg. Voir [la provenance](assets/provenance.json).

| Fichier | Contenu |
|---|---|
| `screenshots/01-store2-desktop.png` | Landing complète FR, largeur 1440 |
| `screenshots/02-store2-mobile.png` | Landing complète FR, largeur 390 |
| `screenshots/03-app-empty-1280x800.png` | Interface de production, zone de dépôt |
| `screenshots/04-app-result-fixture-1600x1000.png` | Interface de production, PNG fixture et réglages |

## Liens

[Code source](https://github.com/mondary/Web_pkimagetools) · [Soutenir / Support](https://ko-fi.com/pouark)
