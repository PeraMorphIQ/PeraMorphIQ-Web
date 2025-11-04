(function () {
  async function fetchJSON(path) {
    const localMap = {
      news: './data/news.json',
      publications: './data/publication.json',
      blogs: './data/blogs.json',
      projects: './data/project.json',
      contributors: './data/people.json'
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
        const items=res.data.slice(0,3);

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
                      <a href="./News/news.html?id=${n._id}" class="read-details">Read more<span>&rarr;</span></a>
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
        const items=res.data.slice(0,3);

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
        const items=res.data.slice(0,2);

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
        const items=res.data.slice(0,6);

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

                  <a href="./project_folder/project.html?id=${n._id}" class="more-details"
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
        // Prefer aggregating contributors from projects (so people section shows project contributors)
        let items = [];
        try{
          const pres = await fetchJSON('projects');
          const projects = Array.isArray(pres.data) ? pres.data : [];
          const map = new Map();
          projects.forEach(p=>{
            (p.projectContributors || []).forEach(c=>{
              // support multiple contributor shapes:
              // - { eNumber: 'E/21/302' }
              // - { email: 'asithab@eng.pdn.ac.lk', position: 'Lecture' }
              // - { image: '...', name: '...' }
              if(c.eNumber){
                if(!map.has(c.eNumber)) map.set(c.eNumber, { eNumber: c.eNumber });
              } else if(c.email){
                if(!map.has(c.email)) map.set(c.email, { email: c.email, position: c.position || 'Lecture' });
              } else if(c.image || c.name){
                const key = `${c.name || ''}::${c.image || ''}`;
                if(!map.has(key)) map.set(key, { image: c.image, name: c.name, position: c.position });
              }
            })
          });
          items = Array.from(map.values());

          // If no contributors found in projects, fall back to a dedicated contributors file
          if(items.length === 0){
            try{
              const cres = await fetchJSON('contributors');
              items = Array.isArray(cres.data) ? cres.data : [];
            }catch(e){
              console.warn('No contributors file found either', e);
            }
          }
        }catch(err){
          console.warn('Failed to load projects for contributors aggregation, trying contributors file', err);
          try{
            const cres = await fetchJSON('contributors');
            items = Array.isArray(cres.data) ? cres.data : [];
          }catch(e){
            console.warn('No contributors file found', e);
            items = [];
          }
        }

        if(!Array.isArray(items) || items.length===0){
          teamContainer.innerHTML= '<p class="text-center">No team members available.</p>';
          supContainer.innerHTML= '<p class="text-center">No supervisors available.</p>';
          return;
        }

        // Resolve any eNumber entries by fetching CE people API (parallel, unique)
        const eNumbers = Array.from(new Set(items.filter(i=>i.eNumber).map(i=>i.eNumber)));
        const profileByEN = {};
        // Also resolve any staff entries provided as emails (e.g. asithab@eng.pdn.ac.lk)
        const emails = Array.from(new Set(items.filter(i=>i.email).map(i=>i.email)));
        const profileByEmail = {};

        await Promise.all(emails.map(async (emailAddr)=>{
          try{
            const tag = String(emailAddr).split('@')[0];
            const url = `https://api.ce.pdn.ac.lk/people/v1/staff/${tag}/`;
            const r = await fetch(url);
            if(!r.ok) throw new Error(`CE staff API ${r.status}`);
            const json = await r.json();
            profileByEmail[emailAddr] = {
              image: json.profile_image || json.photo || json.image || '',
              name: json.full_name || json.name || tag,
              position: json.designation || json.title || 'Lecture'
            };
          }catch(e){
            console.warn('Failed CE staff lookup for', emailAddr, e);
            profileByEmail[emailAddr] = { image:'', name: emailAddr, position: 'Lecture' };
          }
        }));

        await Promise.all(eNumbers.map(async (eNum)=>{
          try{
            const m = String(eNum).match(/^([A-Za-z])\/(\d{2})\/(\d+)$/);
            if(!m) throw new Error('Invalid eNumber');
            const batch = m[1]+m[2];
            const id = m[3];
            const url = `https://api.ce.pdn.ac.lk/people/v1/students/${batch}/${id}`;
            const r = await fetch(url);
            if(!r.ok) throw new Error(`CE API ${r.status}`);
            const json = await r.json();
            profileByEN[eNum] = {
              image: json.profile_image || '',
              name: json.full_name || json.name_with_initials || eNum,
              position: 'Student'
            };
          }catch(e){
            console.warn('Failed CE lookup for', eNum, e);
            profileByEN[eNum] = { image: '', name: eNum, position: '' };
          }
        }));

        // Build final contributor list: resolved profiles + others
        const finalContribs = items.map(i=> {
          if(i.eNumber) return profileByEN[i.eNumber] || { image:'', name: i.eNumber, position: '' };
          if(i.email) return profileByEmail[i.email] || { image:'', name: i.email, position: 'Lecture' };
          return { image: i.image || '', name: i.name || '', position: i.position || '' };
        });

        // Render all contributors into the team container (per request)
        teamContainer.innerHTML = finalContribs.map(n=>`
          <div class="contributor">
              <img src="${n.image || './img/default.jpg'}" alt="${n.name}" class="contributor-img" />
              <div class="contributor-text">
                <p class="contributor-name">${n.name}</p>
                <p class="contributor-batch">${n.position || ''}</p>
              </div>
          </div>
        `).join('');

        // Supervisors: try to show those explicitly marked as lecture/lecturer
        const supervisors = finalContribs.filter(c=> (c.position || '').toString().toLowerCase().includes('lect'));
        if(supervisors.length){
          supContainer.innerHTML = supervisors.map(n=>`
            <div class="contributor">
                <img src="${n.image || './img/default.jpg'}" alt="${n.name}" class="contributor-img" />
                <div class="contributor-text">
                  <p class="contributor-name">${n.name}</p>
                  <p class="contributor-batch">${n.position || ''}</p>
                </div>
            </div>
          `).join('');
        } else {
          supContainer.innerHTML = '<p class="text-center">No supervisors available.</p>';
        }

    }catch(e){
        console.log(e);
        teamContainer.innerHTML= '<p class="text-center">Failed to load team members.</p>';
        supContainer.innerHTML= '<p class="text-center">Failed to load supervisors.</p>';
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
