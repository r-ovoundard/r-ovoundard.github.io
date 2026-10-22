/* =========================================================
   PAGE PARCOURS – JAVASCRIPT
   Comme main.js : la page fonctionne sans ce fichier,
   il ajoute seulement des effets liés au défilement.
   ========================================================= */
(() => {
  // Animations réduites demandées : on laisse tout visible, sans effet
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  /* =========================================================
     1. LE MANIFESTE : les mots s'allument un à un
     ========================================================= */
  const quote = document.querySelector('[data-words]');
  let words = [];

  if (quote) {
    // On découpe le texte en mots, chacun dans son <span>
    const text = quote.textContent.trim().replace(/\s+/g, ' ');
    quote.setAttribute('aria-label', text); // lu d'un seul bloc par les lecteurs d'écran
    quote.innerHTML = text
      .split(' ')
      .map((word) => `<span class="word" aria-hidden="true">${word}</span>`)
      .join(' ');
    words = [...quote.querySelectorAll('.word')];
    document.documentElement.classList.add('words-ready');
  }

  function updateQuote() {
    if (!words.length) return;
    const rect = quote.getBoundingClientRect();
    const vh = window.innerHeight;

    // 0 quand le haut du texte arrive à 85 % de l'écran,
    // 1 quand son bas atteint 45 % de l'écran
    const start = vh * 0.85;
    const distance = rect.height + vh * 0.4;
    const progress = clamp((start - rect.top) / distance, 0, 1);
    const lit = Math.round(progress * words.length);

    words.forEach((word, index) => {
      word.classList.toggle('is-lit', index < lit);
      word.classList.toggle('is-edge', index === lit - 1 && lit < words.length);
    });
  }

  /* =========================================================
     2. LA FRISE : le trait de braise se remplit,
        et chaque étape s'allume quand il l'atteint
     ========================================================= */
  const timeline = document.querySelector('.timeline');
  const items = timeline ? [...timeline.querySelectorAll('.tl-item')] : [];

  if (timeline) {
    timeline.classList.add('tl-ready');
  }

  function updateTimeline() {
    if (!timeline) return;
    const rect = timeline.getBoundingClientRect();
    const trigger = window.innerHeight * 0.6; // la "ligne d'allumage" : 60 % de l'écran

    // Quelle part de la frise est passée au-dessus de cette ligne ?
    const fill = clamp((trigger - rect.top) / rect.height, 0, 1);
    timeline.style.setProperty('--fill', fill.toFixed(4));

    // Une étape s'allume quand son point passe la ligne
    items.forEach((item) => {
      const dot = item.querySelector('.tl-dot');
      const dotTop = dot.getBoundingClientRect().top;
      item.classList.toggle('is-lit', dotTop < trigger);
    });
  }

  /* =========================================================
     DÉFILEMENT : une seule mise à jour par image
     ========================================================= */
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateQuote();
      updateTimeline();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();
