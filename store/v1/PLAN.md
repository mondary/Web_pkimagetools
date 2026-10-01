# Store 2 — ImgRalph

## Périmètre
Page promotionnelle indépendante, demandée le 30 septembre 2026. Tous les changements restent dans `store2/`. Aucun changement au site, à ses README ou à son versioning. La landing fonctionne sans build et sans ressource distante. Le lien vers l'application existante est une destination de navigation, pas une dépendance de rendu.

## Direction et storyboard
Papier chaud, encre presque noire, orange terre cuite, photographie botanique. Typographie système sans dépendance, titres amples, détails éditoriaux et beaucoup d'espace.

| Section | Promesse / état | Source | Interaction / mouvement | Mobile |
|---|---|---|---|---|
| Hero | Isoler le sujet | Illustration botanique générée, explicitement légendée | Comparateur manipulable au pointeur et au clavier, lecture à la demande | Texte puis visuel pleine largeur |
| Parcours | Déposer, ajuster, exporter | Fonctions vérifiées dans `src/lib/imgralph.js` | Trois étapes statiques | Empilées |
| Atelier | Visualiser la transparence sur différents fonds | Même illustration, pas de promesse de résultat IA | Couleurs de fond, réinitialisation, téléchargement de l'exemple | Contrôles accessibles, image entière |
| Détails | Local ou remove.bg, recadrage et export PNG | Code de production | FAQ native dépliable | Une colonne |
| Conclusion | Accès à l'application et soutien | Liens existants du dépôt et Ko-fi | Liens standards | CTA pleine largeur |

## Vérité produit
- Le moteur par défaut est remove.bg via un endpoint PHP. Ne pas promettre « aucun upload » pour tous les modes.
- Le moteur local utilise ONNX et télécharge ses dépendances et modèles.
- Ajustement de matte -50 à 200 ; export PNG ; recadrage alpha avec bordure de 1 px.
- Le visuel botanique est généré avec imagegen, déjà transparent : le comparateur n'est pas une preuve de segmentation.
- Les captures de production utilisent une fixture locale si l'inférence est indisponible ; elles doivent le préciser.

## Réception
- [x] Page FR/EN autonome ; traduction des métadonnées et contrôles.
- [x] Comparateur, fonds, reset et téléchargement de l'exemple.
- [x] Revue visuelle 390, 768, 1440 et 1920 px.
- [x] Clavier, mouvement réduit, contenu sans JavaScript.
- [x] Bannière 1544×500, carte 1200×630, captures.
- [x] Boucle de démonstration GIF et MP4, sources documentées.
- [x] Mesures de chargement et absence de débordement.
- [x] `git diff --check`, fichiers limités à `store2/`.

## Résultats

Réception effectuée sur Ego/Chromium : vues FR aux quatre largeurs, contrôle de débordement FR/EN aux quatre largeurs, vue mobile EN revue, clavier, téléchargement, stockage indisponible, réduction des mouvements, repli sans JS et ouverture file://. Kit revu : captures, bannière, carte, GIF et lecture MP4. Toutes les créations restent dans `store2/`. Mesures locales : LCP 60 ms, CLS 0, environ 265 Ko transférés (aucune extrapolation au réseau mobile). Voir `media-kit/validation.json`.
