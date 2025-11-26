import { fetchJSON } from './fetchJSON.js';

export async function loadProjects(selector,limit=6){
    const container=document.querySelector(selector);

    if(!container) return;

    try{
        // Fetch projects from local JSON file
        const response = await fetch('./data/project.json');
        if(!response.ok) throw new Error(`Failed to load project data ${response.status}`);
        
        const jsonData = await response.json();
        let items = Array.isArray(jsonData.data) ? jsonData.data : jsonData;

        if(!Array.isArray(items) || items.length===0){
          container.innerHTML='<p class="text-center">No Projects available.</p>';
          return;
        }

        if(limit){
            items=items.slice(0,limit);
        }
        
        container.innerHTML=items.map(project=>
            `
            <div class="project-box">
              <img src="${project.image || './data/img/project/default.jpeg'}" 
                  alt="${project.title || project.name}" 
                  class="project-img" />
                  
              <div class="project-card-text-box">
                <h4 class="project-topics">${project.name}</h4>

                <div class="project-tags">
                  ${project.topics && project.topics.length > 0 ? project.topics.map(tech=>`<span class="tag">${tech}</span>`).join('') : ''}
                </div>

                <p class="project-detials">${project.description || 'No description available'}</p>

                <div class="project-card-footer">
                  <a href="./project_folder/${project._id}/${project._id.replace('project', 'project_')}.html" class="more-details" aria-label="More details about ${project.title || project.name}">
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
