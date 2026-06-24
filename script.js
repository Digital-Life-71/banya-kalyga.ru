const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const gallery = document.querySelector("[data-gallery]");
const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxClose = document.querySelector("[data-lightbox-close]");

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function updateHeader() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 18);
}

function closeMenu() {
  if (!menuToggle || !nav) return;
  nav.classList.remove("is-open");
  document.body.classList.remove("menu-open");
  menuToggle.setAttribute("aria-expanded", "false");
}

function openLightbox(src, alt) {
  if (!lightbox || !lightboxImage) return;
  lightboxImage.src = src;
  lightboxImage.alt = alt || "Фото Волшебной живой бани";
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
}

function closeLightbox() {
  if (!lightbox || !lightboxImage) return;
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
  lightboxImage.src = "";
}

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    document.body.classList.toggle("menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });
}

if (gallery) {
  gallery.addEventListener("click", (event) => {
    const item = event.target.closest("[data-full]");
    if (!item) return;
    const image = item.querySelector("img");
    openLightbox(item.dataset.full, image?.alt);
  });
}

if (lightbox) {
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
}

if (lightboxClose) {
  lightboxClose.addEventListener("click", closeLightbox);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
    closeLightbox();
  }
});

function setupAudioPlayer() {
  const audioPlayer = document.querySelector("[data-audio-player]");
  if (!audioPlayer) return;

  const audio = audioPlayer.querySelector("[data-audio-element]");
  const panel = audioPlayer.querySelector("[data-audio-panel]");
  const toggleButton = audioPlayer.querySelector("[data-audio-toggle]");
  const heroButton = document.querySelector("[data-audio-hero]");
  const collapseButton = audioPlayer.querySelector("[data-audio-collapse]");
  const playButton = audioPlayer.querySelector("[data-audio-play]");
  const prevButton = audioPlayer.querySelector("[data-audio-prev]");
  const nextButton = audioPlayer.querySelector("[data-audio-next]");
  const titleElement = audioPlayer.querySelector("[data-audio-title]");
  const currentTimeElement = audioPlayer.querySelector("[data-audio-current]");
  const durationElement = audioPlayer.querySelector("[data-audio-duration]");
  const seekInput = audioPlayer.querySelector("[data-audio-seek]");
  const volumeInput = audioPlayer.querySelector("[data-audio-volume]");
  const trackButtons = [...audioPlayer.querySelectorAll("[data-track-src]")];

  if (!audio || !panel || !toggleButton || !playButton || trackButtons.length === 0) return;

  const tracks = trackButtons.map((button) => ({
    button,
    src: button.dataset.trackSrc,
    title: button.dataset.trackTitle || button.textContent.trim(),
  }));

  let currentTrack = 0;

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const rest = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${rest}`;
  }

  function updateOpenState(isOpen) {
    audioPlayer.classList.toggle("is-open", isOpen);
    panel.setAttribute("aria-hidden", String(!isOpen));
    toggleButton.setAttribute("aria-expanded", String(isOpen));
  }

  function updateActiveTrack() {
    const track = tracks[currentTrack];
    if (titleElement) titleElement.textContent = track.title;
    trackButtons.forEach((button, index) => {
      button.classList.toggle("is-active", index === currentTrack);
    });
  }

  function updatePlayState() {
    const isPlaying = !audio.paused && !audio.ended;
    audioPlayer.classList.toggle("is-playing", isPlaying);
    playButton.setAttribute("aria-label", isPlaying ? "Поставить на паузу" : "Воспроизвести");
  }

  function updateProgress() {
    if (currentTimeElement) currentTimeElement.textContent = formatTime(audio.currentTime);
    if (durationElement) durationElement.textContent = formatTime(audio.duration);

    if (seekInput && Number.isFinite(audio.duration) && audio.duration > 0) {
      seekInput.value = String(Math.round((audio.currentTime / audio.duration) * Number(seekInput.max)));
    }
  }

  function loadTrack(index) {
    currentTrack = (index + tracks.length) % tracks.length;
    const track = tracks[currentTrack];
    audio.src = track.src;
    audio.load();
    updateActiveTrack();
    updateProgress();
  }

  function playCurrent() {
    if (!audio.src) loadTrack(currentTrack);

    audio
      .play()
      .then(updatePlayState)
      .catch(() => {
        audioPlayer.classList.remove("is-playing");
      });
  }

  function playTrack(index) {
    loadTrack(index);
    playCurrent();
  }

  function pauseCurrent() {
    audio.pause();
    updatePlayState();
  }

  function playNext() {
    playTrack(currentTrack + 1);
  }

  function playPrev() {
    playTrack(currentTrack - 1);
  }

  function openAndPlay() {
    updateOpenState(true);
    if (audio.paused) playCurrent();
  }

  if (volumeInput) {
    audio.volume = Number(volumeInput.value);
    volumeInput.addEventListener("input", () => {
      audio.volume = Number(volumeInput.value);
    });
  }

  toggleButton.addEventListener("click", openAndPlay);
  heroButton?.addEventListener("click", openAndPlay);

  collapseButton?.addEventListener("click", () => {
    updateOpenState(false);
  });

  playButton.addEventListener("click", () => {
    updateOpenState(true);
    if (audio.paused) {
      playCurrent();
    } else {
      pauseCurrent();
    }
  });

  prevButton?.addEventListener("click", playPrev);
  nextButton?.addEventListener("click", playNext);

  trackButtons.forEach((button, index) => {
    button.addEventListener("click", () => playTrack(index));
  });

  seekInput?.addEventListener("input", () => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
    audio.currentTime = (Number(seekInput.value) / Number(seekInput.max)) * audio.duration;
  });

  audio.addEventListener("play", updatePlayState);
  audio.addEventListener("pause", updatePlayState);
  audio.addEventListener("ended", playNext);
  audio.addEventListener("timeupdate", updateProgress);
  audio.addEventListener("loadedmetadata", updateProgress);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") updateOpenState(false);
  });

  loadTrack(0);
  updateOpenState(false);
  updatePlayState();
}

function setupRevealAnimations() {
  const revealSelectors = [
    ".hero .eyebrow",
    ".hero h1",
    ".hero__lead",
    ".hero__actions",
    ".hero-music",
    ".hero__facts",
    ".section-heading",
    ".section-copy",
    ".feature-card",
    ".service-card",
    ".program-card",
    ".experience-card",
    ".amenities span",
    ".local-tags span",
    ".local-media img",
    ".price-card",
    ".booking-note",
    ".steps article",
    ".gallery-item",
    ".reviews-layout > div",
    ".review-cards article",
    ".faq-list details",
    ".contact-copy",
    ".contact-list a",
    ".contact-panel",
    ".map-wrap",
  ];

  const revealItems = [...document.querySelectorAll(revealSelectors.join(","))];
  revealItems.forEach((element, index) => {
    if (!element.dataset.reveal) {
      element.dataset.reveal = element.matches(".local-media img, .gallery-item") ? "zoom" : "up";
    }
    element.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 70}ms`);
  });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    revealItems.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
  );

  revealItems.forEach((element) => observer.observe(element));
}

document.addEventListener("DOMContentLoaded", refreshIcons);
document.addEventListener("DOMContentLoaded", setupAudioPlayer);
document.addEventListener("DOMContentLoaded", setupRevealAnimations);
