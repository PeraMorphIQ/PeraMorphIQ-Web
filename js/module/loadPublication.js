import { fetchJSON } from './fetchJson.js';

export async function loadPublications(selector,limit=3){
    const container=document.querySelector(selector);

    if(!container) return;

    try{
        const res=await fetchJSON('publications');
  let items=res.data;

        if(!Array.isArray(items) || items.length===0){
          container.innerHTML='<p class="text-center">No Publications available.</p>';
        }

        if(limit){
            items=items.slice(0,limit);
        }


        container.innerHTML=items.map(n=>
            `
                <div class="publication-card">
                  <div class="pub-content">
                    <h4 class="pub-title">${n.title}</h4>
                    <p class="pub-authors"><strong>Authors:</strong> ${n.authors.map(a => a.name).join(', ')}</p>
                    <p class="pub-year"><strong>Journal:</strong> ${n.journal} (${n.year})</p>
                    <p class="pub-doi"><strong>DOI:</strong> <a href="https://doi.org/${n.doi}" target="_blank">${n.doi}</a></p>
                    <a href="${n.link}" class="pub-link" target="_blank">View Paper<span>&rarr;</span></a>
                  </div>
                </div>
            `
        ).join('');

    }catch(e){
        console.log(e);
        container.innerHTML = '<p class="text-center">Failed to load Publications.</p>';
    }
  }