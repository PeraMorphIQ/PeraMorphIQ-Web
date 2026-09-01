/**
 * Reveal-on-scroll.
 *
 * The old site ran two competing IntersectionObserver implementations (one in
 * nav.js, one in reveal.js) over the same sections with different timings.
 * This is the only one now, and it is deliberately subdued: a short fade and a
 * 12px rise, nothing more.
 *
 * Elements added to the DOM later (every card is rendered by JS) are picked up
 * via a MutationObserver, so loaders do not need to call anything.
 */

const PREFERS_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');

let observer;

function reveal(el, index = 0) {
  el.style.setProperty('--reveal-delay', `${Math.min(index, 6) * 60}ms`);
  el.classList.add('revealed');
}

export function initReveal() {
  const targets = () => document.querySelectorAll('.reveal-item:not(.revealed)');

  if (PREFERS_REDUCED.matches || !('IntersectionObserver' in window)) {
    targets().forEach((el) => el.classList.add('revealed'));
    return;
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries
        .filter((entry) => entry.isIntersecting)
        .forEach((entry, i) => {
          reveal(entry.target, i);
          observer.unobserve(entry.target);
        });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
  );

  const observeAll = () => targets().forEach((el) => observer.observe(el));
  observeAll();

  new MutationObserver(observeAll).observe(document.body, {
    childList: true,
    subtree: true
  });
}

initReveal();
