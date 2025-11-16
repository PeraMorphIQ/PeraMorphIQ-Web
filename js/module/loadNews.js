import { fetchJSON } from './fetchJSON.js';

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

        container.innerHTML = items.map(n => {
            // Use the JSON path directly (it's relative to site root). Add loading/decoding and intrinsic size to avoid blurry scaling.
            const imgSrc = n.image || (n.images && n.images[0]) || '';
            const backgroundImgSrc = n.backgroundImg || '';
            const safeAlt = (n.title || 'News item').replace(/"/g, '');
            return `
            <div class="news-grid" style="background-image: url('${backgroundImgSrc}');">
              <img src="${imgSrc}" alt="${safeAlt}" class="news-img" loading="lazy" decoding="async" width="1280" height="720" />
              <div class="news-content">
                  <h4 class="news-heading">${n.title}</h4>
                  <p class="news-year">${new Date(n.date).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric'
                  })}</p>
                  <p class="news-brief-desc">${n.brief}</p>
                  <a href="./News/news.html?id=${encodeURIComponent(n._id)}" class="read-details">Read more<span>&rarr;</span></a>
              </div>
            </div>
        `}).join('');
    } catch(e) {
        console.log(e);
        container.innerHTML = '<p class="text-center">Failed to load news.</p>';
    }
}
