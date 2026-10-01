# Store 3 — ImgRalph

## Périmètre
Page promotionnelle indépendante demandée le 30 septembre 2026 après revue critique de Store 2. Tous les fichiers restent dans store3/. Le site existant, ses README et son versioning ne sont pas modifiés.

## Correction par rapport à Store 2
- Supprimer l’« atelier » qui laissait croire qu’on peut changer le fond dans l’app.
- Centrer la page sur le geste réel : dépôt d’une image, progression plein écran, résultat et téléchargement.
- Reproduire l’interface de production plutôt qu’un comparateur décoratif.
- Garder un sujet unique et net comme preuve visuelle.

## Vérité produit vérifiée dans src/index.html, src/style.css et src/lib/imgralph.js
- Toute la page est une zone de dépôt ; le clic ouvre le sélecteur de fichier.
- Pendant le drag, un voile vert affiche « Déposez une image ».
- Le traitement ouvre un overlay plein écran dont la barre verte remplit l’écran de bas en haut.
- Le pourcentage devient « Télécharger » à 100 %.
- Sources réelles : remove.bg via API, ou local navigateur avec ONNX/rembg-web.
- Modèles : u2net, u2netp, u2net_human_seg.
- Réglage de détourage de -50 à 200 ; export PNG avec recadrage automatique et bordure de 1 px.
- remove.bg envoie l’image au service ; le mode local télécharge dépendances et modèle. Aucune promesse « 100 % hors ligne ».

## Storyboard
1. Hero : promesse « Déposez l’image. Gardez le sujet. » et reproduction de l’état vide de l’UI.
2. Geste : captures vide / drag / progression / résultat, avec l’UI de production comme source.
3. Scène signature : la page devient la barre de progression, avec les libellés et couleurs réels.
4. Réglages : source, modèle, détourage, recadrage et export, sans inventer de fonctions.
5. Conclusion : ouverture de l’outil et soutien Ko-fi.

## Réception
- [x] FR/EN dans un fichier, FR par défaut, bascule manuelle prioritaire.
- [x] Reproduction visuelle de l’UI réelle et captures revues.
- [x] 390, 768, 1440, 1920 px sans débordement.
- [x] Clavier, focus visible, alt textes, prefers-reduced-motion.
- [x] Bannière 1544×500, carte 1200×630, captures Store, GIF large, GIF compact, MP4.
- [x] Poids initial mesuré, git diff --check.

## Résultat
- Page autonome : store3/index.html.
- Captures d’interface : store3/screenshots/01 à 04.
- Kit : bannière 1544×500, carte 1200×630, GIF 880×550, GIF 560×350, MP4 1280×800.
- Chargement initial local mesuré sur disque : 53 319 octets pour HTML + CSS + JS + icône. Les images de preuve sont lazy et totalisent 304 312 octets.
- QA Ego : aucun débordement à 390, 768, 1440 et 1920 px ; bascule EN au clavier ; mouvement réduit ; cinq sections visibles sans JavaScript ; LCP local 160 ms ; CLS 0.
- git diff --check : OK.
