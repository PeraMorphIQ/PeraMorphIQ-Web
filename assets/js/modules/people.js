/**
 * People: supervisors, graduate, undergraduate and alumni researchers.
 *
 * The old loader repeated an identical card template four times; here one
 * `personHTML` serves every group.
 */

import { asset } from '../layout.js';
import { getData, esc, attr, withContainer } from './data.js';
import { fetchTeamMembers, fetchSupervisors } from './people-api.js';

const AVATAR = 'assets/img/placeholder/avatar.svg';

// The people.json key is misspelled "Undergraduate Researchs". Mapping it here
// keeps the display label correct without a risky data migration.
const GROUPS = [
  { key: 'supervisors', label: 'Supervisors', staff: true },
  { key: 'Graduate Researchers', label: 'Graduate researchers' },
  { key: 'Undergraduate Researchs', label: 'Undergraduate researchers' },
  { key: 'Alumni Researchers', label: 'Alumni' }
];

const LINK_LABELS = {
  linkedin: 'LinkedIn',
  github: 'GitHub',
  website: 'Website',
  researchgate: 'ResearchGate',
  cv: 'CV'
};

function personHTML(person) {
  const photo = person.image || asset(AVATAR);
  const links = Object.entries(person.urls || {})
    .filter(([key, url]) => url && LINK_LABELS[key])
    .slice(0, 3)
    .map(
      ([key, url]) =>
        `<a href="${attr(url)}" target="_blank" rel="noopener">${esc(LINK_LABELS[key])}</a>`
    );

  if (person.profile_page) {
    links.unshift(
      `<a href="${attr(person.profile_page)}" target="_blank" rel="noopener">Profile</a>`
    );
  }

  return `
    <li class="person reveal-item">
      <img class="person__photo" src="${attr(photo)}" alt="${attr(person.name)}"
           loading="lazy" decoding="async"
           onerror="this.onerror=null;this.src='${attr(asset(AVATAR))}'" />
      <div>
        <p class="person__name">${esc(person.name)}</p>
        ${person.position ? `<p class="person__role">${esc(person.position)}</p>` : ''}
        ${person.current_affiliation ? `<p class="person__meta">${esc(person.current_affiliation)}</p>` : ''}
      </div>
      ${links.length ? `<div class="person__links">${links.join('')}</div>` : ''}
    </li>`;
}

/**
 * Render every people group into `selector`.
 * @param {object} [options]
 * @param {string[]} [options.only] restrict to these group keys
 * @param {number}   [options.limit] cap members per group
 */
export function loadPeople(selector, { only = null, limit = null } = {}) {
  return withContainer(selector, async (container) => {
    const [record] = await getData('people');
    if (!record) return;

    const groups = GROUPS.filter((g) => !only || only.includes(g.key));

    // Render the headings immediately, then fill each group as its API calls
    // resolve — one slow lookup should not hold up the whole page.
    container.innerHTML = groups
      .map(
        (g) => `
        <section class="people-group">
          <h2 class="people-group__title">${esc(g.label)}</h2>
          <ul class="grid grid--5" data-group="${attr(g.key)}">
            <li class="muted">Loading…</li>
          </ul>
        </section>`
      )
      .join('');

    await Promise.all(
      groups.map(async (group) => {
        const list = container.querySelector(`[data-group="${CSS.escape(group.key)}"]`);
        if (!list) return;

        let members = record[group.key] || [];
        if (limit) members = members.slice(0, limit);

        const people = group.staff
          ? await fetchSupervisors(members)
          : await fetchTeamMembers(members);

        list.innerHTML = people.length
          ? people.map(personHTML).join('')
          : '<li class="muted">To be announced.</li>';
      })
    );
  });
}

/** Total headcount across all groups, for the home-page statistics. */
export async function peopleCount() {
  const [record] = await getData('people');
  if (!record) return 0;
  return GROUPS.reduce((sum, g) => sum + (record[g.key]?.length || 0), 0);
}
