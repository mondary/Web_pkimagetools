# Store 3 — ImgRalph

Page promotionnelle indépendante, centrée sur le geste réel de l’application : déposer une image, attendre la progression plein écran, puis télécharger le PNG transparent.

## Ouvrir

Depuis la racine du dépôt :

    python3 -m http.server 4174

Puis ouvrir :

    http://localhost:4174/store3/index.html

## Contenu

- store3/index.html — landing FR/EN autonome.
- store3/style.css — style, scène de progression et responsive.
- store3/store.js — détection de langue, bascule manuelle, progression locale.
- store3/screenshots — captures 16:10 des états vide, drag, progression et résultat.
- store3/assets — bannière 1544×500, carte 1200×630, sujet et versions WebP.
- store3/gifs — boucle large et boucle compacte.
- store3/videos — master MP4.
- store3/media-kit — réplique de production, scripts Ego et captures de QA.

## Vérité produit

L’application propose remove.bg via API ou un moteur local ONNX/rembg-web. Le mode API envoie l’image au service ; le mode local télécharge ses dépendances et son modèle. Le curseur de détourage va de -50 à 200, le contenu est recadré automatiquement avec une bordure de 1 px, et l’export est un PNG transparent. Il n’y a pas d’éditeur de fond dans l’application ; Store 3 ne le suggère plus.

## Reproductibilité

Les captures et l’animation sont générées avec Ego Browser depuis la réplique de production locale :

    ego-browser nodejs < store3/media-kit/capture.mjs
    ego-browser nodejs < store3/media-kit/capture-animation.mjs
    ego-browser nodejs < store3/media-kit/capture-page.mjs

Les GIF et le MP4 sont encodés avec ffmpeg ; les commandes et limites sont détaillées dans store3/media-kit/README.md.
