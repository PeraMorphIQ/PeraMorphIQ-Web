/**
 * Data access layer.
 *
 * Every loader goes through `getData()` so there is one place that knows where
 * content lives, one cache, and one error path. Results are memoised per page
 * load, so the home page fetching projects + publications + news + people does
 * not re-request anything a second loader already pulled.
 */

import { asset } from '../layout.js';

const SOURCES = {
  projects: 'data/projects.json',
  publications: 'data/publications.json',
  news: 'data/news.json',
  people: 'data/people.json',
  researchAreas: 'data/research-areas.json'
};

const cache = new Map();

/** Fetch a named dataset and return its `data` array. */
export async function getData(name) {
  if (!SOURCES[name]) throw new Error(`Unknown dataset: ${name}`);

  if (!cache.has(name)) {
    cache.set(
      name,
      fetch(asset(SOURCES[name]))
        .then((res) => {
          if (!res.ok) throw new Error(`${SOURCES[name]}: HTTP ${res.status}`);
          return res.json();
        })
        .then((json) => (Array.isArray(json) ? json : json.data || []))
        .catch((err) => {
          cache.delete(name); // let a later caller retry
          throw err;
        })
    );
  }

  return cache.get(name);
}

/* -------------------------------------------------------------------------
   Rendering helpers shared by every loader
   ------------------------------------------------------------------------- */

/** Escape text for safe interpolation into an HTML template literal. */
export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Escape a value used inside a double-quoted HTML attribute. */
export const attr = esc;

/** Render an empty / error state into a container. */
export function renderState(container, title, detail) {
  container.innerHTML = `
    <div class="state">
      <p class="state__title">${esc(title)}</p>
      ${detail ? `<p>${esc(detail)}</p>` : ''}
    </div>`;
}

/**
 * Run a loader with consistent error handling, so a failed fetch shows a
 * message instead of leaving an empty container with an error only in the
 * console (which is what the old loaders did).
 */
export async function withContainer(selector, fn) {
  const container = document.querySelector(selector);
  if (!container) return;

  try {
    await fn(container);
  } catch (err) {
    console.error(err);
    renderState(container, 'Could not load this content.', 'Please try again later.');
  }
}

/** Format a date string as e.g. "25 September 2025". */
export function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value ?? '');
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}
