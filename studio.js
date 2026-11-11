const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const hero = document.querySelector('[data-hero-video]');
// The opening is a one-way entrance, not a section in the scrollable document.
const opening = document.querySelector('.studio-home .opening');
const work = document.querySelector('.studio-home .home-work');
if (opening && work) {
  const footer = document.querySelector('.studio-footer');
  let entered = false;
  let touchStart = null;
  work.inert = true;
  if (footer) footer.inert = true;
  const enterWork = (animate = true) => {
    if (entered) return;
    entered = true;
    const focusInOpening = opening.contains(document.activeElement);
    document.body.classList.add('intro-complete');
    work.inert = false;
    if (footer) footer.inert = false;
    hero?.pause();
    opening.inert = true;
    opening.setAttribute('aria-hidden', 'true');
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('scroll', onScroll);
    opening.classList.add('opening--dismissed');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (focusInOpening) {
      work.setAttribute('tabindex', '-1');
      work.focus({ preventScroll: true });
    }
    const removeOpening = () => {
      opening.remove();
      hero?.removeAttribute('src');
      hero?.querySelectorAll('source').forEach(source => source.removeAttribute('src'));
      hero?.load();
    };
    if (!animate || reducedMotion.matches) removeOpening();
    else window.setTimeout(removeOpening, 650);
  };
  function onWheel(event) {
    if (event.deltaY <= 0 || event.ctrlKey) return;
    event.preventDefault();
    enterWork();
  }
  function onTouchStart(event) { touchStart = event.touches[0]?.clientY ?? null; }
  function onTouchMove(event) {
    if (touchStart === null || touchStart - (event.touches[0]?.clientY ?? touchStart) < 24) return;
    event.preventDefault();
    enterWork();
  }
  function onKeyDown(event) {
    if (event.target.closest('button,a,input,textarea,select')) return;
    if (!['ArrowDown', 'PageDown', ' ', 'End'].includes(event.key)) return;
    event.preventDefault();
    enterWork();
  }
  function onScroll() { if (window.scrollY > 0) enterWork(); }
  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('scroll', onScroll, { passive: true });
  document.querySelector('.scroll-to-work')?.addEventListener('click', event => {
    event.preventDefault();
    enterWork();
  });
  if (location.hash === '#work') enterWork(false);
}
// Local videos are silent, automatic loops; YouTube players keep their own controls.
const automaticVideos = [...document.querySelectorAll('video')];
const visibleVideos = new Set();
const syncAutomaticVideos = () => automaticVideos.forEach(video => {
  if (!video.isConnected || document.hidden || !visibleVideos.has(video) || video.closest('[inert]')) video.pause();
  else video.play().catch(() => {});
});
const videoObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) visibleVideos.add(entry.target);
    else visibleVideos.delete(entry.target);
  });
  syncAutomaticVideos();
}, { threshold: 0.12 });
automaticVideos.forEach(video => {
  video.controls = false;
  video.autoplay = true;
  video.loop = true;
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  videoObserver.observe(video);
});
document.addEventListener('visibilitychange', syncAutomaticVideos);
window.addEventListener('pageshow', syncAutomaticVideos);
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
const oldSections = { '#films':'/services/event-films/', '#event-videos':'/services/event-films/', '#about':'/agency/', '#coverage':'/agency/', '#intro-title':'/agency/', '#contact':'/contact/' };
if (location.pathname === '/' && oldSections[location.hash]) location.replace(oldSections[location.hash]);

// Keep project navigation legible once the opening media has scrolled away.
const caseOpening = document.querySelector('.case-opening');
const caseHeader = caseOpening ? document.querySelector('.studio-header') : null;
if (caseHeader) {
  const syncCaseHeader = () => caseHeader.classList.toggle('case-nav-solid', caseOpening.getBoundingClientRect().bottom <= caseHeader.offsetHeight);
  window.addEventListener('scroll', syncCaseHeader, { passive: true });
  window.addEventListener('resize', syncCaseHeader);
  syncCaseHeader();
}
