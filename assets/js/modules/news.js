/**
 * News: card list and the single-article view (article.html?id=<newsId>).
 */

import { asset } from '../layout.js';
import {
  getData,
  esc,
  attr,
  formatDate,
  renderState,
  withContainer
} from './data.js';
import { wireLightbox } from './projects.js';

const PLACEHOLDER = 'assets/img/placeholder/news.svg';

function articleHref(id) {
  return `${asset('article.html')}?id=${encodeURIComponent(id)}`;
}

function cardHTML(item) {
  return `
    <article class="card reveal-item">
      <div class="card__media">
        <img src="${attr(asset(item.image || PLACEHOLDER))}" alt="" loading="lazy" decoding="async" />
      </div>
      <div class="card__body">
        <div class="card__meta">
          <time datetime="${attr(item.date)}">${esc(formatDate(item.date))}</time>
        </div>
        <h3 class="card__title">
          <a class="stretched-link" href="${attr(articleHref(item._id))}">${esc(item.title)}</a>
        </h3>
        <p class="card__text">${esc(item.brief)}</p>
      </div>
    </article>`;
}

/** Newest first. */
function byDateDesc(a, b) {
  return new Date(b.date || 0) - new Date(a.date || 0);
}

function rowHTML(item) {
  return `
    <article class="news-row reveal-item">
      <time class="news-row__date" datetime="${attr(item.date)}">${esc(formatDate(item.date))}</time>
      <div class="news-row__body">
        <h3 class="news-row__title">
          <a href="${attr(articleHref(item._id))}">${esc(item.title)}</a>
        </h3>
        <p class="news-row__text">${esc(item.brief)}</p>
      </div>
    </article>`;
}

/**
 * Render news.
 * @param {object} [options]
 * @param {number|null} [options.limit] null for the full list
 * @param {'cards'|'list'} [options.variant] a card grid with three items looks
 *   sparse when the group has posted only one; `list` reads correctly at any count.
 */
export function loadNews(selector, { limit = 3, variant = 'cards' } = {}) {
  return withContainer(selector, async (container) => {
    const all = (await getData('news')).slice().sort(byDateDesc);

    if (!all.length) {
      renderState(container, 'No news yet.');
      return;
    }

    const items = limit ? all.slice(0, limit) : all;
    container.innerHTML = items
      .map(variant === 'list' ? rowHTML : cardHTML)
      .join('');
  });
}

/** Render one article from ?id=<newsId>. */
export function loadArticle(selector) {
  return withContainer(selector, async (root) => {
    const id = new URLSearchParams(window.location.search).get('id');

    if (!id) {
      window.location.replace(asset('news.html'));
      return;
    }

    const all = await getData('news');
    const item = all.find((n) => n._id === id);

    if (!item) {
      document.title = 'Article not found | PeraMorphIQ';
      root.innerHTML = `
        <div class="container section">
          <div class="state">
            <p class="state__title">Article not found</p>
            <p>No news item matches “${esc(id)}”.</p>
            <p style="margin-top:var(--space-4)">
              <a class="btn btn--primary" href="${attr(asset('news.html'))}">All news</a>
            </p>
          </div>
        </div>`;
      return;
    }

    document.title = `${item.title} | PeraMorphIQ`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', item.brief || '');

    // fullContent is newline-separated prose in the data file.
    const paragraphs = String(item.fullContent || item.brief || '')
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);

    const gallery = (item.images || []).filter(Boolean);

    root.innerHTML = `
      <article class="article">
        <div class="container container--narrow">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="${attr(asset('index.html'))}">Home</a>
            <span class="breadcrumb__sep">/</span>
            <a href="${attr(asset('news.html'))}">News</a>
            <span class="breadcrumb__sep">/</span>
            <span aria-current="page">${esc(item.title)}</span>
          </nav>

          <h1 class="article__title">${esc(item.title)}</h1>

          <div class="article__meta">
            <time datetime="${attr(item.date)}">${esc(formatDate(item.date))}</time>
            ${item.Author || item.author ? `<span>${esc(item.Author || item.author)}</span>` : ''}
          </div>

          <div class="article__body">
            ${item.brief ? `<p class="article__lead">${esc(item.brief)}</p>` : ''}
            ${paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}
          </div>

          ${
            gallery.length
              ? `<div class="gallery">
                   ${gallery
                     .map(
                       (src, i) =>
                         `<img src="${attr(asset(src))}" alt="${attr(`${item.title}, image ${i + 1}`)}" loading="lazy" decoding="async" />`
                     )
                     .join('')}
                 </div>`
              : ''
          }

          <p style="margin-top:var(--space-8)">
            <a class="link-forward" href="${attr(asset('news.html'))}">All news</a>
          </p>
        </div>
      </article>`;

    wireLightbox(root);
  });
}
