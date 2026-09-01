# PeraMorphIQ — Neuromorphic Research Group

Website for the PeraMorphIQ neuromorphic computing research group, Department of
Computer Engineering, University of Peradeniya.

**Live:** <https://peramorphiq.ce.pdn.ac.lk>

---

## Stack

A hand-written **static site with no build step** — plain HTML, CSS custom
properties, and ES modules. There is no `package.json`, no bundler and no
framework. Deployed by **GitHub Pages** straight from the default branch
(`CNAME` + `.nojekyll` at the repository root).

Content is driven by JSON files in `data/`, rendered client-side. Researcher
names, photos and profile links are fetched at runtime from the Department of
Computer Engineering directory API (<https://api.ce.pdn.ac.lk>), so profiles
stay current without anyone editing this repository.

## Running locally

ES modules and `fetch()` of local JSON require HTTP — opening the files via
`file://` will not work.

```bash
python -m http.server 5502
# http://localhost:5502
```

## Layout

```
index.html          Home
projects.html       Project index (filter by status and topic, search)
project.html?id=…   Project detail — generated from data/projects.json
publications.html   Publications (year-grouped, filters, BibTeX export)
people.html         Supervisors, researchers, alumni
news.html           News index
article.html?id=…   News article
contact.html        Contact form (EmailJS)

assets/
  css/    tokens → base → components → pages
  js/     layout.js (shared header/footer), reveal.js
  js/modules/   data, projects, publications, people, people-api, news, home
  img/    partners, placeholder, title
data/     projects, publications, news, people, research-areas (+ img/)
tools/    add-project.html — content authoring form and data validator
docs/     DESIGN.md — the design system
```

Old URLs (`publication.html`, `contactUs.html`, `News/news.html`,
`project_folder/projectN/project_N.html`) are preserved as redirect stubs.

## Adding content

**You do not need to write HTML.** Open `/tools/add-project.html`, fill in the
form, and paste the generated JSON into `data/projects.json`. Publications and
news are single JSON entries too.

Full instructions: **[CONTRIBUTING.md](CONTRIBUTING.md)**.

## Design system

Near-monochrome — a neutral ink ramp plus one accent. Every value is a custom
property in `assets/css/tokens.css`; no raw colour value appears anywhere else.

See **[docs/DESIGN.md](docs/DESIGN.md)**.

## Conventions worth knowing

- **Site chrome lives in one file.** The header and footer are injected by
  `assets/js/layout.js`. Do not add nav or footer markup to a page.
- **`html { font-size: 62.5% }`**, so `1rem = 10px` throughout.
- **DOIs are stored bare** (`10.1016/...`). Full URLs are normalised on render.
- **Project images are displayed whole**, not cropped — covers are architecture
  diagrams, so any aspect ratio works.
