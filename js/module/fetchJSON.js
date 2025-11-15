export async function fetchJSON(path) {
    const localMap = {
      news: './data/news.json',
      publications: './data/publication.json',
      blogs: './data/blogs.json',
      projects: './data/project.json',
      people: './data/people.json',
      /* backward-compatible alias */
      contributors: './data/people.json'
    };

    const file = localMap[path];
    if (!file) throw new Error(`No local data mapping for path: ${path}`);

    const response = await fetch(file, { headers: { 'Content-Type': 'application/json' } });
    if (!response.ok) throw new Error(`Failed to load local data ${file}: ${response.status}`);
    return response.json();
}
