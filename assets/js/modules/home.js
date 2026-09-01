/**
 * Home-page-only blocks: research areas and the statistics row.
 */

import { asset } from '../layout.js';
import { getData, esc, attr, withContainer } from './data.js';
import { projectCount } from './projects.js';
import { publicationCount } from './publications.js';
import { peopleCount } from './people.js';

/** Research areas — the entry point a visiting researcher looks for first. */
export function loadResearchAreas(selector) {
  return withContainer(selector, async (container) => {
    const areas = await getData('researchAreas');

    container.innerHTML = areas
      .map(
        (area, i) => `
        <article class="area reveal-item">
          <span class="area__index">${String(i + 1).padStart(2, '0')}</span>
          <h3 class="area__title">${esc(area.title)}</h3>
          <p class="area__text">${esc(area.description)}</p>
          <p class="area__link">
            <a class="link-forward" href="${attr(asset('projects.html'))}?topic=${encodeURIComponent(area.topic)}">
              Related projects
            </a>
          </p>
        </article>`
      )
      .join('');
  });
}

/**
 * Statistics, computed from the data files.
 *
 * These used to be hand-typed in the markup ("7+ Active Research Projects"
 * against six actual entries) and drifted every time content was added.
 */
export function loadStats(selector) {
  return withContainer(selector, async (container) => {
    const [projects, publications, people] = await Promise.all([
      projectCount(),
      publicationCount(),
      peopleCount()
    ]);

    const activeProjects = (await getData('projects')).filter(
      (p) => p.status === 'active'
    ).length;

    const stats = [
      { value: projects, label: 'Research projects' },
      { value: activeProjects, label: 'Currently active' },
      { value: publications, label: 'Publications' },
      { value: people, label: 'Researchers & alumni' }
    ];

    container.innerHTML = stats
      .map(
        (s) => `
        <div class="stat reveal-item">
          <span class="stat__value">${esc(s.value)}</span>
          <span class="stat__label">${esc(s.label)}</span>
        </div>`
      )
      .join('');
  });
}
