/**
 * Publications: rendering, sorting, filtering and citation export.
 */

import { asset } from '../layout.js';
import { getData, esc, attr, renderState, withContainer } from './data.js';

// Short labels: these sit in a fixed-width rail beside the title, so a long
// label ("Conference paper") overflows into the citation.
const TYPE_LABEL = {
  journal: 'Journal',
  conference: 'Conference',
  preprint: 'Preprint',
  thesis: 'Thesis'
};

/**
 * Reduce a DOI to its bare form.
 *
 * The old renderer built `href="https://doi.org/${doi}"` unconditionally, but
 * two of three entries stored a full URL — producing
 * `https://doi.org/https://dx.doi.org/10.2139/...` and a dead link. Normalising
 * here means the data file can hold either form safely.
 */
export function normalizeDoi(doi) {
  return String(doi || '')
    .trim()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '');
}

/** Newest first; month breaks ties within a year. */
function byDateDesc(a, b) {
  return (b.year || 0) - (a.year || 0) || (b.month || 0) - (a.month || 0);
}

function authorList(authors = []) {
  return authors
    .map((a) =>
      a.group
        ? `<span class="is-group">${esc(a.name)}</span>`
        : esc(a.name)
    )
    .join(', ');
}

function venueLine(pub) {
  const parts = [`<em>${esc(pub.venue)}</em>`];
  if (pub.volume) parts.push(esc(pub.volume));
  if (pub.articleNumber) parts.push(esc(pub.articleNumber));
  else if (pub.pages) parts.push(esc(pub.pages));
  return `${parts.join(', ')} (${esc(pub.year)})`;
}

/** Build a BibTeX record from the entry's fields. */
export function toBibtex(pub) {
  const kind =
    pub.type === 'journal'
      ? 'article'
      : pub.type === 'conference'
        ? 'inproceedings'
        : 'misc';

  const venueKey =
    pub.type === 'journal' ? 'journal' : pub.type === 'conference' ? 'booktitle' : 'howpublished';

  const fields = [
    ['title', pub.title],
    ['author', (pub.authors || []).map((a) => a.name).join(' and ')],
    [venueKey, pub.venue],
    ['volume', pub.volume],
    ['number', pub.articleNumber],
    ['pages', pub.pages],
    ['year', pub.year],
    ['doi', normalizeDoi(pub.doi)],
    ['url', pub.url]
  ].filter(([, v]) => v !== undefined && v !== null && v !== '');

  const body = fields
    .map(([k, v]) => `  ${k} = {${v}}`)
    .join(',\n');

  return `@${kind}{${pub.id || 'peramorphiq'},\n${body}\n}`;
}

function actions(pub) {
  const doi = normalizeDoi(pub.doi);
  const links = [];

  if (pub.url) {
    links.push(
      `<a href="${attr(pub.url)}" target="_blank" rel="noopener">View paper</a>`
    );
  }
  if (doi) {
    links.push(
      `<a href="https://doi.org/${attr(doi)}" target="_blank" rel="noopener">DOI</a>`
    );
  }
  if (pub.pdf) {
    links.push(`<a href="${attr(pub.pdf)}" target="_blank" rel="noopener">PDF</a>`);
  }
  if (pub.arxiv) {
    links.push(
      `<a href="https://arxiv.org/abs/${attr(pub.arxiv)}" target="_blank" rel="noopener">arXiv</a>`
    );
  }
  if (pub.code) {
    links.push(`<a href="${attr(pub.code)}" target="_blank" rel="noopener">Code</a>`);
  }

  links.push(
    `<button type="button" data-cite="${attr(pub.id || pub.title)}">Cite</button>`
  );

  return `<div class="pub__actions">${links.join('')}</div>`;
}

function publicationHTML(pub, { compact = false } = {}) {
  const badges = [
    `<span class="badge">${esc(TYPE_LABEL[pub.type] || 'Publication')}</span>`
  ];
  if (pub.openAccess) {
    badges.push(
      `<span class="badge badge--accent" title="${attr(pub.license || 'Open access')}">Open access</span>`
    );
  }

  const titleLink = pub.url
    ? `<a href="${attr(pub.url)}" target="_blank" rel="noopener">${esc(pub.title)}</a>`
    : esc(pub.title);

  return `
    <article class="pub${compact ? ' pub--compact' : ''}">
      <div class="pub__aside">${badges.join('')}</div>
      <div class="pub__body">
        <h3 class="pub__title">${titleLink}</h3>
        <p class="pub__authors">${authorList(pub.authors)}</p>
        <p class="pub__venue">${venueLine(pub)}</p>
        ${actions(pub)}
      </div>
    </article>`;
}

/* --- BibTeX dialog -------------------------------------------------------- */

let dialog;

function ensureDialog() {
  if (dialog) return dialog;

  dialog = document.createElement('dialog');
  dialog.className = 'dialog';
  dialog.innerHTML = `
    <div class="dialog__head">
      <h2 class="dialog__title">BibTeX</h2>
      <button type="button" class="btn btn--secondary btn--sm" data-close>Close</button>
    </div>
    <div class="dialog__body"><pre><code></code></pre></div>
    <div class="dialog__foot">
      <button type="button" class="btn btn--primary btn--sm" data-copy>Copy</button>
    </div>`;

  dialog.addEventListener('click', async (e) => {
    if (e.target.closest('[data-close]')) dialog.close();

    if (e.target.closest('[data-copy]')) {
      const btn = e.target.closest('[data-copy]');
      const text = dialog.querySelector('code').textContent;
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = 'Copied';
      } catch {
        btn.textContent = 'Press Ctrl+C';
        const range = document.createRange();
        range.selectNodeContents(dialog.querySelector('code'));
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
      setTimeout(() => (btn.textContent = 'Copy'), 2000);
    }
  });

  document.body.append(dialog);
  return dialog;
}

function openCite(pub) {
  const d = ensureDialog();
  d.querySelector('code').textContent = toBibtex(pub);
  d.showModal();
}

/** Delegate "Cite" clicks within a container. */
function wireCite(container, items) {
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cite]');
    if (!btn) return;
    const key = btn.dataset.cite;
    const pub = items.find((p) => (p.id || p.title) === key);
    if (pub) openCite(pub);
  });
}

/* --- Public entry points -------------------------------------------------- */

/** Render the N most recent publications (home page). */
export function loadPublications(selector, limit = 3) {
  return withContainer(selector, async (container) => {
    const all = (await getData('publications')).slice().sort(byDateDesc);

    if (!all.length) {
      renderState(container, 'No publications yet.');
      return;
    }

    const items = limit ? all.slice(0, limit) : all;
    container.innerHTML = items
      .map((p) => publicationHTML(p, { compact: true }))
      .join('');
    wireCite(container, items);
  });
}

/** Render the full, year-grouped, filterable publication list. */
export function loadPublicationIndex(selector) {
  return withContainer(selector, async (container) => {
    const all = (await getData('publications')).slice().sort(byDateDesc);

    if (!all.length) {
      renderState(container, 'No publications yet.');
      return;
    }

    const state = { type: 'all', query: '' };

    const matches = (p) => {
      if (state.type !== 'all' && p.type !== state.type) return false;
      if (!state.query) return true;
      const haystack = [
        p.title,
        p.venue,
        p.year,
        ...(p.authors || []).map((a) => a.name)
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(state.query);
    };

    const countEl = document.querySelector('[data-pub-count]');

    const render = () => {
      const visible = all.filter(matches);

      if (countEl) {
        countEl.textContent = `${visible.length} of ${all.length} publication${all.length === 1 ? '' : 's'}`;
      }

      if (!visible.length) {
        renderState(container, 'No publications match these filters.');
        return;
      }

      const years = [...new Set(visible.map((p) => p.year))];
      container.innerHTML = years
        .map(
          (year) => `
            <section class="pub-year">
              <h2 class="pub-year__label">${esc(year)}</h2>
              ${visible
                .filter((p) => p.year === year)
                .map((p) => publicationHTML(p))
                .join('')}
            </section>`
        )
        .join('');
    };

    render();
    wireCite(container, all);

    document.querySelectorAll('[data-pub-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.type = btn.dataset.pubFilter;
        document.querySelectorAll('[data-pub-filter]').forEach((b) => {
          b.setAttribute('aria-pressed', String(b === btn));
        });
        render();
      });
    });

    const search = document.querySelector('[data-pub-search]');
    if (search) {
      search.addEventListener('input', () => {
        state.query = search.value.trim().toLowerCase();
        render();
      });
    }

    // "Download all as BibTeX" — generated client-side, no server needed.
    const exportBtn = document.querySelector('[data-pub-export]');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const blob = new Blob([all.map(toBibtex).join('\n\n')], {
          type: 'application/x-bibtex'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'peramorphiq-publications.bib';
        a.click();
        URL.revokeObjectURL(url);
      });
    }
  });
}

/** Publication count, for the home-page statistics. */
export async function publicationCount() {
  return (await getData('publications')).length;
}
