/* =========================================================
   PAGE CONTACT – JAVASCRIPT
   Sans ce fichier, le formulaire marche quand même :
   il est envoyé directement à Formspree.
   ========================================================= */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================================================
     1. L'HORLOGE DE PARIS
     ========================================================= */
  const clock = document.querySelector('.clock');
  const clockTime = document.getElementById('clock-time');
  const clockStatus = document.getElementById('clock-status');

  // Intl affiche l'heure d'un fuseau précis, où que soit le visiteur
  const parisTime = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  });

  function updateClock() {
    const now = new Date();
    const parts = parisTime.formatToParts(now);
    const hour = Number(parts.find((part) => part.type === 'hour').value);

    clockTime.textContent = parisTime.format(now);
    clockTime.dateTime = now.toISOString();

    // Entre 8 h et 22 h, c'est la journée : point vert
    const isDay = hour >= 8 && hour < 22;
    clock.classList.toggle('is-day', isDay);
    clockStatus.textContent = isDay
      ? 'Réponse en général dans la journée'
      : 'Je vous répondrai dès demain';
  }

  if (clock) {
    updateClock();
    setInterval(updateClock, 30 * 1000); // toutes les 30 secondes
  }

  /* =========================================================
     2. L'ADRESSE EMAIL, ASSEMBLÉE ICI (anti-robots)
     ========================================================= */
  const mailLink = document.getElementById('mail-link');
  let email = '';

  if (mailLink) {
    email = `${mailLink.dataset.user}@${mailLink.dataset.domain}`;
    mailLink.textContent = email;
    mailLink.href = `mailto:${email}`;
  }

  /* =========================================================
     3. NOTIFICATION + BOUTON "COPIER MON EMAIL"
     ========================================================= */
  const toast = document.getElementById('toast');
  let toastTimer;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2400);
  }

  const copyBtn = document.getElementById('copy-btn');
  const copyLabel = copyBtn?.querySelector('.copy-label');

  copyBtn?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(email);
      copyBtn.classList.add('is-done');
      copyLabel.textContent = 'Adresse copiée';
      showToast('✓ Adresse copiée : vous pouvez la coller dans votre messagerie');

      setTimeout(() => {
        copyBtn.classList.remove('is-done');
        copyLabel.textContent = 'Copier mon email';
      }, 2400);
    } catch {
      // Le navigateur refuse la copie : on affiche l'adresse à recopier
      showToast(`Mon adresse : ${email}`);
    }
  });

  /* =========================================================
     4. LE FORMULAIRE
     ========================================================= */
  const form = document.getElementById('contact-form');
  if (!form) return;

  const nameInput = document.getElementById('cf-name');
  const emailInput = document.getElementById('cf-email');
  const messageInput = document.getElementById('cf-message');
  const counter = document.getElementById('cf-count');
  const alertBox = document.getElementById('cf-alert');
  const sendBtn = document.getElementById('send-btn');
  const success = document.getElementById('contact-success');
  const successName = document.getElementById('success-name');
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // --- Le compteur de caractères ---
  function updateCounter() {
    const length = messageInput.value.length;
    counter.textContent = length;
    counter.parentElement.classList.toggle('is-near', length >= 900);
  }
  messageInput.addEventListener('input', updateCounter);
  updateCounter();

  // --- Les erreurs, champ par champ ---
  function setError(input, message) {
    const field = input.closest('.cf-field');
    const errorBox = document.getElementById(`${input.id}-error`);
    errorBox.textContent = message;
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', errorBox.id);

    field.classList.remove('is-invalid');
    void field.offsetWidth; // rejoue la secousse
    field.classList.add('is-invalid');
  }

  function clearError(input) {
    input.closest('.cf-field').classList.remove('is-invalid');
    document.getElementById(`${input.id}-error`).textContent = '';
    input.removeAttribute('aria-invalid');
  }

  [nameInput, emailInput, messageInput].forEach((input) => {
    input.addEventListener('input', () => clearError(input));
  });

  function validate() {
    let firstInvalid = null;

    if (nameInput.value.trim().length < 2) {
      setError(nameInput, 'Indiquez votre nom.');
      firstInvalid ??= nameInput;
    }
    if (!EMAIL_PATTERN.test(emailInput.value.trim())) {
      setError(emailInput, 'Indiquez une adresse email valide, pour que je puisse vous répondre.');
      firstInvalid ??= emailInput;
    }
    if (messageInput.value.trim().length < 10) {
      setError(messageInput, 'Votre message est un peu court (10 caractères minimum).');
      firstInvalid ??= messageInput;
    }

    firstInvalid?.focus();
    return !firstInvalid;
  }

  // --- La gerbe d'étincelles, depuis le bouton ---
  function burst(origin) {
    if (reduceMotion) return;
    const rect = origin.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    for (let i = 0; i < 28; i += 1) {
      const spark = document.createElement('span');
      spark.className = 'spark';
      // Une direction au hasard, plutôt vers le haut
      const angle = Math.random() * Math.PI * 2;
      const distance = 80 + Math.random() * 160;
      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;
      spark.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
      spark.style.setProperty('--dy', `${Math.sin(angle) * distance - 60}px`);
      spark.style.setProperty('--s', `${3 + Math.random() * 6}px`);
      spark.style.setProperty('--t', `${0.7 + Math.random() * 0.6}s`);
      document.body.append(spark);
      spark.addEventListener('animationend', () => spark.remove());
    }
  }

  // --- L'envoi ---
  form.addEventListener('submit', async (event) => {
    event.preventDefault(); // on envoie nous-mêmes, sans recharger la page
    alertBox.textContent = '';
    if (!validate()) return;

    sendBtn.classList.add('is-sending');
    sendBtn.setAttribute('aria-busy', 'true');

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.errors?.[0]?.message || "L'envoi a échoué. Réessayez dans un instant.");
      }

      // Succès : étincelles, puis le message de remerciement
      burst(sendBtn);
      successName.textContent = nameInput.value.trim().split(' ')[0];
      setTimeout(() => {
        form.hidden = true;
        success.hidden = false;
        success.focus();
      }, reduceMotion ? 0 : 450);
    } catch (error) {
      alertBox.textContent = error instanceof TypeError
        ? 'Impossible de joindre le service. Vérifiez votre connexion Internet.'
        : error.message;
    } finally {
      sendBtn.classList.remove('is-sending');
      sendBtn.removeAttribute('aria-busy');
    }
  });

  // --- "Écrire un autre message" ---
  document.getElementById('contact-again').addEventListener('click', () => {
    messageInput.value = '';
    updateCounter();
    success.hidden = true;
    form.hidden = false;
    messageInput.focus();
  });
})();
