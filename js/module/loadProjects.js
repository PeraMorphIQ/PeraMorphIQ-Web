import { fetchJSON } from './fetchJson.js';

function decodeProjectTitle(repoName) {
    // Match pattern: exx-xxx-title-with-dashes
    const match = repoName.match(/^e\d+-[^-]+-(.+)$/);
    if (match) {
      // Extract the title part and replace dashes with spaces
      return match[1].split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
    // If pattern doesn't match, return original name
    return repoName;
}

export async function loadProjects(selector,limit=6){
    const container=document.querySelector(selector);

    if(!container) return;

    try{
        // Fetch repositories from GitHub API
        const response = await fetch('https://api.github.com/orgs/PeraMorphIQ/repos');
        if(!response.ok) throw new Error(`GitHub API ${response.status}`);
        
        let items = await response.json();

        if(!Array.isArray(items) || items.length===0){
          container.innerHTML='<p class="text-center">No Projects available.</p>';
          return;
        }

        // Filter repositories to only include those with "Neuromorphic" in the name
        items = items.filter(repo => repo.name.toLowerCase().includes('neuromorphic'));

        if(items.length === 0){
          container.innerHTML='<p class="text-center">No Neuromorphic Projects available.</p>';
          return;
        }

        if(limit){
            items=items.slice(0,limit);
        }
        
        container.innerHTML=items.map(n=>
            `
            <div class="project-box">
              <img src="${n.owner.avatar_url}" alt="${n.name}" class="project-img" loading="lazy" decoding="async" />
              <div class="project-card-text-box">
                <h4 class="project-topics">${decodeProjectTitle(n.name)}</h4>

                <div class="project-tags">
                  ${n.topics && n.topics.length > 0 ? n.topics.map(tag=>`<span class="tag">${tag}</span>`).join('') : ''}
                </div>

                <p class="project-detials">${n.description || 'No description available'}</p>

                <div class="project-card-footer">
                  <a href="./project_folder/project.html?repo=${n.full_name}" class="more-details" aria-label="More details about ${n.name}">
                    More details <span aria-hidden="true">&rarr;</span>
                  </a>
                </div>
              </div>
            </div> 
            `
        ).join('');

    }catch(e){
        console.log(e);
        container.innerHTML = '<p class="text-center">Failed to load Projects.</p>';
    }
}
