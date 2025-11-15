(async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const repoFullName = urlParams.get("repo");
    const projectId = urlParams.get("id");

    // Helper function to decode project title from repository name
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

    // Handle GitHub repo or legacy project ID
    if (repoFullName) {
        await loadGitHubProject(repoFullName);
    } else if (projectId) {
        await loadLegacyProject(projectId);
    }

    async function loadGitHubProject(fullName) {
        try {
            // Fetch repository details
            const repoResponse = await fetch(`https://api.github.com/repos/${fullName}`);
            if (!repoResponse.ok) throw new Error(`GitHub API ${repoResponse.status}`);
            const repo = await repoResponse.json();

            // Fetch README
            let readmeContent = '';
            let parsedReadme = null;
            try {
                const readmeResponse = await fetch(`https://api.github.com/repos/${fullName}/readme`, {
                    headers: { 'Accept': 'application/vnd.github.v3.raw' }
                });
                if (readmeResponse.ok) {
                    readmeContent = await readmeResponse.text();
                    parsedReadme = parseReadme(readmeContent);
                }
            } catch (e) {
                console.warn('Failed to fetch README:', e);
            }

            // Fetch contributors
            let contributors = [];
            try {
                const contribResponse = await fetch(`https://api.github.com/repos/${fullName}/contributors`);
                if (contribResponse.ok) {
                    contributors = await contribResponse.json();
                }
            } catch (e) {
                console.warn('Failed to fetch contributors:', e);
            }

            // Fetch languages
            let languages = [];
            try {
                const langResponse = await fetch(`https://api.github.com/repos/${fullName}/languages`);
                if (langResponse.ok) {
                    const langData = await langResponse.json();
                    languages = Object.keys(langData);
                }
            } catch (e) {
                console.warn('Failed to fetch languages:', e);
            }

            // Project Header
            document.querySelector("#project-title").textContent = parsedReadme?.title || decodeProjectTitle(repo.name) || '';
            document.querySelector("#project-subtitle").textContent = ''; // No subtitle needed

            // Main Details
            const mainContainer = document.querySelector("#project-main-details");
            let mainContent = '';

            // Description/Overview
            if (parsedReadme?.description) {
                mainContent += `
                    <div class="project-overview">
                        <h2 class="project-subtopics">Description</h2>
                        <p class="project-decs">${parsedReadme.description}</p>
                    </div>
                `;
            }

            // Additional sections from README
            if (parsedReadme?.sections && parsedReadme.sections.length > 0) {
                parsedReadme.sections.forEach(section => {
                    mainContent += `
                        <div class="project-overview">
                            <h2 class="project-subtopics">${section.title}</h2>
                            <div class="project-decs">${formatMarkdown(section.content)}</div>
                        </div>
                    `;
                });
            }

            mainContainer.innerHTML = mainContent;

            // Side Details - Only Technologies
            const sideContainer = document.querySelector("#project-side-details");
            
            let sideContent = `
                <div class="project-side-card">
                    <h3>Technologies</h3>
                    <ul class="tech-list">
                        ${languages.length > 0 ? languages.map(lang => `<li>${lang}</li>`).join('') : '<li>Not specified</li>'}
                    </ul>
                </div>
            `;

            sideContainer.innerHTML = sideContent;

            // Team Members and Supervisors
            const contribContainer = document.querySelector("#project-contributors");
            
            // Use parsed README data if available
            if (parsedReadme?.teamMembers && parsedReadme.teamMembers.length > 0) {
                // Render Team Members from README (without title)
                let teamMembersHTML = '';
                
                for (const member of parsedReadme.teamMembers) {
                    let memberData = {
                        image: '',
                        name: member.name,
                        position: 'Student'
                    };

                    // Try to fetch student details from CE API
                    if (member.eNumber) {
                        try {
                            const m = member.eNumber.match(/^([A-Za-z])\/(\d{2})\/(\d+)$/);
                            if (m) {
                                const batch = m[1] + m[2];
                                const id = m[3];
                                const url = `https://api.ce.pdn.ac.lk/people/v1/students/${batch}/${id}`;
                                const res = await fetch(url);
                                if (res.ok) {
                                    const json = await res.json();
                                    memberData.image = json.profile_image || '';
                                    memberData.name = json.full_name || json.name_with_initials || member.name;
                                    memberData.position = `${member.eNumber}`;
                                }
                            }
                        } catch (e) {
                            console.warn('Failed to fetch student details:', e);
                        }
                    }

                    teamMembersHTML += `
                        <div class="contributor">
                            <img src="${memberData.image || './img/default.jpg'}" alt="${memberData.name}" class="contributor-img" />
                            <div class="contributor-text">
                                <p class="contributor-name">${memberData.name}</p>
                                <p class="contributor-batch">${memberData.position}</p>
                            </div>
                        </div>
                    `;
                }

                contribContainer.innerHTML = teamMembersHTML;

                // Supervisors Section
                if (parsedReadme.supervisors && parsedReadme.supervisors.length > 0) {
                    const supervisorSection = document.createElement('div');
                    supervisorSection.style.gridColumn = '1/-1';
                    supervisorSection.style.marginTop = '3rem';
                    
                    let supervisorsHTML = '<div class="container grid grid--5--cols">';
                    
                    for (const supervisor of parsedReadme.supervisors) {
                        let supervisorData = {
                            image: '',
                            name: supervisor.name,
                            position: 'Supervisor'
                        };

                        // Try to fetch staff details from CE API
                        if (supervisor.email) {
                            try {
                                const tag = supervisor.email.split('@')[0];
                                const url = `https://api.ce.pdn.ac.lk/people/v1/staff/${tag}/`;
                                const res = await fetch(url);
                                if (res.ok) {
                                    const json = await res.json();
                                    supervisorData.image = json.profile_image || json.photo || json.image || '';
                                    supervisorData.name = json.full_name || json.name || supervisor.name;
                                    supervisorData.position = json.designation || json.title || 'Supervisor';
                                }
                            } catch (e) {
                                console.warn('Failed to fetch supervisor details:', e);
                            }
                        }

                        supervisorsHTML += `
                            <div class="contributor">
                                <img src="${supervisorData.image || './img/default.jpg'}" alt="${supervisorData.name}" class="contributor-img" />
                                <div class="contributor-text">
                                    <p class="contributor-name">${supervisorData.name}</p>
                                    <p class="contributor-batch">${supervisorData.position}</p>
                                </div>
                            </div>
                        `;
                    }
                    
                    supervisorsHTML += '</div>';
                    supervisorSection.innerHTML = supervisorsHTML;
                    contribContainer.parentElement.appendChild(supervisorSection);
                }
            } else {
                contribContainer.innerHTML = '<p class="text-center">No team information available.</p>';
            }

            // GitHub
            const githubContainer = document.querySelector("#project-github");
            githubContainer.innerHTML = `
                <div class="git-hub-repo">
                    <div class="repo-content">
                        <h4 class="repo-title">${decodeProjectTitle(repo.name)}</h4>
                        <a href="${repo.html_url}" class="github-link" target="_blank">View on GitHub <span>&rarr;</span></a>
                    </div>
                </div>
            `;

        } catch (e) {
            console.error("Failed to load GitHub project", e);
            document.querySelector("#project-title").textContent = 'Error loading project';
            document.querySelector("#project-subtitle").textContent = 'Failed to fetch project details from GitHub';
        }
    }

    function parseReadme(markdown) {
        const lines = markdown.split('\n');
        const result = {
            title: '',
            description: '',
            teamMembers: [],
            supervisors: [],
            links: [],
            sections: []
        };

        let currentSection = null;
        let currentContent = [];
        let inTeamMembers = false;
        let inSupervisors = false;
        let inLinks = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Skip comment lines
            if (line.startsWith('[//]:')) continue;

            // Extract main title (first # heading)
            if (!result.title && line.match(/^#\s+(.+)$/)) {
                result.title = line.replace(/^#\s+/, '');
                continue;
            }

            // Check for Description section
            if (line.match(/^##\s+Description$/i)) {
                if (currentSection) {
                    result.sections.push({ title: currentSection, content: currentContent.join('\n') });
                }
                currentSection = null;
                currentContent = [];
                inTeamMembers = false;
                inSupervisors = false;
                inLinks = false;
                // Next non-empty line will be description
                for (let j = i + 1; j < lines.length; j++) {
                    const nextLine = lines[j].trim();
                    if (nextLine && !nextLine.startsWith('#') && !nextLine.startsWith('[//]:')) {
                        result.description = nextLine;
                        i = j;
                        break;
                    }
                }
                continue;
            }

            // Check for Team Members section
            if (line.match(/^##\s+Team Members?$/i)) {
                if (currentSection) {
                    result.sections.push({ title: currentSection, content: currentContent.join('\n') });
                }
                currentSection = null;
                currentContent = [];
                inTeamMembers = true;
                inSupervisors = false;
                inLinks = false;
                continue;
            }

            // Check for Supervisors section
            if (line.match(/^##\s+Supervisors?$/i)) {
                if (currentSection) {
                    result.sections.push({ title: currentSection, content: currentContent.join('\n') });
                }
                currentSection = null;
                currentContent = [];
                inTeamMembers = false;
                inSupervisors = true;
                inLinks = false;
                continue;
            }

            // Check for Links section
            if (line.match(/^##\s+Links?$/i)) {
                if (currentSection) {
                    result.sections.push({ title: currentSection, content: currentContent.join('\n') });
                }
                currentSection = null;
                currentContent = [];
                inTeamMembers = false;
                inSupervisors = false;
                inLinks = true;
                continue;
            }

            // Parse team members
            if (inTeamMembers && line.match(/^\d+\.\s+/)) {
                const match = line.match(/^\d+\.\s+([A-Z]\/\d{2}\/\d+)\s+(.+?)\s+\[\[/);
                if (match) {
                    const eNumber = match[1];
                    const name = match[2];
                    const emailMatch = line.match(/mailto:([^\]]+)/);
                    const email = emailMatch ? emailMatch[1] : '';
                    result.teamMembers.push({ eNumber, name, email });
                }
                continue;
            }

            // Parse supervisors
            if (inSupervisors && line.match(/^\d+\.\s+/)) {
                const match = line.match(/^\d+\.\s+(.+?)\s+\[\[/);
                if (match) {
                    const name = match[1];
                    const emailMatch = line.match(/mailto:([^\]]+)/);
                    const email = emailMatch ? emailMatch[1] : '';
                    result.supervisors.push({ name, email });
                }
                continue;
            }

            // Parse links
            if (inLinks && line.match(/^\d+\.\s+/)) {
                const match = line.match(/^\d+\.\s+\[(.+?)\]\((.+?)\)/);
                if (match) {
                    result.links.push({ title: match[1], url: match[2] });
                }
                continue;
            }

            // Handle other sections
            if (line.match(/^##\s+(.+)$/)) {
                if (currentSection) {
                    result.sections.push({ title: currentSection, content: currentContent.join('\n') });
                }
                currentSection = line.replace(/^##\s+/, '');
                currentContent = [];
                inTeamMembers = false;
                inSupervisors = false;
                inLinks = false;
                continue;
            }

            // Add content to current section
            if (currentSection && line && !line.startsWith('#')) {
                currentContent.push(line);
            }
        }

        // Add last section if exists
        if (currentSection && currentContent.length > 0) {
            result.sections.push({ title: currentSection, content: currentContent.join('\n') });
        }

        return result;
    }

    function formatMarkdown(markdown) {
        // Basic markdown to HTML conversion (you might want to use a proper markdown library)
        let html = markdown
            .replace(/```[\s\S]*?```/g, match => `<pre><code>${match.slice(3, -3)}</code></pre>`)
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
            .replace(/\n/g, '<br>');
        return html;
    }

    async function loadLegacyProject(projectId) {
        async function fetchProjectById(id) {
            // Load project data from site-root ./data/project.json using relative path
            const res = await fetch('../data/project.json');
            if (!res.ok) throw new Error(`Failed to load ../data/project.json: ${res.status}`);
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


