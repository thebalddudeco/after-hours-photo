document.getElementById('year').textContent = new Date().getFullYear();

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

inquiryForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const submitButton = inquiryForm.querySelector('button[type="submit"]');
  const formData = new FormData(inquiryForm);

  if (formData.get('_honey')) return;

  const payload = Object.fromEntries(formData.entries());
  delete payload._honey;
  payload._subject = 'New After Hours Photo inquiry';
  payload._template = 'table';

  submitButton.disabled = true;
  formStatus.textContent = 'Sending…';

  try {
    const recipient = ['info', 'thebalddude.co'].join('@');
    const response = await fetch(`https://formsubmit.co/ajax/${recipient}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const result = await response.json();

    if (!response.ok || result.success === false || result.success === 'false') {
      throw new Error('Form delivery failed');
    }

    inquiryForm.reset();
    formStatus.textContent = 'Thank you. Your inquiry is on its way.';
  } catch (error) {
    formStatus.textContent = 'Something went wrong. Please try again in a moment.';
  } finally {
    submitButton.disabled = false;
  }
});

