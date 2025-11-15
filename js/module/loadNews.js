import { fetchJSON } from './fetchJson.js';

export async function loadNews(selector,limit=3) {
    const container = document.querySelector(selector);
    if (!container) return;

    try {
        const res = await fetchJSON('news');
    let items = res.data;

        if (!Array.isArray(items) || items.length === 0) {
            container.innerHTML = '<p class="text-center">No news available.</p>';
            return;
        }

        if(limit){
            items=items.slice(0,limit);
        }

        container.innerHTML = items.map(n => `
            <div class="news-grid">
              <img src="${n.image}" alt="news-img" class="news-img" />
              <div class="news-content">
                  <h4 class="news-heading">${n.title}</h4>
                  <p class="news-year">${new Date(n.date).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric'
                  })}</p>
                  <p class="news-brief-desc">${n.brief}</p>
                  <a href="./News/news.html" class="read-details">Read more<span>&rarr;</span></a>
              </div>
            </div>
        `).join('');
    } catch(e) {
        console.log(e);
        container.innerHTML = '<p class="text-center">Failed to load news.</p>';
    }
}
