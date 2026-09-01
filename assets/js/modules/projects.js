/**
 * Projects: cards, the filterable index, and the data-driven detail page.
 *
 * Detail pages used to be six hand-written HTML files under project_folder/,
 * with URLs derived by string surgery on the id (`project4` -> project_4.html).
 * Everything is now rendered from data/projects.json against project.html?id=<slug>,
 * so adding a project is a single JSON entry.
 */

import { asset } from '../layout.js';
import { getData, esc, attr, renderState, withContainer } from './data.js';
import { fetchTeamMembers, fetchSupervisors } from './people-api.js';
import { personCardHTML } from './person.js';
import { wireLightbox } from './lightbox.js';

const PLACEHOLDER = 'assets/img/placeholder/logo-mark.png';

function coverFor(project) {
  return asset(project.image || PLACEHOLDER);
}

function yearLabel(project) {
  const { startYear, endYear } = project;
  if (!startYear) return '';
  if (!endYear) return `${startYear}-present`;
  return startYear === endYear ? String(startYear) : `${startYear}-${endYear}`;
}

function statusBadge(project) {
  const active = project.status === 'active';
  return `<span class="badge${active ? ' badge--active' : ''}">
      <span class="badge__dot"></span>${active ? 'Active' : 'Completed'}
    </span>`;
}

function detailHref(slug) {
  return `${asset('project.html')}?id=${encodeURIComponent(slug)}`;
}

function cardHTML(project) {
  const topics = (project.topics || []).slice(0, 3);
  const extra = (project.topics || []).length - topics.length;

  return `
    <article class="card reveal-item">
      <div class="card__media${project.image ? '' : ' card__media--placeholder'}">
        <img src="${attr(coverFor(project))}" alt="" loading="lazy" decoding="async"
             onerror="this.onerror=null;this.src='${attr(asset(PLACEHOLDER))}';this.parentElement.classList.add('card__media--placeholder')" />
      </div>
      <div class="card__body">
        <div class="card__meta">
          ${statusBadge(project)}
          ${
            [project.cohort, yearLabel(project)].filter(Boolean).length
              ? `<span>${esc([project.cohort, yearLabel(project)].filter(Boolean).join(' · '))}</span>`
              : ''
          }
        </div>

        <h3 class="card__title">
          <a class="stretched-link" href="${attr(detailHref(project.slug))}">${esc(project.title)}</a>
        </h3>

        <p class="card__text">${esc(project.summary)}</p>

        <div class="card__footer">
          <div class="tag-list">
            ${topics.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}
            ${extra > 0 ? `<span class="tag">+${extra}</span>` : ''}
          </div>
        </div>
      </div>
    </article>`;
}

/** Render project cards into a grid (home page uses `limit` + `featured`). */
export function loadProjects(selector, { limit = null, featured = false } = {}) {
  return withContainer(selector, async (container) => {
    let items = await getData('projects');

    if (featured) {
      const picked = items.filter((p) => p.featured);
      if (picked.length) items = picked;
    }
    if (limit) items = items.slice(0, limit);

    if (!items.length) {
      renderState(container, 'No projects yet.');
      return;
    }

    container.innerHTML = items.map(cardHTML).join('');
  });
}

/** Render the full project index with status/topic filters and search. */
export function loadProjectIndex(selector) {
  return withContainer(selector, async (container) => {
    const all = await getData('projects');

    if (!all.length) {
      renderState(container, 'No projects yet.');
      return;
    }

    // A ?topic= in the URL pre-selects a filter, so the footer's research-area
    // links land on a filtered view rather than the unfiltered list.
    const params = new URLSearchParams(window.location.search);
    const state = {
      status: 'all',
      topic: params.get('topic') || 'all',
      query: ''
    };

    const topics = [...new Set(all.flatMap((p) => p.topics || []))].sort();

    const topicBar = document.querySelector('[data-topic-filters]');
    if (topicBar) {
      topicBar.innerHTML = ['all', ...topics]
        .map(
          (t) =>
            `<button type="button" class="chip" data-topic="${attr(t)}"
              aria-pressed="${t === state.topic}">${t === 'all' ? 'All topics' : esc(t)}</button>`
        )
        .join('');
    }

    const matches = (p) => {
      if (state.status !== 'all' && p.status !== state.status) return false;
      if (state.topic !== 'all' && !(p.topics || []).includes(state.topic)) return false;
      if (!state.query) return true;
      const haystack = [p.title, p.summary, ...(p.topics || []), p.cohort]
        .join(' ')
        .toLowerCase();
      return haystack.includes(state.query);
    };

    const countEl = document.querySelector('[data-project-count]');

    const render = () => {
      const visible = all.filter(matches);

      if (countEl) {
        countEl.textContent = `${visible.length} of ${all.length} project${all.length === 1 ? '' : 's'}`;
      }

      container.innerHTML = visible.length
        ? visible.map(cardHTML).join('')
        : '';

      if (!visible.length) {
        renderState(container, 'No projects match these filters.', 'Try clearing the search or selecting a different topic.');
      }
    };

    render();

    document.querySelectorAll('[data-status]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.status = btn.dataset.status;
        document.querySelectorAll('[data-status]').forEach((b) =>
          b.setAttribute('aria-pressed', String(b === btn))
        );
        render();
      });
    });

    if (topicBar) {
      topicBar.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-topic]');
        if (!btn) return;
        state.topic = btn.dataset.topic;
        topicBar.querySelectorAll('[data-topic]').forEach((b) =>
          b.setAttribute('aria-pressed', String(b === btn))
        );
        render();
      });
    }

    const search = document.querySelector('[data-project-search]');
    if (search) {
      search.addEventListener('input', () => {
        state.query = search.value.trim().toLowerCase();
        render();
      });
    }
  });
}

/* -------------------------------------------------------------------------
   Detail page
   ------------------------------------------------------------------------- */

function figureHTML(image) {
  return `
    <figure class="figure">
      <img src="${attr(asset(image.src))}" alt="${attr(image.caption || '')}" loading="lazy" decoding="async" />
      ${image.caption ? `<figcaption>${esc(image.caption)}</figcaption>` : ''}
    </figure>`;
}

function sectionHTML(section) {
  const images = section.images || [];

  return `
    <section class="project-section">
      <h2 class="project-section__title">${esc(section.heading)}</h2>
      ${(section.body || []).map((p) => `<p>${esc(p)}</p>`).join('')}
      ${
        section.list?.length
          ? `<ul class="bullets">${section.list.map((li) => `<li>${esc(li)}</li>`).join('')}</ul>`
          : ''
      }
      ${
        images.length === 1
          ? figureHTML(images[0])
          : images.length > 1
            ? `<div class="figure-grid">${images.map(figureHTML).join('')}</div>`
            : ''
      }
    </section>`;
}

const LINK_LABELS = {
  github: 'GitHub repository',
  paper: 'Related publication',
  demo: 'Demo',
  report: 'Project report'
};

function asideHTML(project, related) {
  const links = Object.entries(project.links || {}).filter(([, v]) => v);

  return `
    ${
      links.length
        ? `<div class="aside-block">
             <h2 class="aside-block__title">Links</h2>
             <ul>${links
               .map(
                 ([k, v]) =>
                   `<li><a href="${attr(v)}" target="_blank" rel="noopener">${esc(LINK_LABELS[k] || k)}</a></li>`
               )
               .join('')}</ul>
           </div>`
        : ''
    }

    <div class="aside-block">
      <h2 class="aside-block__title">Topics</h2>
      <div class="tag-list">
        ${(project.topics || [])
          .map(
            (t) =>
              `<a class="tag" href="${attr(asset('projects.html'))}?topic=${encodeURIComponent(t)}">${esc(t)}</a>`
          )
          .join('')}
      </div>
    </div>

    ${
      related.length
        ? `<div class="aside-block">
             <h2 class="aside-block__title">Related projects</h2>
             <ul>${related
               .map(
                 (r) =>
                   `<li><a href="${attr(detailHref(r.slug))}">${esc(r.title)}</a></li>`
               )
               .join('')}</ul>
           </div>`
        : ''
    }`;
}

/** Render a single project from ?id=<slug>. */
export function loadProjectDetail(selector) {
  return withContainer(selector, async (root) => {
    const slug = new URLSearchParams(window.location.search).get('id');

    // project.html with no ?id is the old listing URL - send it to the index
    // rather than showing a "not found" page.
    if (!slug) {
      window.location.replace(asset('projects.html'));
      return;
    }

    const all = await getData('projects');
    const project = all.find((p) => p.slug === slug);

    if (!project) {
      document.title = 'Project not found | PeraMorphIQ';
      root.innerHTML = `
        <div class="container section">
          <div class="state">
            <p class="state__title">Project not found</p>
            <p>No project matches “${esc(slug)}”.</p>
            <p style="margin-top:var(--space-4)">
              <a class="btn btn--primary" href="${attr(asset('projects.html'))}">All research projects</a>
            </p>
          </div>
        </div>`;
      return;
    }

    document.title = `${project.title} | PeraMorphIQ`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', project.summary || '');

    const related = all
      .filter(
        (p) =>
          p.slug !== project.slug &&
          (p.topics || []).some((t) => (project.topics || []).includes(t))
      )
      .slice(0, 3);

    root.innerHTML = `
      <div class="project-hero">
        <div class="container">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="${attr(asset('index.html'))}">Home</a>
            <span class="breadcrumb__sep">/</span>
            <a href="${attr(asset('projects.html'))}">Research</a>
            <span class="breadcrumb__sep">/</span>
            <span aria-current="page">${esc(project.title)}</span>
          </nav>

          <h1 class="project-hero__title">${esc(project.title)}</h1>

          <div class="project-hero__meta">
            ${statusBadge(project)}
            ${project.cohort ? `<span class="badge">${esc(project.cohort)}</span>` : ''}
            ${yearLabel(project) ? `<span class="badge">${esc(yearLabel(project))}</span>` : ''}
          </div>

          <p class="project-hero__summary">${esc(project.summary)}</p>
        </div>
      </div>

      <div class="container">
        <div class="project-layout">
          <div>
            ${(project.sections || []).map(sectionHTML).join('')}

            <section class="project-section" id="team">
              <h2 class="project-section__title">Team</h2>
              <ul class="grid grid--4" data-team></ul>
              <h3 style="font-size:var(--text-md);margin:var(--space-6) 0 var(--space-4)">Supervisors</h3>
              <ul class="grid grid--4" data-supervisors></ul>
            </section>
          </div>

          <aside class="project-aside">
            ${asideHTML(project, related)}
          </aside>
        </div>
      </div>`;

    // People are hydrated from the CE department API after first paint, so a
    // slow or unavailable API never blocks the project content itself.
    hydratePeople(project, root);
    wireLightbox(root);
  });
}

async function hydratePeople(project, root) {
  const teamEl = root.querySelector('[data-team]');
  const supEl = root.querySelector('[data-supervisors]');

  const [team, supervisors] = await Promise.all([
    fetchTeamMembers(project.team || []),
    fetchSupervisors(project.supervisors || [])
  ]);

  if (teamEl) {
    teamEl.innerHTML = team.length
      ? team.map((m) => personCardHTML(m)).join('')
      : '<li class="muted">Team details to be announced.</li>';
  }
  if (supEl) {
    supEl.innerHTML = supervisors.map((m) => personCardHTML(m)).join('');
  }
}

/** Project count, for the home-page statistics. */
export async function projectCount() {
  return (await getData('projects')).length;
}
