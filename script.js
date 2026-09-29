document.getElementById('year').textContent = new Date().getFullYear();

const siteHeader = document.querySelector('.site-header');
const headerLogo = siteHeader?.querySelector('.wordmark img');
const darkHeaderSections = new Set(['hero', 'osf', 'private', 'motion', 'statement']);

const updateHeaderContrast = () => {
  if (!siteHeader) return;
  const isScrolled = window.scrollY > 8;
  const probeY = Math.min(siteHeader.offsetHeight + 2, window.innerHeight - 1);
  const section = document.elementFromPoint(window.innerWidth / 2, probeY)?.closest('section');
  const isDark = Boolean(section && [...section.classList].some((name) => darkHeaderSections.has(name)));
  siteHeader.classList.toggle('is-scrolled', isScrolled);
  siteHeader.classList.toggle('is-dark-bg', isDark);
  siteHeader.classList.toggle('is-light-bg', !isDark);
  if (headerLogo) headerLogo.src = (isDark || isScrolled) ? headerLogo.dataset.darkSrc : headerLogo.dataset.lightSrc;
};

updateHeaderContrast();
window.addEventListener('scroll', updateHeaderContrast, { passive: true });
window.addEventListener('resize', updateHeaderContrast);

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const videoObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) {
      entry.target.pause();
    }
  });
}, { threshold: 0.01 });

document.querySelectorAll('video').forEach((video) => videoObserver.observe(video));

let videoScrollCheck = 0;
const pauseVideosOutsideViewport = () => {
  cancelAnimationFrame(videoScrollCheck);
  videoScrollCheck = requestAnimationFrame(() => {
    document.querySelectorAll('video').forEach((video) => {
      const bounds = video.getBoundingClientRect();
      if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) {
        video.pause();
      }
    });
  });
};

window.addEventListener('scroll', pauseVideosOutsideViewport, { passive: true });
window.addEventListener('resize', pauseVideosOutsideViewport);

document.querySelectorAll('[data-select]').forEach((select) => {
  const toggle = select.querySelector('.custom-select-toggle');
  const input = select.querySelector('input[type="hidden"]');
  const menu = select.querySelector('.custom-select-menu');

  toggle.addEventListener('click', () => {
    const isOpen = select.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  menu.querySelectorAll('[role="option"]').forEach((option) => {
    option.addEventListener('click', () => {
      input.value = option.dataset.value;
      toggle.firstChild.textContent = option.textContent;
      menu.querySelectorAll('[role="option"]').forEach((item) => item.removeAttribute('aria-selected'));
      option.setAttribute('aria-selected', 'true');
      select.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
});

document.addEventListener('click', (event) => {
  document.querySelectorAll('[data-select].is-open').forEach((select) => {
    if (!select.contains(event.target)) {
      select.classList.remove('is-open');
      select.querySelector('.custom-select-toggle').setAttribute('aria-expanded', 'false');
    }
  });
});

const inquiryForm = document.getElementById('inquiry-form');
const formStatus = document.getElementById('form-status');

if (new URLSearchParams(window.location.search).get('sent') === '1' && formStatus) {
  formStatus.textContent = 'Thank you. Your inquiry is on its way.';
}

