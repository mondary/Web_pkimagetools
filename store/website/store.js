(() => {
  "use strict";
  document.documentElement.classList.add("js");

  const messages = {
    fr: {
      "nav.gesture": "Le geste",
      "nav.settings": "Réglages",
      "nav.open": "Ouvrir l’outil",
      "hero.eyebrow": "Store 3 · interface réelle",
      "hero.title.a": "Déposez l’image.",
      "hero.title.b": "Gardez le sujet.",
      "hero.lede": "ImgRalph ne vous installe pas dans un atelier compliqué. La page entière est la zone de dépôt, le traitement remplit l’écran, puis le bouton devient « Télécharger ».",
      "hero.open": "Détourer une image",
      "hero.replay": "Revoir le geste",
      "hero.support": "Soutenir sur Ko-fi",
      "hero.formats": "PNG, JPG ou WebP en entrée · PNG transparent en sortie",
      "hero.drop": "Déposez une image",
      "hero.processing": "Traitement en cours…",
      "hero.download": "Télécharger le PNG ↓",
      "hero.caption": "Démo animée du parcours complet. Le traitement est simulé ici ; ouvrez l’outil pour utiliser votre image.",
      "sequence.eyebrow": "Preuve",
      "sequence.title": "Trois écrans, un seul geste.",
      "sequence.drag": "Le drag recouvre toute la page.",
      "sequence.progress": "La progression devient l’écran.",
      "sequence.result": "À 100 %, le sujet est isolé.",
      "signature.eyebrow": "Scène",
      "signature.title": "La page devient la barre de progression.",
      "signature.lede": "Cette scène illustre le résultat avec une voiture synthwave. La progression est simulée et locale à cette page : aucune image n’est envoyée pendant la visite.",
      "signature.replay": "Rejouer la progression",
      "facts.eyebrow": "Ce que l’app fait vraiment",
      "facts.title": "Deux sources, trois modèles, un PNG.",
      "facts.source.title": "Source",
      "facts.source.body": "remove.bg via API, ou local dans le navigateur avec ONNX et rembg-web. En mode API, l’image est envoyée au service ; en mode local, dépendances et modèle sont téléchargés.",
      "facts.model.title": "Modèle",
      "facts.model.body": "u2net pour la qualité, u2netp pour la rapidité, u2net_human_seg pour les personnes. Le choix reste celui de l’interface réelle.",
      "facts.export.title": "Détourage et export",
      "facts.export.body": "Le curseur va de -50 à 200, le contenu est recadré automatiquement avec une bordure de 1 px, et l’export est un PNG transparent.",
      "final.title": "Le sujet. Et c’est tout.",
      "final.body": "Ouvrez l’outil, déposez une image et laissez ImgRalph faire le reste.",
      "final.open": "Ouvrir ImgRalph",
      "final.support": "Soutenir sur Ko-fi",
      "footer.note": "Dossier Store 3 · captures et réplique générées depuis l’interface de production."
    },
    en: {
      "nav.gesture": "The gesture",
      "nav.settings": "Settings",
      "nav.open": "Open the tool",
      "hero.eyebrow": "Store 3 · real interface",
      "hero.title.a": "Drop the image.",
      "hero.title.b": "Keep the subject.",
      "hero.lede": "ImgRalph doesn’t put you in a complicated studio. The whole page is the drop zone, processing fills the screen, then the button becomes “Download.”",
      "hero.open": "Remove an image background",
      "hero.replay": "See the gesture again",
      "hero.support": "Support on Ko-fi",
      "hero.formats": "PNG, JPG, or WebP in · transparent PNG out",
      "hero.drop": "Drop an image",
      "hero.processing": "Processing…",
      "hero.download": "Download PNG ↓",
      "hero.caption": "Animated walkthrough from drop to result. Processing is simulated here; open the tool to use your own image.",
      "sequence.eyebrow": "Proof",
      "sequence.title": "Three screens, one gesture.",
      "sequence.drag": "Dragging covers the entire page.",
      "sequence.progress": "Progress becomes the screen.",
      "sequence.result": "At 100%, the subject stands alone.",
      "signature.eyebrow": "Scene",
      "signature.title": "The page becomes the progress bar.",
      "signature.lede": "This scene illustrates the result with a synthwave car. Progress is simulated and local to this page: no image is uploaded while you visit.",
      "signature.replay": "Replay the progress",
      "facts.eyebrow": "What the app actually does",
      "facts.title": "Two sources, three models, one PNG.",
      "facts.source.title": "Source",
      "facts.source.body": "remove.bg through its API, or locally in the browser with ONNX and rembg-web. In API mode the image is sent to the service; in local mode dependencies and the model are downloaded.",
      "facts.model.title": "Model",
      "facts.model.body": "u2net for quality, u2netp for speed, u2net_human_seg for people. These are the choices from the real interface.",
      "facts.export.title": "Cutout and export",
      "facts.export.body": "The slider ranges from -50 to 200, content is auto-cropped with a 1 px border, and the export is a transparent PNG.",
      "final.title": "The subject. Nothing else.",
      "final.body": "Open the tool, drop an image, and let ImgRalph handle the rest.",
      "final.open": "Open ImgRalph",
      "final.support": "Support on Ko-fi",
      "footer.note": "Store 3 folder · captures and replica generated from the production interface."
    }
  };

  const statuses = {
    fr: ["Image chargée. Lancement du détourage…", "Traitement en cours…", "Terminé !"],
    en: ["Image loaded. Starting cutout…", "Processing…", "Done!"]
  };
  const readyLabels = { fr: "Rejouer", en: "Replay" };

  let currentLang = "fr";
  let frame = null;
  let startedAt = 0;
  const duration = 2600;

  const shell = document.getElementById("demoShell");
  const bar = document.getElementById("demoBar");
  const percent = document.getElementById("demoPercent");
  const status = document.getElementById("demoStatus");
  const controls = document.getElementById("demoControls");
  const matte = document.getElementById("demoMatte");
  const matteValue = document.getElementById("demoMatteValue");
  const heroDemo = document.getElementById("heroDemo");
  const heroFill = document.getElementById("heroFill");
  const heroPct = document.getElementById("heroPct");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let heroTimers = [];
  let heroFrame = null;
  let heroVisible = true;

  function stopHero() {
    heroTimers.forEach(clearTimeout);
    heroTimers = [];
    if (heroFrame !== null) cancelAnimationFrame(heroFrame);
    heroFrame = null;
  }

  function scheduleHero(callback, delay) {
    heroTimers.push(setTimeout(callback, delay));
  }

  function playHero() {
    stopHero();
    heroFill.style.width = "0%";
    heroPct.textContent = "0%";
    heroDemo.dataset.state = "idle";
    if (reducedMotion.matches) {
      heroDemo.dataset.state = "done";
      return;
    }
    scheduleHero(() => { heroDemo.dataset.state = "drag"; }, 650);
    scheduleHero(() => {
      heroDemo.dataset.state = "processing";
      const start = performance.now();
      function advance(now) {
        const pct = Math.min(100, Math.round((now - start) / 2500 * 100));
        heroFill.style.width = pct + "%";
        heroPct.textContent = pct + "%";
        if (pct < 100) heroFrame = requestAnimationFrame(advance);
        else heroFrame = null;
      }
      heroFrame = requestAnimationFrame(advance);
    }, 2250);
    scheduleHero(() => { heroDemo.dataset.state = "done"; }, 5050);
    scheduleHero(() => { if (heroVisible && !document.hidden) playHero(); }, 9000);
  }

  function applyLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    heroDemo.setAttribute("aria-label", lang === "fr" ? "Démonstration animée : dépôt, traitement simulé, résultat synthwave" : "Animated demo: drop, simulated processing, synthwave result");
    document.querySelector(".screen-car").setAttribute("aria-label", lang === "fr" ? "Voiture rétro synthwave devant un soleil rose et une grille violette" : "Retro synthwave car in front of a pink sun and violet grid");
    document.getElementById("demoImage").alt = lang === "fr" ? "Illustration d’une voiture rétro synthwave isolée du décor." : "Illustration of a retro synthwave car isolated from the background.";
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const value = messages[lang][node.dataset.i18n];
      if (value) node.textContent = value;
    });
    document.querySelectorAll("[data-set-lang]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.setLang === lang));
    });
    if (shell.dataset.state === "done") {
      percent.textContent = readyLabels[lang];
      status.textContent = statuses[lang][2];
    }
    try {
      localStorage.setItem("store3-lang", lang);
    } catch (error) {
      // Storage can be unavailable; the current choice remains active.
    }
  }

  function renderProgress(value) {
    const pct = Math.max(0, Math.min(100, Math.round(value)));
    shell.dataset.state = pct >= 100 ? "done" : "running";
    bar.style.width = pct + "%";
    percent.textContent = pct >= 100 ? readyLabels[currentLang] : pct + "%";
    percent.classList.toggle("is-ready", pct >= 100);
    status.textContent = pct >= 100 ? statuses[currentLang][2] : pct > 18 ? statuses[currentLang][1] : statuses[currentLang][0];
    controls.hidden = pct < 100;
  }

  function tick(now) {
    if (!startedAt) startedAt = now;
    const progress = Math.min(100, ((now - startedAt) / duration) * 100);
    renderProgress(progress);
    if (progress < 100) frame = requestAnimationFrame(tick);
    else frame = null;
  }

  function replay() {
    if (frame) cancelAnimationFrame(frame);
    startedAt = 0;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      renderProgress(100);
      return;
    }
    renderProgress(0);
    frame = requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      if (entry.target.classList.contains("signature") && shell.dataset.state === "idle") replay();
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.18 });
  document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));

  document.querySelectorAll("[data-set-lang]").forEach((button) => {
    button.addEventListener("click", () => applyLanguage(button.dataset.setLang));
  });
  document.querySelectorAll("[data-replay]").forEach((button) => {
    button.addEventListener("click", () => {
      const inSignature = button.closest(".signature");
      const target = inSignature ? document.querySelector(".signature") : heroDemo;
      target.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "center" });
      if (inSignature) replay();
      else playHero();
    });
  });
  const heroObserver = new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting;
    if (heroVisible && !document.hidden) playHero();
    else stopHero();
  }, { threshold: 0.1 });
  heroObserver.observe(heroDemo);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopHero();
    else if (heroVisible) playHero();
  });
  reducedMotion.addEventListener("change", () => { if (heroVisible) playHero(); });
  matte.addEventListener("input", () => {
    matteValue.textContent = matte.value;
  });
  percent.addEventListener("click", () => {
    if (shell.dataset.state === "done") replay();
  });

  let storedLang = null;
  try {
    storedLang = localStorage.getItem("store3-lang");
  } catch (error) {
    storedLang = null;
  }
  const detected = navigator.language && navigator.language.toLowerCase().indexOf("en") === 0 ? "en" : "fr";
  applyLanguage(storedLang === "en" || storedLang === "fr" ? storedLang : detected);
})();
