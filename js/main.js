// ── SCROLL REVEAL ──
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
reveals.forEach(el => revealObserver.observe(el));

// ── STICKY CTA ──
const stickyCta = document.getElementById('stickyCta');
const heroSection = document.querySelector('.hero');
window.addEventListener('scroll', () => {
  const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
  stickyCta.classList.toggle('visible', window.scrollY > heroBottom - 200);
});

// ── COUNTER ANIMATION ──
function animateCounters() {
  document.querySelectorAll('.stats-val[data-target]').forEach(el => {
    const target = parseFloat(el.dataset.target);
    const isDecimal = target % 1 !== 0;
    const duration = 1500;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      if (target >= 1000) {
        el.textContent = (current / 1000).toFixed(current >= target ? 0 : 0) + 'K+';
      } else if (isDecimal) {
        el.textContent = current.toFixed(1) + '★';
      } else {
        el.textContent = Math.floor(current) + '+';
      }
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

const statsObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounters();
      statsObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
statsObs.observe(document.querySelector('.stats-bar'));

// ── FAQ ACCORDION ──
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-panel.active .faq-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});

// ── FAQ TABS ──
document.querySelectorAll('.faq-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.faq-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.faq-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.querySelector(`.faq-panel[data-panel="${tab.dataset.tab}"]`).classList.add('active');
  });
});

// ── NAV SCROLL EFFECT ──
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  nav.style.background = window.scrollY > 60 ? 'rgba(27,42,74,.98)' : 'rgba(27,42,74,.95)';
});

// ── SMOOTH SCROLL NAV LINKS ──
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href.startsWith('#')) {
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  });
});


