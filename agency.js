const menu = document.querySelector('#site-menu');
const menuButton = document.querySelector('[data-menu-open]');
const closeButton = document.querySelector('[data-menu-close]');
if (menu && menuButton) {
  menuButton.addEventListener('click', () => {
    menu.showModal();
    menuButton.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  });
  const closeMenu = () => menu.close();
  closeButton?.addEventListener('click', closeMenu);
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  menu.addEventListener('close', () => {
    document.body.classList.remove('menu-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.focus();
  });
}

document.querySelectorAll('[data-project-filter]').forEach(button => {
  button.addEventListener('click', () => {
    const value = button.dataset.projectFilter;
    document.querySelectorAll('[data-project-filter]').forEach(item => {
      item.setAttribute('aria-pressed', String(item === button));
    });
    let visible = 0;
    document.querySelectorAll('[data-project-category]').forEach(card => {
      card.hidden = value !== 'all' && card.dataset.projectCategory !== value;
      if (!card.hidden) visible++;
    });
    const status = document.querySelector('[data-filter-status]');
    if (status) status.textContent = `${visible} ${visible === 1 ? 'project' : 'projects'}`;
  });
});

const heroVideo = document.querySelector('[data-hero-video]');
const heroToggle = document.querySelector('[data-hero-toggle]');
if (heroVideo && heroToggle) {
  const syncToggle = () => {
    heroToggle.textContent = heroVideo.paused ? 'Play video' : 'Pause video';
    heroToggle.setAttribute('aria-label', heroVideo.paused ? 'Play background video' : 'Pause background video');
  };
  heroToggle.addEventListener('click', () => {
    if (heroVideo.paused) heroVideo.play().catch(() => {});
    else heroVideo.pause();
  });
  heroVideo.addEventListener('play', syncToggle);
  heroVideo.addEventListener('pause', syncToggle);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) heroVideo.pause();
  syncToggle();
}
document.querySelectorAll('[data-year]').forEach(node => node.textContent = new Date().getFullYear());
