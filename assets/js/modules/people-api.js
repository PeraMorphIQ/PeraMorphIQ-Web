/**
 * Department of Computer Engineering people directory.
 *
 * Names, photos, positions and social links are not stored in this repo - only
 * e-numbers and staff emails are. Everything else is resolved at runtime from
 * the CE API, so profiles stay current without anyone editing this site.
 *
 * Both functions take an ARRAY of member objects. (The old per-project scripts
 * passed a string, e.g. fetchTeamMembers('project4'), which threw on .map and
 * silently fell through to a hardcoded fallback.)
 */

const STUDENT_API = 'https://api.ce.pdn.ac.lk/people/v1/students';
const STAFF_API = 'https://api.ce.pdn.ac.lk/people/v1/staff';

const ENUMBER = /^([A-Za-z])\/(\d{2})\/(\d+)$/;

function parseENumber(eNumber) {
  const match = String(eNumber).match(ENUMBER);
  if (!match) return null;
  // The API indexes batches uppercase ("E19"); lowercase 404s. The public
  // profile pages use the lowercase form.
  return {
    batch: match[1].toUpperCase() + match[2],
    batchLower: match[1].toLowerCase() + match[2],
    id: match[3]
  };
}

function studentProfileURL(eNumber) {
  const parsed = parseENumber(eNumber);
  return parsed
    ? `https://people.ce.pdn.ac.lk/students/${parsed.batchLower}/${parsed.id}/`
    : '';
}

/** Resolve student researchers from their e-numbers. */
export async function fetchTeamMembers(members = []) {
  if (!Array.isArray(members)) {
    console.warn('fetchTeamMembers expects an array, received:', typeof members);
    return [];
  }

  return Promise.all(
    members.map(async (member) => {
      const fallback = {
        image: '',
        name: member.name || member.eNumber || 'Unknown',
        position: 'Researcher',
        current_affiliation: member.current || '',
        eNumber: member.eNumber,
        urls: {},
        profile_page: studentProfileURL(member.eNumber)
      };

      const parsed = parseENumber(member.eNumber);
      if (!parsed) return fallback;

      try {
        const res = await fetch(`${STUDENT_API}/${parsed.batch}/${parsed.id}/`);
        if (!res.ok) throw new Error(`CE students API ${res.status}`);
        const json = await res.json();

        return {
          ...fallback,
          image: json.profile_image || '',
          name: json.name_with_initials || fallback.name,
          current_affiliation:
            member.current || json.current_affiliation || json.current_position || '',
          urls: json.urls || {}
        };
      } catch (err) {
        console.warn('CE lookup failed for', member.eNumber, err);
        return fallback;
      }
    })
  );
}

/** Resolve academic staff from their department email addresses. */
export async function fetchSupervisors(supervisors = []) {
  if (!Array.isArray(supervisors)) {
    console.warn('fetchSupervisors expects an array, received:', typeof supervisors);
    return [];
  }

  return Promise.all(
    supervisors.map(async (supervisor) => {
      const email = String(supervisor.email || '');
      const tag = email.split('@')[0];
      const domain = email.split('@')[1] || '';

      // The CE staff directory only holds Computer Engineering staff. Querying
      // it for a co-supervisor from another department (e.g. @ee.pdn.ac.lk)
      // can only ever 404, so use the supplied details directly instead.
      const inCeDirectory = domain === 'eng.pdn.ac.lk';

      const fallback = {
        image: '',
        name: supervisor.name || supervisor.email || 'Unknown',
        position: 'Academic staff',
        email: supervisor.email,
        urls: {},
        // Only guess a CE profile URL for CE staff; for anyone else an
        // unverified people.ce.pdn.ac.lk link would simply 404.
        profile_page:
          supervisor.profile_page ||
          (inCeDirectory ? `https://people.ce.pdn.ac.lk/staff/${tag}/` : '')
      };

      if (!tag || !inCeDirectory) return fallback;

      try {
        const res = await fetch(`${STAFF_API}/${tag}/`);
        if (!res.ok) throw new Error(`CE staff API ${res.status}`);
        const json = await res.json();

        return {
          ...fallback,
          image: json.profile_image || '',
          position: json.designation || fallback.position,
          urls: json.urls || {}
        };
      } catch (err) {
        console.warn('CE staff lookup failed for', supervisor.email, err);
        return fallback;
      }
    })
  );
}
