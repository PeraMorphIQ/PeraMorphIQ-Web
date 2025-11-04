(function () {
  // Use local JSON files under /data/ instead of remote API
  async function fetchJSON(path) {
    const localMap = {
      news: '/data/news.json',
      publications: '/data/publication.json',
      blogs: '/data/blogs.json',
      projects: '/data/project.json',
      contributors: '/data/people.json'
    };

    const file = localMap[path];
    if (!file) throw new Error(`No local data mapping for path: ${path}`);

    const response = await fetch(file, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error(`Failed to load local data ${file}: ${response.status}`);
    return response.json();
  }

  // News section
  async function loadNews(selector){
    const container=document.querySelector(selector);

    if(!container) return;

    try{
        const res=await fetchJSON('news');
        const items=res.data;

        if(!Array.isArray(items) || items.length===0){
          container.innerHTML='<p class="text-center">No news available.</p>';
        }
        container.innerHTML=items.map(n=>
            `
                <div class="news-grid">
                  <img src="${n.image}" alt="news-img" class="news-img" />
                  <div class="news-content">
                      <h4 class="news-heading">${n.title}</h4>
                      <p class="news-year"> ${new Date(n.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</p>
                      <p class="news-brief-desc">${n.brief}</p>
                      <a href="./News/news.html" class="read-details">Read more<span>&rarr;</span></a>
                  </div>
                </div>
            `
        ).join('');

    }catch(e){
        console.log(e);
        container.innerHTML = '<p class="text-center">Failed to load news.</p>';
    }
  }

  // Publication Section
  async function loadPublications(selector){
    const container=document.querySelector(selector);

    if(!container) return;

    try{
        const res=await fetchJSON('publications');
        const items=res.data;

        if(!Array.isArray(items) || items.length===0){
          container.innerHTML='<p class="text-center">No Publications available.</p>';
        }
        container.innerHTML=items.map(n=>
            `
                <div class="publication-card">
                  <div class="pub-content">
                    <h4 class="pub-title">${n.title}</h4>
                    <p class="pub-authors"><strong>Authors:</strong> ${n.authors.map(a => a.name).join(', ')}</p>
                    <p class="pub-year"><strong>Journal:</strong> ${n.journal} (${n.year})</p>
                    <p class="pub-doi"><strong>DOI:</strong> <a href="https://doi.org/${n.doi}" target="_blank">${n.doi}</a></p>
                    <p class="pub-desc">${n.description}</p>
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


  // Blogs Section 
  async function loadBlogs(selector){
    const container=document.querySelector(selector);

    if(!container) return;

    try{
        const res=await fetchJSON('blogs');
        const items=res.data;

        if(!Array.isArray(items) || items.length===0){
          container.innerHTML='<p class="text-center">No Blogs available.</p>';
        }
        container.innerHTML=items.map(n=>
            `
                <div class="blog-card">
                  <div class="sub-blog-card">
                    <img
                      src="./img/blog.png"
                      alt="Neural Chip Research"
                      class="blog-img"
                    />
                    <div class="blog-content-header">
                      <h3 class="blog-title">${n.title}</h3>
                      <ul class="blog-meta">
                        <li>
                          <img
                            src="./img/blogs/writer.svg"
                            class="blogs-icons"
                          /><span>${n.author}</span>
                        </li>
                        <li>
                          <img
                            src="./img/blogs/calender.svg"
                            class="blogs-icons"/>
                            <span>${new Date(n.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                            </span>
                        </li>
                        <li>
                          <img
                            src="./img/blogs/clock.svg"
                            class="blogs-icons"
                          /><span> ${n.readTime} read</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <p class="blog-desc">${n.description}</p>
                    <div class="blog-read-more-btn">
                      <a href="${n.link}" class="btn-read-more">Read More</a>
                      <img src="./img/blogs/go.svg" class="read-more-icon" />
                    </div>
                  </div>
                </div>
            `
        ).join('');

    }catch(e){
        console.log(e);
        container.innerHTML = '<p class="text-center">Failed to load Blogs.</p>';
    }
  }

  // Projects
  async function loadProjects(selector){
    const container=document.querySelector(selector);

    if(!container) return;

    try{
        const res=await fetchJSON('projects');
        const items=res.data;

        if(!Array.isArray(items) || items.length===0){
          container.innerHTML='<p class="text-center">No Projects available.</p>';
        }
        container.innerHTML=items.map(n=>
            `
            <div class="project-box">
              <img src="${n.image}" alt="" class="project-img" />
              <div class="project-card-text-box">
                <h4 class="project-topics">${n.title}</h4>

                <div class="project-tags">
                  ${n.tags.map(tag=>`<span class="tag">${tag}</span>`).join('')}
                </div>

                <p class="project-detials">${n.details}</p>

                <div class="project-card-footer">
                  <div class="project-card-contributors">
                    
                    ${n.projectContributors.map(c=>`
                        <img
                          src="${c.image}"
                          alt="${c.name}"
                          class="project-card-member"
                        />
                    `).join('')} 
                  </div>

                  <a href="./project_folder/project.html" class="more-details"
                    >More details <span>&rarr;</span></a
                  >
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


  async function loadPeoples(teamSelector,supervisorSelector){
    const teamContainer=document.querySelector(teamSelector);
    const supContainer=document.querySelector(supervisorSelector);

    try{
        const res=await fetchJSON('contributors');
        const items=res.data;

        if(!Array.isArray(items) || items.length===0){
          teamContainer.innerHTML= '<p class="text-center">No team members available.</p>';
          teamContainer.innerHTML= '<p class="text-center">No supervisors available.</p>';
        }

        // Filter students and lectures
        const students= items.filter(c=>c.position.toLowerCase() === "student");
        const lectures=items.filter(c=>c.position.toLowerCase() === "lecture");

        //Render students
        teamContainer.innerHTML=students.map(n=>
            `
            <div class="contributor">
                <img
                  src="${n.image}"
                  alt="${n.name}"
                  class="contributor-img"
                />
                <div class="contributor-text">
                  <p class="contributor-name">${n.name}</p>
                  <p class="contributor-batch">${n.position}</p>
                </div>
            </div>
                
            `
        ).join('');

        //Render Lectors
        supContainer.innerHTML=lectures.map(n=>
            `
            <div class="contributor">
                <img
                  src="${n.image}"
                  alt="${n.name}"
                  class="contributor-img"
                />
                <div class="contributor-text">
                  <p class="contributor-name">${n.name}</p>
                  <p class="contributor-batch">${n.position}</p>
                </div>
            </div>
                
            `
        ).join('');

    }catch(e){
        console.log(e);
          teamContainer.innerHTML= '<p class="text-center">Failed to load team members.</p>';
          teamContainer.innerHTML= '<p class="text-center">Failed to load supervisors.</p>';
    }
  }

 // Expose to window
 window.NEURO_API = {
    loadNews,
    loadPublications,
    loadBlogs,
    loadProjects,
    loadPeoples
  };
})();
