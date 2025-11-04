(function () {


  async function fetchJSON(path) {

    const localMap = {
      news: '../data/news.json',
      publications: '../data/publication.json',
      blogs: '../data/blogs.json',
      projects: '../data/project.json',
      contributors: '../data/people.json'
    };

    const file = localMap[path];
    if (!file) throw new Error(`No local data mapping for path: ${path}`);
    
    // fetch the data
    const response = await fetch(file);
    return response.json();
  }




  // ----------------------------------- News section ---------------------------------------------------------
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




  // ----------------------- Publication Section -----------------------------------------------------------
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




  // ------------------------------- Blogs Section  ---------------------------------
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



  // -------------------------------------Projects------------------------------------------
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




  async function loadPeoples(teamSelector, supervisorSelector){
    const teamContainer = document.querySelector(teamSelector);
    const supContainer = document.querySelector(supervisorSelector);
    
    try{
        // Load projects to get teamMembers and supervisors
        const pres = await fetchJSON('projects');
        const projects = Array.isArray(pres.data) ? pres.data : [];
        
        let allTeamMembers = [];
        let allSupervisors = [];
        
        // Collect unique team members and supervisors from all projects
        const teamMemberMap = new Map();
        const supervisorMap = new Map();
        
        projects.forEach(project => {
            // Process team members (eNumber based)
            (project.teamMembers || []).forEach(member => {
                if(member.eNumber && !teamMemberMap.has(member.eNumber)) {
                    teamMemberMap.set(member.eNumber, {
                        eNumber: member.eNumber,
                        name: member.name || ''
                    });
                }
            });
            
            // Process supervisors (email based)
            (project.supervisors || []).forEach(supervisor => {
                if(supervisor.email && !supervisorMap.has(supervisor.email)) {
                    supervisorMap.set(supervisor.email, {
                        name: supervisor.name || '',
                        email: supervisor.email
                    });
                }
            });
        });
        
        allTeamMembers = Array.from(teamMemberMap.values());
        allSupervisors = Array.from(supervisorMap.values());

        // Resolve team members (students) via CE API
        const resolvedTeamMembers = await Promise.all(allTeamMembers.map(async (member) => {
            try {
                const m = String(member.eNumber).match(/^([A-Za-z])\/(\d{2})\/(\d+)$/);
                if(!m) throw new Error('Invalid eNumber format');
                
                const batch = m[1] + m[2];
                const id = m[3];
                const url = `https://api.ce.pdn.ac.lk/people/v1/students/${batch}/${id}`;
                
                const response = await fetch(url);
                if(!response.ok) throw new Error(`CE API ${response.status}`);
                
                const json = await response.json();
                return {
                    image: json.profile_image || '',
                    name: json.full_name || json.name_with_initials || member.name || member.eNumber,
                    position: 'Student',
                    eNumber: member.eNumber
                };
            } catch(e) {
                console.warn('Failed CE lookup for', member.eNumber, e);
                return {
                    image: '',
                    name: member.name || member.eNumber,
                    position: 'Student',
                    eNumber: member.eNumber
                };
            }
        }));

        // Resolve supervisors (staff) via CE API
        const resolvedSupervisors = await Promise.all(allSupervisors.map(async (supervisor) => {
            try {
                const tag = supervisor.email.split('@')[0];
                const url = `https://api.ce.pdn.ac.lk/people/v1/staff/${tag}/`;
                
                const response = await fetch(url);
                if(!response.ok) throw new Error(`CE staff API ${response.status}`);
                
                const json = await response.json();
                return {
                    image: json.profile_image || json.photo || json.image || '',
                    name: json.full_name || json.name || supervisor.name || tag,
                    position: json.designation || json.title || 'Lecturer',
                    email: supervisor.email
                };
            } catch(e) {
                console.warn('Failed CE staff lookup for', supervisor.email, e);
                return {
                    image: '',
                    name: supervisor.name || supervisor.email,
                    position: 'Lecturer',
                    email: supervisor.email
                };
            }
        }));

        // Render team members
        if(resolvedTeamMembers.length > 0) {
            teamContainer.innerHTML = resolvedTeamMembers.map(member => `
                <div class="contributor">
                    <img src="${member.image || './img/default.jpg'}" alt="${member.name}" class="contributor-img" />
                    <div class="contributor-text">
                        <p class="contributor-name">${member.name}</p>
                        <p class="contributor-batch">${member.position}</p>
                    </div>
                </div>
            `).join('');
        } else {
            teamContainer.innerHTML = '<p class="text-center">No team members available.</p>';
        }

        // Render supervisors
        if(resolvedSupervisors.length > 0) {
            supContainer.innerHTML = resolvedSupervisors.map(supervisor => `
                <div class="contributor">
                    <img src="${supervisor.image || './img/default.jpg'}" alt="${supervisor.name}" class="contributor-img" />
                    <div class="contributor-text">
                        <p class="contributor-name">${supervisor.name}</p>
                        <p class="contributor-batch">${supervisor.position}</p>
                    </div>
                </div>
            `).join('');
        } else {
            supContainer.innerHTML = '<p class="text-center">No supervisors available.</p>';
        }

    } catch(e) {
        console.error('Failed to load people:', e);
        teamContainer.innerHTML = '<p class="text-center">Failed to load team members.</p>';
        supContainer.innerHTML = '<p class="text-center">Failed to load supervisors.</p>';
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
