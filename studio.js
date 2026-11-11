const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const hero = document.querySelector('[data-hero-video]');
const heroButton = document.querySelector('[data-hero-toggle]');
const syncHero = () => {
  if (!heroButton || !hero) return;
  heroButton.textContent = hero.paused ? 'Play' : 'Pause';
  heroButton.setAttribute('aria-label', hero.paused ? 'Play background video' : 'Pause background video');
};
if (hero) {
  if (reducedMotion.matches) hero.pause();
  hero.addEventListener('play', syncHero);
  hero.addEventListener('pause', syncHero);
  heroButton?.addEventListener('click', () => hero.paused ? hero.play().catch(syncHero) : hero.pause());
  syncHero();
}
const previews = [...document.querySelectorAll('[data-preview]')];
let previewsPaused = reducedMotion.matches;
const visiblePreviews = new Set();
const syncPreviews = () => previews.forEach(video => {
  if (previewsPaused || document.hidden || !visiblePreviews.has(video)) video.pause();
  else video.play().catch(() => {});
});
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) visiblePreviews.add(entry.target);
    else visiblePreviews.delete(entry.target);
  });
  syncPreviews();
}, { threshold: 0.12 });
previews.forEach(video => observer.observe(video));
const previewButton = document.querySelector('[data-preview-toggle]');
const syncPreviewButton = () => {
  if (!previewButton) return;
  previewButton.textContent = previewsPaused ? 'Play previews' : 'Pause previews';
  previewButton.setAttribute('aria-pressed', String(previewsPaused));
};
previewButton?.addEventListener('click', () => { previewsPaused = !previewsPaused; syncPreviews(); syncPreviewButton(); });
syncPreviewButton();
document.addEventListener('visibilitychange', () => {
  syncPreviews();
  if (document.hidden && hero) hero.pause();
});
const expand = document.querySelector('.footer-expand');
const details = document.querySelector('#footer-details');
expand?.addEventListener('click', () => {
  const opening = expand.getAttribute('aria-expanded') !== 'true';
  expand.setAttribute('aria-expanded', String(opening));
  expand.setAttribute('aria-label', opening ? 'Hide contact information' : 'More contact information');
  expand.textContent = opening ? '−' : '+';
  details.hidden = !opening;
});
const form = document.querySelector('[data-inquiry-form]');
form?.addEventListener('submit', async event => {
  event.preventDefault();
  const button = form.querySelector('button[type=submit]');
  const status = form.querySelector('.form-status');
  button.disabled = true;
  status.textContent = 'Sending your inquiry…';
  try {
    const response = await fetch('https://formsubmit.co/ajax/info@thebalddude.co', {
      method: 'POST',
      headers: { 'Accept':'application/json', 'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8' },
      body: new URLSearchParams(new FormData(form)).toString()
    });
    const result = await response.json();
    if (!response.ok || result.success === false || result.success === 'false') throw new Error('Submission failed');
    status.textContent = 'Thank you. Your inquiry has been submitted.';
    form.reset();
  } catch {
    status.textContent = 'Your inquiry could not be submitted. Please email info@thebalddude.co or try again.';
  } finally { button.disabled = false; }
});
document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
// Earlier shared homepage links point to the relevant page in the new structure.
const oldSections = { '#films':'/services/event-films/', '#event-videos':'/services/event-films/', '#about':'/about/', '#coverage':'/agency/', '#intro-title':'/agency/', '#contact':'/contact/' };
if (location.pathname === '/' && oldSections[location.hash]) location.replace(oldSections[location.hash]);
