# Media kit Store 3

## Sources

- production-replica.html et production-replica.css reproduisent le DOM visible, les couleurs, le voile de drag, l’overlay de progression, le pourcentage, le statut et les contrôles de src/index.html et src/style.css.
- Le sujet de démonstration est assets/subject.png, copié depuis Store 2 et déjà transparent. Il ne s’agit pas d’un résultat d’inférence.
- Aucune clé API n’est utilisée. Aucune image n’est envoyée. Aucun modèle ONNX n’est téléchargé pendant la capture.

## États capturés

- 01 : page vide, cadre pointillé et « Déposez une image ».
- 02 : voile vert pendant le drag.
- 03 : progression 68 %, image encore masquée et contrôles cachés, comme dans le code de production.
- 04 : progression 100 %, sujet visible, bouton « Télécharger », contrôles Source / Modèle / Détourage.

## Commandes

Captures fixes :

    ego-browser nodejs < store3/media-kit/capture.mjs

Boucle frame par frame :

    ego-browser nodejs < store3/media-kit/capture-animation.mjs

QA responsive, EN, mouvement réduit et sans JS :

    ego-browser nodejs < store3/media-kit/capture-page.mjs

Revue des sections :

    ego-browser nodejs < store3/media-kit/capture-sections.mjs

Encodage :

    ffmpeg -y -framerate 12 -i /private/tmp/store3-frames-8c3f/frame-%03d.png -vf "fps=12,scale=880:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=4" -loop 0 ../gifs/demo-wide.gif
    ffmpeg -y -framerate 12 -i /private/tmp/store3-frames-8c3f/frame-%03d.png -vf "fps=10,scale=560:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=bayer:bayer_scale=5" -loop 0 ../gifs/demo-compact.gif
    ffmpeg -y -framerate 12 -i /private/tmp/store3-frames-8c3f/frame-%03d.png -vf "scale=1280:-2:flags=lanczos" -c:v libx264 -crf 24 -preset medium -pix_fmt yuv420p -movflags +faststart ../videos/demo.mp4

## Limites

La réplique est déterministe : elle sert le kit média et la démonstration promotionnelle. Elle ne prouve pas la qualité de segmentation d’une photo utilisateur et ne remplace pas les tests fonctionnels de src/lib/imgralph.js.
