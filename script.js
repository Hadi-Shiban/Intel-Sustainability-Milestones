const slides = Array.from(document.querySelectorAll('.milestone-slide'));
const prevButton = document.getElementById('prev-slide');
const nextButton = document.getElementById('next-slide');
const pauseButton = document.getElementById('pause-slide');
const currentSlideLabel = document.getElementById('current-slide');
const totalSlidesLabel = document.getElementById('total-slides');
const languageSelector = document.getElementById('language-selector');
const rtlStylesheet = document.getElementById('bootstrap-rtl');
const currentYearElement = document.getElementById('current-year');
const subscriptionForm = document.getElementById('subscription-form');
const subscriptionStatus = document.getElementById('subscription-status');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const rtlLanguageCodes = new Set(['ar', 'he', 'fa', 'ur']);

let currentIndex = 0;
let autoplayEnabled = !reduceMotion;
let cycleTimer = null;
let fadeOutTimer = null;
let currentLanguage = 'en';

// Language control and RTL switching.
function updateBootstrapStylesheet(isRtl) {
  if (!rtlStylesheet) {
    return;
  }

  rtlStylesheet.disabled = !isRtl;
}

function applyLanguage(language) {
  const normalizedLanguage = (language || 'en').split('-')[0].toLowerCase();
  const isRtlLanguage = rtlLanguageCodes.has(normalizedLanguage);
  currentLanguage = isRtlLanguage ? 'ar' : 'en';

  document.documentElement.lang = currentLanguage;
  document.documentElement.dir = isRtlLanguage ? 'rtl' : 'ltr';

  if (languageSelector) {
    languageSelector.value = currentLanguage;
  }

  updateBootstrapStylesheet(isRtlLanguage);
}

function initializeLanguage() {
  const savedLanguage = localStorage.getItem('intel-site-language');
  const browserLanguage = navigator.language || navigator.userLanguage || 'en';
  const preferredLanguage = savedLanguage || browserLanguage;

  applyLanguage(preferredLanguage);

  if (document.documentElement) {
    const observer = new MutationObserver(() => {
      const observedLanguage = document.documentElement.lang || 'en';
      applyLanguage(observedLanguage);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang'],
    });
  }
}

function updateIndicator() {
  if (currentSlideLabel && totalSlidesLabel) {
    currentSlideLabel.textContent = String(currentIndex + 1);
    totalSlidesLabel.textContent = String(slides.length);
  }
}

function clearTimers() {
  window.clearTimeout(cycleTimer);
  window.clearTimeout(fadeOutTimer);
}

function setSlideState() {
  slides.forEach((slide, index) => {
    const isActive = index === currentIndex;
    slide.classList.toggle('is-active', isActive);
    slide.classList.remove('is-fading-out');
    slide.setAttribute('aria-hidden', String(!isActive));
  });

  updateIndicator();
}

function showSlide(nextIndex) {
  currentIndex = (nextIndex + slides.length) % slides.length;
  setSlideState();

  if (autoplayEnabled && !reduceMotion) {
    startAutoplay();
  }
}

function pauseAutoplay() {
  clearTimers();
  autoplayEnabled = false;

  if (pauseButton) {
    pauseButton.textContent = 'Play';
  }
}

function resumeAutoplay() {
  autoplayEnabled = true;

  if (pauseButton) {
    pauseButton.textContent = 'Pause';
  }

  startAutoplay();
}

function startAutoplay() {
  clearTimers();

  if (reduceMotion || !autoplayEnabled) {
    return;
  }

  cycleTimer = window.setTimeout(() => {
    const activeSlide = slides[currentIndex];

    if (activeSlide) {
      activeSlide.classList.remove('is-active');
      activeSlide.classList.add('is-fading-out');
    }

    fadeOutTimer = window.setTimeout(() => {
      currentIndex = (currentIndex + 1) % slides.length;
      setSlideState();
      startAutoplay();
    }, 750);
  }, 4250);
}

function initializeSlideshow() {
  document.body.classList.add('js-ready');
  document.body.classList.toggle('reduced-motion', reduceMotion);

  if (slides.length === 0) {
    return;
  }

  slides.forEach((slide) => {
    slide.classList.remove('is-active');
  });

  setSlideState();

  if (reduceMotion) {
    slides.forEach((slide, index) => {
      slide.classList.toggle('is-active', index === 0);
      slide.setAttribute('aria-hidden', String(index !== 0));
    });

    if (pauseButton) {
      pauseButton.textContent = 'Pause unavailable';
      pauseButton.disabled = true;
    }

    updateIndicator();
    return;
  }

  startAutoplay();
}

function setupSubscriptionForm() {
  if (!subscriptionForm || !subscriptionStatus) {
    return;
  }

  subscriptionForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const emailInput = document.getElementById('newsletter-email');

    if (!emailInput || !emailInput.value.trim()) {
      subscriptionStatus.textContent = currentLanguage === 'ar'
        ? 'يرجى إدخال بريد إلكتروني صالح.'
        : 'Please enter a valid email address.';
      emailInput?.focus();
      return;
    }

    subscriptionStatus.textContent = currentLanguage === 'ar'
      ? 'شكرًا للاشتراك.'
      : 'Thanks for subscribing.';

    subscriptionForm.reset();
  });
}

if (currentYearElement) {
  currentYearElement.textContent = new Date().getFullYear();
}

initializeLanguage();
initializeSlideshow();
setupSubscriptionForm();

if (languageSelector) {
  languageSelector.addEventListener('change', (event) => {
    const selectedLanguage = event.target.value;
    localStorage.setItem('intel-site-language', selectedLanguage);
    applyLanguage(selectedLanguage);
  });
}

if (prevButton) {
  prevButton.addEventListener('click', () => {
    pauseAutoplay();
    showSlide(currentIndex - 1);
  });
}

if (nextButton) {
  nextButton.addEventListener('click', () => {
    pauseAutoplay();
    showSlide(currentIndex + 1);
  });
}

if (pauseButton) {
  pauseButton.addEventListener('click', () => {
    if (autoplayEnabled) {
      pauseAutoplay();
    } else {
      resumeAutoplay();
    }
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight') {
    pauseAutoplay();
    showSlide(currentIndex + 1);
  }

  if (event.key === 'ArrowLeft') {
    pauseAutoplay();
    showSlide(currentIndex - 1);
  }
});
