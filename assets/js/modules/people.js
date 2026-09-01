/**
 * People: supervisors, graduate, undergraduate and alumni researchers.
 *
 * The old loader repeated an identical card template four times; here one
 * shared `personCardHTML` (see person.js) serves every group.
 */

import { getData, esc, attr, withContainer } from './data.js';
import { fetchTeamMembers, fetchSupervisors } from './people-api.js';
import { personCardHTML } from './person.js';

const GROUPS = [
  { key: 'supervisors', label: 'Supervisors', staff: true },
  { key: 'Graduate Researchers', label: 'Graduate researchers' },
  { key: 'Undergraduate Researchs', label: 'Undergraduate researchers' },
  { key: 'Alumni Researchers', label: 'Alumni' }
];

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
    // resolve - one slow lookup should not hold up the whole page.
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
          ? people.map((m) => personCardHTML(m)).join('')
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
