# Contributing content

All content on this site is data-driven. **You should not need to write HTML to
publish a project, publication or news item** — you edit one JSON file in
`data/` and commit.

## Running the site locally

The site uses ES modules and `fetch()` on local JSON, so it must be served over
HTTP. Opening the files directly (`file://`) will not work.

```bash
python -m http.server 5502
# then open http://localhost:5502
```

VS Code's Live Server extension also works (configured for port 5502).

---

## Adding a project

### The easy way

Open **<http://localhost:5502/tools/add-project.html>** (or `/tools/add-project.html`
on the live site). Fill in the form, watch the card preview, press **Copy JSON**,
and paste the object into the `data` array in `data/projects.json`.

The same page has a **Validate data files** tab that checks every project and
publication for missing fields, duplicate slugs, broken image paths and
malformed DOIs. Run it before you commit.

### By hand

Add an object to the `data` array in [`data/projects.json`](data/projects.json).
New projects go at the top — the home page shows the first three with
`"featured": true`.

```jsonc
{
  "slug": "my-project",            // required, unique, lowercase-hyphenated
  "title": "Project title",        // required
  "summary": "One or two sentences for the card.",  // required

  "status": "active",              // "active" | "completed"
  "startYear": 2026,
  "endYear": null,                 // null while ongoing
  "cohort": "E21 Final Year Project",
  "featured": true,                // show on the home page

  "topics": ["Neuromorphic Computing", "RISC-V"],
  "image": "data/img/project/my-project/cover.png",

  "links": {
    "github": "https://github.com/...",
    "paper":  "https://doi.org/..."
  },

  "team": [{ "eNumber": "E/21/001" }],
  "supervisors": [{ "email": "isurunawinne@eng.pdn.ac.lk" }],

  "sections": [
    { "heading": "Overview", "body": ["First paragraph.", "Second paragraph."] },
    { "heading": "Method",   "list": ["Step one", "Step two"] },
    {
      "heading": "Results",
      "body": ["Prose."],
      "images": [{ "src": "data/img/project/my-project/fig1.png", "caption": "…" }]
    }
  ]
}
```

Only `slug`, `title` and `summary` are required — everything else degrades
gracefully if omitted.

**Notes**

- The detail page is generated at `project.html?id=<slug>`. There is no HTML file
  to create.
- Put images in `data/img/project/<slug>/`. Paths are written from the
  repository root. Diagrams are displayed whole (not cropped), so any aspect
  ratio is fine; wide diagrams look best as covers.
- `team` and `supervisors` hold only e-numbers and department emails. Names,
  photos and social links are fetched live from the CE department directory.

---

## Adding a publication

Add an object to the `data` array in
[`data/publications.json`](data/publications.json). Order does not matter —
the list is sorted by year (then month) automatically.

```jsonc
{
  "id": "surname2026keyword",      // BibTeX citation key
  "title": "Paper title",
  "authors": [
    { "name": "Author One", "group": true },   // group: true renders in bold
    { "name": "External Collaborator" }
  ],
  "type": "journal",               // "journal" | "conference" | "preprint" | "thesis"
  "venue": "Journal of Systems Architecture",
  "venueShort": "JSA",
  "volume": "177",
  "articleNumber": "103869",
  "year": 2026,
  "month": 8,                      // optional, orders papers within a year
  "doi": "10.1016/j.sysarc.2026.103869",
  "url": "https://www.sciencedirect.com/science/article/pii/...",
  "arxiv": "2603.11939",           // optional
  "pdf": "",                       // optional
  "code": "",                      // optional
  "openAccess": true,
  "license": "CC BY 4.0",
  "abstract": "…"                  // optional
}
```

**Give the DOI in bare form** (`10.1016/...`), not as a URL. A full URL is
tolerated and normalised, but bare is correct.

BibTeX is generated from these fields — there is nothing extra to write.

---

## Adding a news item

Add an object to the `data` array in [`data/news.json`](data/news.json):

```jsonc
{
  "_id": "news2",                  // unique; becomes article.html?id=news2
  "title": "Headline",
  "date": "2026-09-01",
  "Author": "PeraMorphIQ Neuromorphic Research Group",
  "brief": "Standfirst shown on the card and above the article body.",
  "fullContent": "Body text.\nOne paragraph per newline.",
  "image": "data/img/news/news2/cover.jpg",
  "images": ["data/img/news/news2/1.jpg", "data/img/news/news2/2.jpg"]
}
```

---

## Adding or changing people

[`data/people.json`](data/people.json) holds only identifiers:

```jsonc
{
  "Graduate Researchers":    [{ "eNumber": "E/19/129", "current": "TA @ UOP" }],
  "Undergraduate Researchs": [{ "eNumber": "E/20/279" }],
  "Alumni Researchers":      [{ "eNumber": "E/17/018", "current": "Engineer @ ARM" }],
  "supervisors": [
    { "email": "isurunawinne@eng.pdn.ac.lk", "name": "Dr. Isuru Nawinne",
      "profile_page": "https://people.ce.pdn.ac.lk/staff/academic/isuru-nawinne" }
  ]
}
```

Names and photos come from <https://api.ce.pdn.ac.lk>. If someone appears with a
placeholder avatar, their department profile is missing or private — that is
fixed in the department directory, not here.

> The key `Undergraduate Researchs` is misspelled in the data file. The code
> maps it to the correct display label; renaming the key would require changing
> `assets/js/modules/people.js` at the same time.

---

## Changing navigation, header or footer

All site chrome lives in **one** place: [`assets/js/layout.js`](assets/js/layout.js).
Edit the `NAV` array or the footer template there and every page updates. Do not
add header or footer markup to individual pages.

## Changing colours, spacing or type

Everything is a custom property in
[`assets/css/tokens.css`](assets/css/tokens.css). **Never write a raw hex value
anywhere else.** See [`docs/DESIGN.md`](docs/DESIGN.md) for the system.

## Before you commit

1. Run the validator: `/tools/add-project.html` → **Validate data files**.
2. Click through the pages you changed and check the browser console is clean.
3. Confirm no new raw colour values were introduced:
   ```bash
   grep -rInE "#[0-9a-fA-F]{3,8}\b" --include=*.css --include=*.html --include=*.js . \
     | grep -v "assets/css/tokens.css"
   ```
