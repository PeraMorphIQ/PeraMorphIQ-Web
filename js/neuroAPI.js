import { loadNews } from './module/loadNews.js';
import { loadPublications } from './module/loadPublication.js';
import { loadBlogs } from './module/loadBlogs.js';
import { loadProjects } from './module/loadProjects.js';
import { loadPeoples } from './module/loadPeople.js';

window.NEURO_API = {
    loadNews,
    loadPublications,
    loadBlogs,
    loadProjects,
    loadPeoples
};
