/**
 * Click any figure or gallery image to open it full size.
 * Shared by project detail pages and news articles.
 */

import { esc, attr } from './data.js';

export function wireLightbox(root) {
  root.addEventListener('click', (e) => {
    const img = e.target.closest('.figure img, .gallery img');
    if (!img) return;

    const box = document.createElement('div');
    box.className = 'lightbox';
    box.innerHTML = `
      <button type="button" class="lightbox__close" aria-label="Close">&times;</button>
      <img src="${attr(img.currentSrc || img.src)}" alt="${attr(img.alt)}" />
      ${img.alt ? `<p class="lightbox__caption">${esc(img.alt)}</p>` : ''}`;

    const close = () => {
      box.remove();
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      img.focus?.();
    };
    const onKey = (ev) => ev.key === 'Escape' && close();

    box.addEventListener('click', (ev) => {
      if (ev.target === box || ev.target.closest('.lightbox__close')) close();
    });
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    document.body.append(box);
    box.querySelector('.lightbox__close').focus();
  });
}
