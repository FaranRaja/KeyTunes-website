(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Sticky nav border on scroll ----------
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 8);
    });
  }

  // ---------- Waveform divider bars ----------
  document.querySelectorAll('.wave-divider').forEach((divider) => {
    const BAR_COUNT = 48;
    for (let i = 0; i < BAR_COUNT; i++) {
      const bar = document.createElement('span');
      bar.className = 'bar';
      const h = 8 + Math.round(Math.random() * 24);
      bar.style.height = h + 'px';
      if (!reduceMotion) {
        bar.style.animationDelay = (Math.random() * 2.4).toFixed(2) + 's';
        bar.style.animationDuration = (1.8 + Math.random() * 1.2).toFixed(2) + 's';
      }
      divider.appendChild(bar);
    }
  });

  // ---------- Hero player card parallax ----------
  const card = document.querySelector('.player-card');
  const heroVisual = document.querySelector('.hero-visual');
  if (!reduceMotion && card && heroVisual) {
    heroVisual.addEventListener('mousemove', (e) => {
      const rect = heroVisual.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `rotateY(${-8 + x * 10}deg) rotateX(${4 - y * 10}deg)`;
    });
    heroVisual.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  }

  // ---------- Scroll-reveal ----------
  const revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion) {
    revealEls.forEach((el) => el.classList.add('visible'));
  } else if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  // Stagger children within a reveal group (feature cards, faq items, hotkey items)
  document.querySelectorAll('[data-stagger]').forEach((group) => {
    const children = group.querySelectorAll('.reveal');
    children.forEach((child, i) => {
      child.style.transitionDelay = reduceMotion ? '0s' : `${Math.min(i * 70, 420)}ms`;
    });
  });

  // ---------- FAQ accordion ----------
  document.querySelectorAll('.faq-item').forEach((item) => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      item.closest('.faq-list').querySelectorAll('.faq-item.open').forEach((openItem) => {
        if (openItem !== item) openItem.classList.remove('open');
      });
      item.classList.toggle('open', !isOpen);
    });
  });

  // ---------- Contact form (Formspree) ----------
  const form = document.getElementById('contact-form');
  if (form) {
    const statusEl = form.querySelector('.form-status');
    const submitBtn = form.querySelector('button[type="submit"]');
    const submitLabel = submitBtn ? submitBtn.querySelector('.btn-label') : null;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const action = form.getAttribute('action') || '';
      if (!action || action.includes('YOUR_FORM_ID')) {
        statusEl.className = 'form-status error';
        statusEl.textContent = 'Add your Formspree form ID in contact.html before this form can send.';
        return;
      }

      submitBtn.disabled = true;
      const originalLabel = submitLabel ? submitLabel.textContent : '';
      if (submitLabel) submitLabel.textContent = 'Sending';
      submitBtn.insertAdjacentHTML('beforeend', ' ');
      const spinner = document.createElement('span');
      spinner.className = 'spinner';
      submitBtn.appendChild(spinner);
      statusEl.className = 'form-status';
      statusEl.textContent = '';

      try {
        const res = await fetch(action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });

        if (res.ok) {
          statusEl.className = 'form-status success';
          statusEl.textContent = "Sent — we'll get back to you soon.";
          form.reset();
        } else {
          const data = await res.json().catch(() => null);
          const message = data && data.errors ? data.errors.map((er) => er.message).join(', ') : 'Something went wrong sending that.';
          statusEl.className = 'form-status error';
          statusEl.textContent = message;
        }
      } catch (err) {
        statusEl.className = 'form-status error';
        statusEl.textContent = 'Network error — check your connection and try again.';
      } finally {
        submitBtn.disabled = false;
        if (submitLabel) submitLabel.textContent = originalLabel;
        spinner.remove();
      }
    });
  }

  // ---------- Fetch Latest Release Download ----------
  async function fetchLatestRelease() {
    try {
      const res = await fetch('https://api.github.com/repos/FaranRaja/KeyTunes/releases/latest');
      if (!res.ok) return;
      const data = await res.json();
      const exeAsset = data.assets.find((a) => a.name.endsWith('.exe'));
      if (exeAsset) {
        const downloadUrl = exeAsset.browser_download_url;
        document.querySelectorAll('#nav-download, #hero-download, #final-download').forEach((btn) => {
          btn.href = downloadUrl;
        });
      }
    } catch (e) {
      console.error('Failed to fetch latest release', e);
    }
  }
  fetchLatestRelease();
})();
