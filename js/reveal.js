// Lightweight reveal-on-scroll using IntersectionObserver
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function setupReveal() {
  if (prefersReducedMotion) {
    // reveal everything instantly
    document.querySelectorAll('.reveal-item, [data-reveal-child], .reveal-fade').forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      // add revealed class with optional delay already set via CSS var
      el.classList.add('revealed');
      // If element is a group container, reveal children with stagger
      if (el.hasAttribute('data-reveal-group')) {
        const children = Array.from(el.querySelectorAll('[data-reveal-child]'));
        children.forEach((child, i) => {
          child.style.setProperty('--reveal-delay', `${(i * 0.08).toFixed(2)}s`);
          observer.observe(child);
        });
      }
      // stop observing the element itself once revealed
      obs.unobserve(el);
    });
  }, { threshold: 0.12 });

  // Observe standalone reveal items
  document.querySelectorAll('.reveal-item, [data-reveal]').forEach(el => {
    // if element already has inline delay set via data-delay, apply it
    const d = el.getAttribute('data-reveal-delay');
    if (d) el.style.setProperty('--reveal-delay', d);
    observer.observe(el);
  });

  // Also observe fade children (used for small inline accents)
  document.querySelectorAll('[data-reveal-child]').forEach((child) => {
    // they will be observed when parent group triggers them
    // but also observe in case parent isn't used
    const p = child.closest('[data-reveal-group]');
    if (!p) observer.observe(child);
  });
}

function initHeroReveals() {
  // Hero special stagger: title, description, cta
  const hero = document.querySelector('.section-hero, .hero');
  if (!hero) return;
  const title = hero.querySelector('.hero-main--header, .hero-title, h1');
  const desc = hero.querySelector('.hero-description, .hero-subtitle, p');
  const cta = hero.querySelector('.hero-btn, .hero-cta, .hero-learn-btn');
  const img = hero.querySelector('.hero-image, .hero-figure img');

  let index = 0;
  [title, desc, cta, img].forEach(el => {
    if (!el) return;
    el.classList.add('reveal-item');
    el.style.setProperty('--reveal-delay', `${(index * 0.12).toFixed(2)}s`);
    index++;
  });
}

function autoMarkSections(){
  // For each section with class 'page' attach reveal markers to heading and content blocks
  document.querySelectorAll('section.page, section.section-news, section.section-projects, section.section-blogs, section.section-publications, section.section-supervisors').forEach(section => {
    // Heading
    const heading = section.querySelector('.subheading, h2, h3');
    if (heading) heading.classList.add('reveal-item');

    // Content children: mark as group to stagger
    const container = section.querySelector('.container, .main-contributors, .blog-grid, .grid, .main-news');
    if (container) {
      container.setAttribute('data-reveal-group', '');
      // mark direct children as reveal-child
      Array.from(container.children).forEach((c, i) => {
        c.setAttribute('data-reveal-child', '');
      });
    }
  });
}

// Auto-init when module is imported
document.addEventListener('DOMContentLoaded', () => {
  try {
    initHeroReveals();
    setupReveal();
  } catch (e) {
    // fail silently
    console.warn('Reveal init failed', e);
  }
});

export { setupReveal, initHeroReveals };
