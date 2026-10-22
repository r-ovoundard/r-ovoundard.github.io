/* =========================================================
   PORTFOLIO – JAVASCRIPT
   La page fonctionne sans ce fichier : il ajoute seulement
   des effets (amélioration progressive).
   ========================================================= */

// Une vraie souris ? (pas un écran tactile)
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
// L'utilisateur a-t-il demandé moins d'animations dans son système ?
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fancyEffects = canHover && !reduceMotion;

/* =========================================================
   1. CURSEUR PERSONNALISÉ
   Un point qui suit la souris exactement, et un anneau
   qui le rattrape avec un peu de retard.
   ========================================================= */
function initCursor() {
  if (!fancyEffects) return;

  // Le curseur est créé par le JS : sans JS, il n'existe pas
  const dot = document.createElement('div');
  dot.className = 'cursor-dot';

  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  ring.innerHTML = '<span class="cursor-circle"><span class="cursor-label"></span></span>';

  document.body.append(dot, ring);
  document.documentElement.classList.add('has-cursor'); // cache la flèche normale

  const label = ring.querySelector('.cursor-label');

  // Position de la souris, et position de l'anneau (qui la poursuit)
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener('pointermove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`; // le point suit exactement
    document.documentElement.classList.add('cursor-visible');
  });

  // La souris sort de la fenêtre : on cache le curseur
  document.documentElement.addEventListener('mouseleave', () => {
    document.documentElement.classList.remove('cursor-visible');
  });

  // À chaque image (60 fois par seconde), l'anneau parcourt 15 % de la
  // distance qui le sépare de la souris : il ralentit en arrivant.
  function follow() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(follow);
  }
  follow();

  // Survol d'un élément cliquable, ou d'un élément avec data-cursor
  const INTERACTIVE = 'a, button, [data-cursor]';

  document.addEventListener('pointerover', (event) => {
    const target = event.target.closest(INTERACTIVE);
    if (!target) return;

    // Le mot à afficher : celui du lien lui-même, sinon celui de son conteneur
    const holder = target.closest('[data-cursor]');
    const text = target.matches('a, button') && !target.dataset.cursor
      ? ''
      : holder?.dataset.cursor || '';

    ring.classList.add('is-hover');
    ring.classList.toggle('has-label', Boolean(text));
    dot.classList.toggle('is-hidden', Boolean(text));
    label.textContent = text;
  });

  document.addEventListener('pointerout', (event) => {
    const target = event.target.closest(INTERACTIVE);
    // On ne réagit que si la souris quitte vraiment l'élément
    if (!target || target.contains(event.relatedTarget)) return;

    ring.classList.remove('is-hover', 'has-label');
    dot.classList.remove('is-hidden');
  });

  // Au clic, l'anneau se contracte
  window.addEventListener('pointerdown', () => ring.classList.add('is-pressed'));
  window.addEventListener('pointerup', () => ring.classList.remove('is-pressed'));
}

/* =========================================================
   2. BOUTONS MAGNÉTIQUES
   Le bouton se décale vers la souris, proportionnellement
   à la distance entre la souris et son centre.
   ========================================================= */
function initMagnetic() {
  if (!fancyEffects) return;

  document.querySelectorAll('.btn, .to-top, .scroll-badge').forEach((element) => {
    const strength = 0.3; // 30 % de la distance

    element.addEventListener('pointermove', (event) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - (rect.left + rect.width / 2);
      const y = event.clientY - (rect.top + rect.height / 2);
      // "translate" (et pas "transform") : ne gêne pas les autres effets du bouton
      element.style.translate = `${x * strength}px ${y * strength}px`;
    });

    element.addEventListener('pointerleave', () => {
      element.style.translate = ''; // retour en place (avec la transition CSS)
    });
  });
}

/* =========================================================
   3. "TRAVAILLONS ENSEMBLE" : le cercle part de la souris
   On transmet au CSS le point d'entrée (--cx, --cy).
   ========================================================= */
function initCtaOrigin() {
  const cta = document.querySelector('.cta');
  if (!cta) return;

  function setOrigin(event) {
    const rect = cta.getBoundingClientRect();
    cta.style.setProperty('--cx', `${event.clientX - rect.left}px`);
    cta.style.setProperty('--cy', `${event.clientY - rect.top}px`);
  }

  cta.addEventListener('pointerenter', setOrigin); // le cercle naît là où on entre…
  cta.addEventListener('pointerleave', setOrigin); // …et se rétracte là où on sort
}

/* =========================================================
   DÉMARRAGE
   ========================================================= */
initCursor();
initMagnetic();
initCtaOrigin();