/**
 * One person card, shared by the People page and project detail pages.
 *
 * Both used to carry their own near-identical copy of this template, which is
 * how the two drifted (different alt-text conventions, different link sets).
 */

import { asset } from '../layout.js';
import { esc, attr } from './data.js';

const AVATAR = 'assets/img/placeholder/avatar.svg';

const LINK_LABELS = {
  linkedin: 'LinkedIn',
  github: 'GitHub',
  website: 'Website',
  researchgate: 'ResearchGate',
  cv: 'CV'
};

/**
 * @param {object} person  as returned by fetchTeamMembers / fetchSupervisors
 * @param {object} [options]
 * @param {boolean} [options.links=true]  show profile and social links
 * @param {number}  [options.maxLinks=3]  cap on social links after "Profile"
 */
export function personCardHTML(person, { links = true, maxLinks = 3 } = {}) {
  const photo = person.image || asset(AVATAR);

  const linkRow = [];
  if (links) {
    if (person.profile_page) {
      linkRow.push(
        `<a href="${attr(person.profile_page)}" target="_blank" rel="noopener">Profile</a>`
      );
    }
    Object.entries(person.urls || {})
      .filter(([key, url]) => url && LINK_LABELS[key])
      .slice(0, maxLinks)
      .forEach(([key, url]) =>
        linkRow.push(
          `<a href="${attr(url)}" target="_blank" rel="noopener">${esc(LINK_LABELS[key])}</a>`
        )
      );
  }

  return `
    <li class="person reveal-item">
      <img class="person__photo" src="${attr(photo)}" alt=""
           loading="lazy" decoding="async"
           onerror="this.onerror=null;this.src='${attr(asset(AVATAR))}'" />
      <div>
        <p class="person__name">${esc(person.name)}</p>
        ${person.position ? `<p class="person__role">${esc(person.position)}</p>` : ''}
        ${person.current_affiliation ? `<p class="person__meta">${esc(person.current_affiliation)}</p>` : ''}
      </div>
      ${linkRow.length ? `<div class="person__links">${linkRow.join('')}</div>` : ''}
    </li>`;
}
