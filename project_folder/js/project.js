(async function () {
    const projectId = new URLSearchParams(window.location.search).get("id");

    if (!projectId) return;

    async function fetchProjectById(id) {
    // Load project data from site-root /_data/project.json so this works when page is in a subfolder
    const res = await fetch('/_data/project.json');
    if (!res.ok) throw new Error(`Failed to load /_data/project.json: ${res.status}`);
    const json = await res.json();
    const project = Array.isArray(json.data) ? json.data.find(p => p._id === id) : null;
    if (!project) throw new Error('Project not found');
    return project;
    }

    try {
    const project = await fetchProjectById(projectId);

    // Project Header
    document.querySelector("#project-title").textContent = project.title || '';
    document.querySelector("#project-subtitle").textContent = project.details || '';

    // Main Details
    const mainContainer = document.querySelector("#project-main-details");
    mainContainer.innerHTML = `
            <div class="project-overview">
            <h2 class="project-subtopics">Project overview</h2>
            <p class="project-decs">${project.overview || ''}</p>
            </div>

            <div class="Objectives">
            <h2 class="project-subtopics">Objectives</h2>
            <ul class="project-list">
                ${(project.objectives || []).map((obj) => `<li><ion-icon name="send" class="arrow-icon"></ion-icon><span>${obj}</span></li>`).join("")}
            </ul>
            </div>

            <div class="Objectives">
            <h2 class="project-subtopics">Key Outcomes</h2>
            <ul class="project-list">
                ${(project.outcomes || []).map((out) => `<li><ion-icon name="send" class="arrow-icon"></ion-icon><span>${out}</span></li>`).join("")}
            </ul>
            </div>

            <div class="Objectives">
            <h2 class="project-subtopics">Technical Approach</h2>
            <p class="project-decs">${project.technicalApproach || ''}</p>
            </div>
        `;

    // Side Details
    const sideContainer = document.querySelector("#project-side-details");
    sideContainer.innerHTML = `
            <div class="project-side-card"><h3>Project Status</h3><p>${project.status || ''}</p></div>
            <div class="project-side-card"><h3>Duration</h3><p>${project.duration || ''}</p></div>
            <div class="project-side-card"><h3>Funding</h3><p>${project.funding || ''}</p></div>
            <div class="project-side-card"><h3>Technologies</h3><ul class="tech-list">${(project.technologies || []).map((t) => `<li>${t}</li>`).join("")}</ul></div>
        `;

    // Contributors
    const contribContainer = document.querySelector("#project-contributors");

    async function fetchContributorDetails(eNumber) {
        // expect format like E/21/302 or E/21/087
        const m = String(eNumber).match(/^([A-Za-z])\/(\d{2})\/(\d+)$/);
        if (!m) return null;
        const batch = m[1] + m[2]; // E21
        const id = m[3]; // 302
        const url = `https://api.ce.pdn.ac.lk/people/v1/students/${batch}/${id}`;
        try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`CE API ${res.status}`);
        const json = await res.json();
        return {
            image: json.profile_image || '',
            name: json.full_name || json.name_with_initials || eNumber,
            position: json.batch || ''
        };
        } catch (e) {
        console.warn('Failed to load CE profile for', eNumber, e);
        return { image: '', name: eNumber, position: '' };
        }
    }

    async function renderContributors(list) {
        const resolved = await Promise.all((list || []).map(async (c) => {
        if (c.eNumber) {
            const details = await fetchContributorDetails(c.eNumber);
            return details;
        }
        // legacy shape
        return { image: c.image || '', name: c.name || c.displayName || '', position: c.position || '' };
        }));

        contribContainer.innerHTML = resolved.map((r) => `
            <div class="contributor">
            <img src="${r.image || './img/default.jpg'}" class="contributor-img" />
            <div class="contributor-text">
                <p class="contributor-name">${r.name}</p>
                <p class="contributor-batch">${r.position || ''}</p>
            </div>
            </div>
        `).join('');
    }

    // Render team members and supervisors
    async function renderAllContributors() {
        const contribContainer = document.querySelector("#project-contributors");
        
        // Process team members (students)
        const teamMemberPromises = (project.teamMembers || []).map(async (member) => {
            if (member.eNumber) {
                return await fetchContributorDetails(member.eNumber);
            }
            return { image: '', name: member.name || '', position: 'Student' };
        });

        // Process supervisors (staff)  
        const supervisorPromises = (project.supervisors || []).map(async (supervisor) => {
            if (supervisor.email) {
                // Fetch staff details using email
                const tag = supervisor.email.split('@')[0];
                const url = `https://api.ce.pdn.ac.lk/people/v1/staff/${tag}/`;
                
                try {
                    const res = await fetch(url);
                    if (!res.ok) throw new Error(`CE staff API ${res.status}`);
                    const json = await res.json();
                    return {
                        image: json.profile_image || json.photo || json.image || '',
                        name: json.full_name || json.name || supervisor.name || tag,
                        position: json.designation || json.title || 'Lecturer'
                    };
                } catch (e) {
                    console.warn('Failed to load CE staff profile for', supervisor.email, e);
                    return { image: '', name: supervisor.name || supervisor.email, position: 'Lecturer' };
                }
            }
            return { image: '', name: supervisor.name || '', position: 'Lecturer' };
        });

        const resolvedTeamMembers = await Promise.all(teamMemberPromises);
        const resolvedSupervisors = await Promise.all(supervisorPromises);
        
        // Combine all contributors
        const allContributors = [...resolvedTeamMembers, ...resolvedSupervisors];

        contribContainer.innerHTML = allContributors.map((contributor) => `
            <div class="contributor">
            <img src="${contributor.image || './img/default.jpg'}" class="contributor-img" />
            <div class="contributor-text">
                <p class="contributor-name">${contributor.name}</p>
                <p class="contributor-batch">${contributor.position || ''}</p>
            </div>
            </div>
        `).join('');
    }

    await renderAllContributors();

    // GitHub
    const githubContainer = document.querySelector("#project-github");
    githubContainer.innerHTML = (project.repositories || []).map((g) => {
        const imgSrc = g.type && g.type.toLowerCase() === "github" ? "./img/default.jpg" : "./img/icon_page.png";
        return `
            <div class="git-hub-repo">
            <img src="${imgSrc}" alt="${g.type} Repo" class="github-img" />
            <div class="repo-content">
                <h4 class="repo-title">${g.title}</h4>
                <p class="repo-desc">${g.description}</p>
                <a href="${g.link}" class="github-link" target="_blank">View on ${g.type} <span>&rarr;</span></a>
            </div>
            </div>
        `;
        }).join("");
    } catch (e) {
    console.error("Failed to load project", e);
    }
})();
const btnNav=document.querySelector('.btn-mobile-nav');
const header=document.querySelector('.header');
    btnNav.addEventListener('click',()=>{
    header.classList.toggle('nav-open');
})

window.addEventListener("scroll", function() {
    const header = document.querySelector(".header");
    const logo = header.querySelector("img.escal");
    if (window.scrollY > 50) {
    header.style.backgroundColor ="rgba(255, 255, 255, 0.98)";
    header.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.1)";
    logo.src = "./img/logo-3.png";
    logo.style.height="3.8rem" 
    } else {
    header.style.backgroundColor = "transparent";
    header.style.boxShadow = "none";
    logo.src = "./img/logo.png";
    logo.style.height="3.2rem" 
    }
});


