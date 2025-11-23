import { fetchJSON } from './fetchJSON.js';

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
              <img src="./img/project/pro.jpeg" 
                  data-repo="${n.full_name}"
                  data-avatar="${n.owner.avatar_url}"
                  alt="${n.name}" 
                  class="project-img" 
                  loading="lazy" 
                  decoding="async"
                  onerror="this.src='./img/project/pro.jpg'" />
                  
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

        // After setting innerHTML, try to load repository images
        setTimeout(() => {
            const projectImages = container.querySelectorAll('.project-img[data-repo]');
            projectImages.forEach(img => {
                tryLoadProjectImage(img);
            });
        }, 100);

    }catch(e){
        console.log(e);
        container.innerHTML = '<p class="text-center">Failed to load Projects.</p>';
    }
}

// Function to try loading project images with multiple fallbacks
async function tryLoadProjectImage(img) {
    const repoName = img.getAttribute('data-repo');
    const avatarUrl = img.getAttribute('data-avatar');
    if (!repoName) return;
    
    const imagePaths = [
        `https://raw.githubusercontent.com/${repoName}/main/images/main.jpg`,
        `https://raw.githubusercontent.com/${repoName}/main/images/main.png`,
    ];
    
    for (const imagePath of imagePaths) {
        try {
            const response = await fetch(imagePath, { method: 'HEAD' });
            if (response.ok) {
                img.src = imagePath;
                return; // Success, exit the loop
            }
        } catch (error) {
            console.log(`Failed to load: ${imagePath}`);
        }
    }
    
    // If project images fail, try the avatar
    if (avatarUrl) {
        try {
            const response = await fetch(avatarUrl, { method: 'HEAD' });
            if (response.ok) {
                img.src = avatarUrl;
                return;
            }
        } catch (error) {
            console.log(`Failed to load avatar: ${avatarUrl}`);
        }
    }
    
    // If everything fails, the onerror in HTML will handle the final fallback
    console.log(`No image found for ${repoName}, using default fallback`);
}
