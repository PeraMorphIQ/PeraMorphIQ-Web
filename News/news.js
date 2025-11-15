// Load news details from local ../data/news.json and locate the item by id
function getNewsIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function resolveAssetPath(p) {
    if (!p) return '';
    // Normalize supported relative prefixes to path from News/ folder
    if (p.startsWith('./img/')) {
        // Old scheme: assets in root img/
        return '../' + p.slice(2);
    }
    if (p.startsWith('./data/img/')) {
        // New scheme: assets stored inside data/img/
        return '../' + p.slice(2);
    }
    return p;
}

const FALLBACK_IMAGE = '../img/blog.png'; // existing image used as a placeholder

async function loadNewsDetails() {
const id = getNewsIdFromURL();
if (!id) {
    // If no id provided, show a friendly message
    const main = document.querySelector('.news-main');
    if (main) main.innerHTML = '<p class="text-center">No news selected. Please return to the <a href="../index.html#news">news</a> section and choose an item.</p>';
    return;
}
try {
    const res = await fetch('../data/news.json');
    if (!res.ok) throw new Error(`Failed to load ./data/news.json: ${res.status}`);

    const json = await res.json();

    const news = Array.isArray(json.data) ? json.data.find(n => n._id === id) : null;

    if (!news) throw new Error('News item not found');

        document.querySelector('.news-title').textContent = news.title || '';
        document.querySelector('.news-meta li:nth-child(1)').textContent = `Author: ${news.Author || news.author || ''}`;
        document.querySelector('.news-meta li:nth-child(3)').textContent = `Publish: ${news.date ? new Date(news.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
    }) : ''}`;
        const mainImgEl = document.querySelector('.news-image');
        const thumbsEl = document.querySelector('.news-thumbnails');

        // Support multiple images; fallback to single image
        const imgs = Array.isArray(news.images) && news.images.length > 0
            ? news.images
            : (news.image ? [news.image] : []);

            if (imgs.length > 0) {
                mainImgEl.src = resolveAssetPath(imgs[0]);
                mainImgEl.alt = news.title || '';
            } else {
                mainImgEl.removeAttribute('src');
            }
            // Fallback if main image 404s
            mainImgEl.addEventListener('error', () => {
                if (mainImgEl.src !== FALLBACK_IMAGE) {
                    mainImgEl.src = FALLBACK_IMAGE;
                }
            });

            if (thumbsEl) {
                thumbsEl.innerHTML = imgs.map((src, idx) => `
                    <img src="${resolveAssetPath(src)}" alt="${(news.title || '').replace(/"/g,'') } — image ${idx+1}" class="news-thumbnail ${idx === 0 ? 'active' : ''}" data-index="${idx}" loading="lazy" aria-current="${idx===0? 'true':''}" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'" />
                `).join('');

                // Preload main image and first thumbnail for perceived performance
                try {
                    const first = resolveAssetPath(imgs[0] || '');
                    if (first) {
                        const l1 = document.createElement('link'); l1.rel = 'preload'; l1.as = 'image'; l1.href = first; document.head.appendChild(l1);
                    }
                } catch (e) { /* ignore preload errors */ }

                thumbsEl.addEventListener('click', (e) => {
                    const t = e.target;
                    if (t && t.classList.contains('news-thumbnail')) {
                        const idx = Number(t.dataset.index || 0);
                        const src = t.getAttribute('src');
                        // update main image
                        mainImgEl.src = src;
                        // update active state & aria-current
                        thumbsEl.querySelectorAll('.news-thumbnail').forEach(el => {
                            el.classList.remove('active');
                            el.removeAttribute('aria-current');
                        });
                        t.classList.add('active');
                        t.setAttribute('aria-current', 'true');
                    }
                });
                // Open lightbox when clicking the main image
                mainImgEl.style.cursor = 'zoom-in';
                mainImgEl.addEventListener('click', () => {
                    const active = thumbsEl.querySelector('.news-thumbnail.active');
                    const idx = active ? Number(active.dataset.index || 0) : 0;
                    openLightbox(idx, imgs, news.title || '');
                });
            }

        const paragraphs = (news.fullContent || news.brief || '').split('\n');
        document.querySelector('.news-content').innerHTML = paragraphs.map(p=>`<p>${p}</p>`).join(''); 

} catch(e) {
    console.log(e);
    document.querySelector('.news-main').innerHTML = '<p class="text-center">Failed to load news details.</p>';
}
}

document.addEventListener('DOMContentLoaded', loadNewsDetails);

// Lightbox implementation
let _lbState = {
    images: [],
    title: '',
    current: 0,
    keyHandler: null,
    touchStartX: 0
};

function openLightbox(startIndex, imgs, title) {
    const lb = document.getElementById('lightbox');
    if (!lb) return;
    _lbState.images = imgs.map(resolveAssetPath);
    _lbState.title = title || '';
    _lbState.current = startIndex || 0;
    lb.setAttribute('aria-hidden', 'false');
    showLightboxIndex(_lbState.current);
    // keyboard
    _lbState.keyHandler = (e) => {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') lightboxPrev();
        if (e.key === 'ArrowRight') lightboxNext();
    };
    document.addEventListener('keydown', _lbState.keyHandler);
    // touch
    lb.addEventListener('touchstart', lightboxTouchStart);
    lb.addEventListener('touchend', lightboxTouchEnd);
}

function closeLightbox() {
    const lb = document.getElementById('lightbox');
    if (!lb) return;
    lb.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', _lbState.keyHandler);
    lb.removeEventListener('touchstart', lightboxTouchStart);
    lb.removeEventListener('touchend', lightboxTouchEnd);
}

function showLightboxIndex(i) {
    const lb = document.getElementById('lightbox');
    if (!lb) return;
    const imgEl = lb.querySelector('.lightbox-image');
    const caption = lb.querySelector('.lightbox-caption');
    _lbState.current = (i + _lbState.images.length) % _lbState.images.length;
    const src = _lbState.images[_lbState.current];
    imgEl.src = src || FALLBACK_IMAGE;
    imgEl.alt = `${_lbState.title} — image ${_lbState.current+1}`;
    caption.textContent = `${_lbState.title} (${_lbState.current+1}/${_lbState.images.length})`;
}

function lightboxPrev() { showLightboxIndex(_lbState.current - 1); }
function lightboxNext() { showLightboxIndex(_lbState.current + 1); }

function lightboxTouchStart(e) { _lbState.touchStartX = e.changedTouches[0].clientX; }
function lightboxTouchEnd(e) {
    const dx = e.changedTouches[0].clientX - _lbState.touchStartX;
    const threshold = 50;
    if (dx > threshold) lightboxPrev();
    else if (dx < -threshold) lightboxNext();
}

// Wire lightbox controls (buttons)
document.addEventListener('click', (e) => {
    const t = e.target;
    if (t.matches('.lightbox-close')) closeLightbox();
    if (t.matches('.lightbox-prev')) lightboxPrev();
    if (t.matches('.lightbox-next')) lightboxNext();
});
