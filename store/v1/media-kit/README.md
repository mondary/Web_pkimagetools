# Kit média — Store 2

## Livrables

| Asset | Format | Source |
|---|---|---|
| [Bannière](../assets/banner-1544x500.png) | 1544 × 500 PNG | Landing, mode `?export=banner&lang=fr` |
| [Carte sociale](../assets/card-1200x630.png) | 1200 × 630 PNG | Landing, mode `?export=card&lang=fr` |
| [Desktop](../screenshots/01-store2-desktop.png) | PNG pleine page, largeur 1440 | Landing FR |
| [Mobile](../screenshots/02-store2-mobile.png) | PNG pleine page, largeur 390 | Landing FR |
| [Interface vide](../screenshots/03-app-empty-1280x800.png) | 1280 × 800 PNG | HTML/CSS/JS de production |
| [Interface résultat](../screenshots/04-app-result-fixture-1600x1000.png) | 1600 × 1000 PNG | Interface de production, résultat simulé |
| [Master](../videos/demo.mp4) | H.264, 1280 × 720, 24 fps, 8 s | Capture déterministe du comparateur |
| [GIF large](../gifs/demo-wide.gif) | 960 × 540, 12 fps, boucle | Master |
| [GIF compact](../gifs/demo-compact.gif) | 480 × 270, 10 fps, boucle | Master |

Le film est une boucle de démonstration de l'illustration interactive : le curseur apparaît sur la poignée, déplace la séparation entre fond argile et damier, puis revient à l'état initial. Aucun temps de calcul IA, appel réseau, clic de traitement ou résultat de segmentation n'est simulé dans cette animation. Ce n'est pas un film publicitaire cinématique. Sans audio.

## Régénération

Toutes les commandes partent de la **racine du dépôt**. Prérequis : Python 3, Ego Browser 2.x installé et lancé, FFmpeg/FFprobe avec encodeur H.264. Exports réalisés avec Python 3.9 et FFmpeg 9.0.1. Pas de téléchargement ni d'installation automatique.

1. Lancer le serveur dans un terminal :

```sh
python3 -m http.server 4186 --bind 127.0.0.1
```

2. Générer l'adaptateur de capture depuis les sources réelles :

```sh
python3 store2/media-kit/prepare-capture.py
```

Ce script lit `src/index.html`, `src/style.css` et `src/lib/imgralph.js`, incorpore leurs octets dans `production.html`, retire les scripts CDN et fournit un adaptateur RembgWeb/ort. Le mode local est sélectionné avant import. L'adaptateur retourne le PNG botanique redimensionné en 480 × 480 ; **le vrai code de matte, recadrage, réglages et téléchargement reste intact**. Les SHA-256 des fichiers sources sont enregistrés dans `production-sources.json`.

3. Créer une TaskSpace une seule fois pour cette tâche, ou réutiliser son identifiant si elle existe déjà :

```sh
ego-browser nodejs -e 'const task = await taskSpace("Store 2 media capture"); console.log(task.spaceId);'
```

4. Passer cet identifiant numérique au script (remplacer `ID` par le nombre affiché) :

```sh
python3 store2/media-kit/capture.py --space ID --url http://127.0.0.1:4186/store2/
```

Le lanceur transmet explicitement racine, URL et TaskSpace, car le runtime embarqué d'Ego n'hérite pas du dossier de travail ou des variables du shell. Les 192 frames PNG sont stockées dans un dossier temporaire dédié ; son chemin est affiché sous `frameDirectory`.

5. Encoder, en remplaçant `CHEMIN_FRAMES` par ce chemin :

```sh
sh store2/media-kit/encode.sh CHEMIN_FRAMES
```

6. Ouvrir [la page de revue](preview.html), vérifier images et boucle, puis fermer la TaskSpace en remplaçant `ID` :

```sh
ego-browser nodejs -e 'const task = await taskSpace(ID); await task.finish({keep: []});'
```

Le script ne ferme pas la TaskSpace automatiquement pour permettre la revue. Arrêter uniquement le serveur créé pour cette tâche, avec Ctrl-C dans son terminal.

## Sources et limites

- [Provenance et prompt exact](../assets/provenance.json). Botanique générée avec l'outil intégré imagegen ; original PNG et WebP optimisé conservés dans `assets/`.
- Pas de dépendance d'exécution à un autre dépôt ou à la bibliothèque de skills. La landing ne charge que ses fichiers locaux.
- La copie de production est réservée à la capture. Elle n'est pas liée depuis la landing et ne remplace pas l'application.
- Les captures de production sont légendées « résultat simulé ». Elles ne valident ni les modèles ONNX, ni remove.bg, ni les conditions d'hébergement du produit.
- La matte positive du produit peut rendre visibles des franges ou pixels très faiblement opaques sur ce PNG. Les captures ne retouchent pas ce comportement.
- L'interface produit reste en français, quelle que soit la langue de la landing.
- Les liens vers l'outil sont relatifs au dépôt. Pour héberger uniquement `store2/`, adapter leurs destinations à l'URL réelle du produit.

## Vérifications

Voir [validation.json](validation.json) pour les mesures locales et la couverture de contrôle. Le réseau de production, les performances mobiles réelles et l'inférence ne sont pas validés par ce kit.
