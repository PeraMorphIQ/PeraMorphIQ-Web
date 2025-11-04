// Load news details from local ../_data/news.json and locate the item by id
function getNewsIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

async function loadNewsDetails() {
const id = getNewsIdFromURL();
if (!id) return;
try {
    const res = await fetch('../_data/news.json');
    if (!res.ok) throw new Error(`Failed to load ./_data/news.json: ${res.status}`);

    const json = await res.json();

    const news = Array.isArray(json.data) ? json.data.find(n => n._id === id) : null;

    if (!news) throw new Error('News item not found');

    document.querySelector('.news-title').textContent = news.title || '';
    document.querySelector('.news-meta li:nth-child(1)').textContent = `Author: ${news.author || ''}`;
    document.querySelector('.news-meta li:nth-child(3)').textContent = `Publish: ${news.date ? new Date(news.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
    }) : ''}`;
    document.querySelector('.news-image').src = news.image || '';
    document.querySelector('.news-image').alt = news.title || '';
    const paragraphs = (news.fullContent || news.brief || '').split('\n');
    document.querySelector('.news-content').innerHTML = paragraphs.map(p=>`<p>${p}</p>`).join(''); 

} catch(e) {
    console.log(e);
    document.querySelector('.news-main').innerHTML = '<p class="text-center">Failed to load news details.</p>';
}
}

document.addEventListener('DOMContentLoaded', loadNewsDetails);