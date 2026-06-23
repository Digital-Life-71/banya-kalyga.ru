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

function setupRevealAnimations() {
  const revealSelectors = [
    ".hero .eyebrow",
    ".hero h1",
    ".hero__lead",
    ".hero__actions",
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
document.addEventListener("DOMContentLoaded", setupRevealAnimations);
