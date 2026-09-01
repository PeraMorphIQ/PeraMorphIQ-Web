/**
 * Shared site chrome.
 *
 * Replaces the header and footer markup that used to be copy-pasted into nine
 * HTML files (and had already drifted apart). Every page now carries only:
 *
 *     <div data-layout="header"></div>
 *     ...
 *     <div data-layout="footer"></div>
 *     <script type="module" src="<prefix>assets/js/layout.js"></script>
 *
 * The path prefix is derived from this module's own URL, so pages at any depth
 * resolve assets correctly without hardcoding "./" or "../".
 */

/** The site root, derived from this module's own URL (assets/js/layout.js). */
const SITE_ROOT = new URL('../../', import.meta.url);

/** Resolve a root-relative path (e.g. "data/projects.json") to an absolute URL. */
export function asset(path) {
  return new URL(String(path).replace(/^\.?\//, ''), SITE_ROOT).href;
}

const NAV = [
  { id: 'research', label: 'Research', href: 'projects.html' },
  { id: 'publications', label: 'Publications', href: 'publications.html' },
  { id: 'people', label: 'People', href: 'people.html' },
  { id: 'news', label: 'News', href: 'news.html' },
  { id: 'about', label: 'About', href: 'index.html#about' }
];

const CONTACT_EMAIL = 'peramorphiq@eng.pdn.ac.lk';
const CONTACT_PHONE_DISPLAY = '+94 71 849 5506';
const CONTACT_PHONE_HREF = '+94718495506';
const GITHUB_URL = 'https://github.com/PeraMorphIQ';
const LINKEDIN_URL = 'https://www.linkedin.com/company/peramorphiq/';
const ESCAL_URL = 'https://escal.ce.pdn.ac.lk/';
// No public PeraCom site is known; leave empty and the mark renders unlinked.
const PERACOM_URL = '';
const DEPT_URL = 'https://www.ce.pdn.ac.lk/';

function headerHTML(active) {
  const links = NAV.map((item) => {
    const current = item.id === active ? ' aria-current="page"' : '';
    return `<li><a class="site-nav__link" href="${asset(item.href)}"${current}>${item.label}</a></li>`;
  }).join('');

  return `
    <header class="site-header">
      <div class="site-header__inner">
        <div class="brand-lockup">
          <a class="brand" href="${asset('index.html')}">
            <img class="brand__mark" src="${asset('assets/img/title/image3.png')}" alt="" width="32" height="32" />
            <span class="wordmark">PeraMorphIQ</span>
          </a>

          <!-- PeraMorphIQ sits under ESCAL and PeraCom; the header states that. -->
          <span class="brand-lockup__rule" aria-hidden="true"></span>
          <ul class="parent-orgs">
            <li>
              <a href="${ESCAL_URL}" rel="noopener"
                 title="ESCAL - Embedded Systems and Computer Architecture Laboratory">
                <img src="${asset('assets/img/partners/logo-2.png')}"
                     alt="ESCAL - Embedded Systems and Computer Architecture Laboratory" />
              </a>
            </li>
            <li title="PeraCom">
              <img src="${asset('assets/img/partners/peracomlogo.png')}" alt="PeraCom" />
            </li>
          </ul>
        </div>

        <button class="nav-toggle" type="button" aria-label="Open menu"
                aria-expanded="false" aria-controls="site-nav" data-nav-toggle>
          <span class="nav-toggle__bar"></span>
        </button>

        <nav class="site-nav" id="site-nav" aria-label="Primary">
          <ul class="site-nav__list">
            ${links}
            <li class="site-header__cta">
              <a class="btn btn--secondary btn--sm" href="${asset('contact.html')}"
                 ${active === 'contact' ? 'aria-current="page"' : ''}>Contact</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>`;
}

function footerHTML() {
  const year = new Date().getFullYear();

  return `
    <footer class="site-footer">
      <div class="container">
        <div class="site-footer__grid">
          <div class="site-footer__brand">
            <span class="wordmark">PeraMorphIQ</span>
            <p class="site-footer__tagline">
              Neuromorphic computing research at the Department of Computer
              Engineering, University of Peradeniya. Brain-inspired hardware
              for energy-efficient intelligence at the edge.
            </p>
          </div>

          <div class="footer-col">
            <h2 class="footer-col__title">Explore</h2>
            <ul>
              <li><a href="${asset('projects.html')}">Research projects</a></li>
              <li><a href="${asset('publications.html')}">Publications</a></li>
              <li><a href="${asset('people.html')}">People</a></li>
              <li><a href="${asset('news.html')}">News</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h2 class="footer-col__title">Research areas</h2>
            <ul>
              <li><a href="${asset('projects.html')}?topic=Neuromorphic%20Computing">Neuromorphic accelerators</a></li>
              <li><a href="${asset('projects.html')}?topic=Spiking%20Neural%20Networks">Spiking neural networks</a></li>
              <li><a href="${asset('projects.html')}?topic=RISC-V">RISC-V &amp; NoC</a></li>
              <li><a href="${asset('projects.html')}?topic=Edge%20Computing">Edge AI hardware</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h2 class="footer-col__title">Contact</h2>
            <ul>
              <li>Department of Computer Engineering,<br />University of Peradeniya,<br />Peradeniya 20400, Sri Lanka</li>
              <li><a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></li>
              <li><a href="tel:${CONTACT_PHONE_HREF}">${CONTACT_PHONE_DISPLAY}</a></li>
              <li><a href="${LINKEDIN_URL}" rel="noopener">LinkedIn</a></li>
              <li><a href="${GITHUB_URL}" rel="noopener">GitHub</a></li>
            </ul>
          </div>
        </div>

        <div class="site-footer__bottom">
          <p>&copy; ${year} PeraMorphIQ Neuromorphic Research Group.</p>
          <p><a href="${DEPT_URL}" rel="noopener">Department of Computer Engineering</a></p>
        </div>
      </div>
    </footer>`;
}

/** Wire the mobile drawer: opens on toggle, closes on link, Escape, outside click. */
function initNav() {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.getElementById('site-nav');
  if (!header || !toggle || !nav) return;

  const setOpen = (open) => {
    document.documentElement.dataset.navOpen = String(open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };

  const isOpen = () => document.documentElement.dataset.navOpen === 'true';

  toggle.addEventListener('click', () => setOpen(!isOpen()));

  // The old site never closed the drawer - you tapped a link and the overlay
  // stayed up over the destination. All three of these fix that.
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (isOpen() && !header.contains(e.target)) setOpen(false);
  });

  // Leaving the mobile breakpoint must not strand a hidden-but-open drawer.
  window.matchMedia('(min-width: 56.01em)').addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });
}

/** Inject chrome. `data-page` on <body> selects the active nav item. */
export function mountLayout() {
  const active = document.body.dataset.page || '';

  const headerSlot = document.querySelector('[data-layout="header"]');
  if (headerSlot) headerSlot.outerHTML = headerHTML(active);

  const footerSlot = document.querySelector('[data-layout="footer"]');
  if (footerSlot) footerSlot.outerHTML = footerHTML();

  initNav();
}

mountLayout();
