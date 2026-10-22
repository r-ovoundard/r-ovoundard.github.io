/* =========================================================
   PORTFOLIO – JAVASCRIPT
   La page fonctionne sans ce fichier : il ajoute seulement
   des effets (amélioration progressive).
   ========================================================= */

// Le JS est bien chargé : le CSS peut afficher ce qui en dépend (le menu burger)
document.documentElement.classList.add('js');

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
   4. APPARITIONS AU DÉFILEMENT
   IntersectionObserver prévient quand un élément entre à l'écran.
   ========================================================= */
function initReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  // Rien à faire, navigateur trop ancien, ou animations réduites :
  // tout reste simplement visible
  if (!items.length || !('IntersectionObserver' in window) || reduceMotion) return;

  // Dans un groupe, chaque élément attend un peu plus que le précédent
  document.querySelectorAll('[data-reveal-group]').forEach((group) => {
    group.querySelectorAll('[data-reveal]').forEach((item, index) => {
      item.style.setProperty('--reveal-delay', `${index * 120}ms`);
    });
  });

  // C'est seulement maintenant que le CSS cache les éléments :
  // sans JS, cette classe n'existe pas, et tout est visible
  document.documentElement.classList.add('reveal-ready');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const item = entry.target;
      item.classList.add('is-visible');
      observer.unobserve(item); // une seule apparition par élément

      // Une fois l'apparition finie, on retire le marquage : l'élément
      // retrouve ses propres transitions (le survol des cartes, par exemple)
      const delay = parseInt(item.style.getPropertyValue('--reveal-delay'), 10) || 0;
      setTimeout(() => {
        item.removeAttribute('data-reveal');
        item.classList.remove('is-visible');
      }, 1300 + delay);
    });
  }, {
    threshold: 0.15,               // 15 % de l'élément doit être visible
    rootMargin: '0px 0px -8% 0px', // un peu avant le bas de l'écran
  });

  items.forEach((item) => observer.observe(item));
}

/* =========================================================
   5. CHIFFRES QUI DÉFILENT
   ========================================================= */
function countUp(element) {
  const target = Number(element.dataset.count);
  const duration = 1600;
  const start = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    // Rapide au début, puis ralentit très fort à la fin
    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    element.textContent = Math.round(target * eased);
    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length || !('IntersectionObserver' in window) || reduceMotion) return;

  counters.forEach((counter) => {
    counter.textContent = '0';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      countUp(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.6 });

  counters.forEach((counter) => observer.observe(counter));
}

/* =========================================================
   6. MENU MOBILE
   Le panneau s'ouvre en cercle depuis le bouton burger.
   ========================================================= */
function initMobileMenu() {
  const burger = document.querySelector('.burger');
  const menu = document.getElementById('mobile-menu');
  if (!burger || !menu) return;

  const isOpen = () => burger.getAttribute('aria-expanded') === 'true';

  function openMenu() {
    menu.hidden = false;
    // Deux images d'attente : le navigateur affiche d'abord le panneau fermé,
    // puis l'ouvre, sinon la transition ne se jouerait pas
    requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Fermer le menu');
    document.body.classList.add('menu-open'); // empêche la page de défiler derrière
  }

  function closeMenu() {
    menu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Ouvrir le menu');
    document.body.classList.remove('menu-open');

    // Une fois le cercle refermé, on cache vraiment le panneau
    menu.addEventListener('transitionend', function hide(event) {
      if (event.target !== menu) return;
      if (!isOpen()) menu.hidden = true;
      menu.removeEventListener('transitionend', hide);
    });
  }

  burger.addEventListener('click', () => (isOpen() ? closeMenu() : openMenu()));

  // Un lien cliqué ferme le menu
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

  // Échap ferme le menu et rend la main au bouton
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      closeMenu();
      burger.focus();
    }
  });

  // L'écran redevient large (téléphone tourné, fenêtre agrandie) : on ferme
  window.matchMedia('(min-width: 861px)').addEventListener('change', (event) => {
    if (event.matches && isOpen()) closeMenu();
  });
}
/* =========================================================
   7. FILTRES DE LA PAGE PROJETS
   ========================================================= */
function initFilters() {
  const buttons = document.querySelectorAll('.filter');
  const rows = document.querySelectorAll('.row');
  if (!buttons.length || !rows.length) return; // pas sur cette page

  // Un nom unique par ligne : le navigateur peut la suivre pendant l'animation
  rows.forEach((row, index) => {
    row.style.viewTransitionName = `projet-${index}`;
  });

  function applyFilter(filter) {
    // Le bouton cliqué devient actif, les autres non
    buttons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
    });

    // On cache les lignes qui ne correspondent pas au filtre
    rows.forEach((row) => {
      row.hidden = filter !== 'tous' && row.dataset.category !== filter;
    });
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;

      // Navigateur récent et animations autorisées : on anime
      if (document.startViewTransition && !reduceMotion) {
        document.startViewTransition(() => applyFilter(filter));
      } else {
        applyFilter(filter);
      }
    });
  });
}
/* =========================================================
   DÉMARRAGE
   ========================================================= */
initCursor();
initMagnetic();
initCtaOrigin();
initReveal();
initCounters();
initMobileMenu();
initFilters();