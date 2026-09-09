const slides = Array.from(document.querySelectorAll('.milestone-slide'));
const prevButton = document.getElementById('prev-slide');
const nextButton = document.getElementById('next-slide');
const pauseButton = document.getElementById('pause-slide');
const currentSlideLabel = document.getElementById('current-slide');
const totalSlidesLabel = document.getElementById('total-slides');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let currentIndex = 0;
let autoplayEnabled = !reduceMotion;
let cycleTimer = null;
let fadeOutTimer = null;

function updateIndicator() {
  currentSlideLabel.textContent = String(currentIndex + 1);
  totalSlidesLabel.textContent = String(slides.length);
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
  pauseButton.textContent = 'Play';
}

function resumeAutoplay() {
  autoplayEnabled = true;
  pauseButton.textContent = 'Pause';
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
    pauseButton.textContent = 'Pause unavailable';
    pauseButton.disabled = true;
    updateIndicator();
    return;
  }

  startAutoplay();
}

prevButton.addEventListener('click', () => {
  pauseAutoplay();
  showSlide(currentIndex - 1);
});

nextButton.addEventListener('click', () => {
  pauseAutoplay();
  showSlide(currentIndex + 1);
});

pauseButton.addEventListener('click', () => {
  if (autoplayEnabled) {
    pauseAutoplay();
  } else {
    resumeAutoplay();
  }
});

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

initializeSlideshow();
