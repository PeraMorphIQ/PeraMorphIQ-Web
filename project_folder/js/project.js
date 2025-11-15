import { fetchTeamMembers } from '../../js/module/fetchTeamMembers.js';
import { fetchSupervisors } from '../../js/module/fetchSupervisors.js';

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
            // Check if repo name contains "Neuromorphic" before fetching
            const repoName = fullName.split('/')[1] || '';
            if (!repoName.toLowerCase().includes('neuromorphic')) {
                document.querySelector("#project-title").textContent = 'Repository Not Available';
                document.querySelector("#project-subtitle").textContent = '';
                document.querySelector("#project-main-details").innerHTML = `
                    <div class="project-overview">
                        <h2 class="project-subtopics">Information</h2>
                        <p class="project-decs">This repository is not available for display. Only neuromorphic-related projects are shown.</p>
                    </div>
                `;
                document.querySelector("#project-side-details").innerHTML = '';
                document.querySelector("#project-contributors").innerHTML = '';
                document.querySelector("#project-github").innerHTML = '';
                return;
            }

            // Fetch repository details
            const repoResponse = await fetch(`https://api.github.com/repos/${fullName}`);
            if (!repoResponse.ok) {
                // If GitHub API fails (403/rate limit), show a minimal fallback
                document.querySelector("#project-title").textContent = fullName.split('/')[1] || 'Project';
                document.querySelector("#project-subtitle").textContent = '';
                document.querySelector("#project-main-details").innerHTML = `
                    <div class="project-overview">
                        <h2 class="project-subtopics">Information</h2>
                        <p class="project-decs">Project details are currently unavailable due to GitHub API limits. Please visit the repository directly for more information.</p>
                    </div>
                `;
                document.querySelector("#project-side-details").innerHTML = `
                    <div class="project-side-card">
                        <h3>Repository</h3>
                        <p><a href="https://github.com/${fullName}" target="_blank">View on GitHub</a></p>
                    </div>
                `;
                document.querySelector("#project-contributors").innerHTML = '<p class="text-center">Team information unavailable.</p>';
                document.querySelector("#project-github").innerHTML = `
                    <div class="git-hub-repo">
                        <img src="./img/default.jpg" alt="GitHub Repo" class="github-img" />
                        <div class="repo-content">
                            <h4 class="repo-title">${fullName}</h4>
                            <p class="repo-desc">Repository details unavailable due to API limits.</p>
                            <a href="https://github.com/${fullName}" class="github-link" target="_blank">View on GitHub <span>&rarr;</span></a>
                        </div>
                    </div>
                `;
                return;
            }
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

            // Use parsed README data if available and resolve via shared helpers
            if (parsedReadme?.teamMembers && parsedReadme.teamMembers.length > 0) {
                // Build inputs for team members (eNumber is primary key)
                const teamInputs = parsedReadme.teamMembers.map(m => ({ eNumber: m.eNumber, name: m.name }));
                const resolvedTeam = teamInputs.length ? await fetchTeamMembers(teamInputs) : [];

                // Render Team Members
                const teamMembersHTML = resolvedTeam.map(member => `
                    <div class="contributor">
                        <img src="${member.image || './img/default.jpg'}" alt="${member.name}" class="contributor-img" />
                        <div class="contributor-text">
                            <p class="contributor-name">${member.name}</p>
                            <p class="contributor-batch">${member.position}</p>
                        </div>
                    </div>
                `).join('');

                contribContainer.innerHTML = teamMembersHTML;

                // Supervisors (resolve using shared supervisor helper)
                if (parsedReadme.supervisors && parsedReadme.supervisors.length > 0) {
                    const supervisorSection = document.createElement('div');
                    supervisorSection.style.gridColumn = '1/-1';
                    supervisorSection.style.marginTop = '3rem';

                    const supInputs = parsedReadme.supervisors.map(s => ({ email: s.email, name: s.name, profile_page: s.profile_page }));
                    const resolvedSup = supInputs.length ? await fetchSupervisors(supInputs) : [];

                    let supervisorsHTML = '<div class="container grid grid--5--cols">';
                    resolvedSup.forEach(supervisorData => {
                        supervisorsHTML += `
                            <div class="contributor">
                                <img src="${supervisorData.image || './img/default.jpg'}" alt="${supervisorData.name}" class="contributor-img" />
                                <div class="contributor-text">
                                    <p class="contributor-name">${supervisorData.name}</p>
                                    <p class="contributor-batch">${supervisorData.position}</p>
                                </div>
                            </div>
                        `;
                    });
                    supervisorsHTML += '</div>';

                    supervisorSection.innerHTML = supervisorsHTML;
                    contribContainer.parentElement.appendChild(supervisorSection);
                }
            } else {
                contribContainer.innerHTML = '<p class="text-center">No team information available.</p>';
            }

            // GitHub - render main repository card similar to legacy layout
            const githubContainer = document.querySelector("#project-github");
            githubContainer.innerHTML = `
                <div class="git-hub-repo">
                    <img src="./img/default.jpg" alt="${repo.name} Repo" class="github-img" />
                    <div class="repo-content">
                        <h4 class="repo-title">${decodeProjectTitle(repo.name)}</h4>
                        <p class="repo-desc">${repo.description || ''}</p>
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

            // Filter out projects that don't contain "Neuromorphic" in the title
            if (!project.title.toLowerCase().includes('neuromorphic')) {
                document.querySelector("#project-title").textContent = 'Project Not Available';
                document.querySelector("#project-subtitle").textContent = '';
                document.querySelector("#project-main-details").innerHTML = `
                    <div class="project-overview">
                        <h2 class="project-subtopics">Information</h2>
                        <p class="project-decs">This project is not available for display. Only neuromorphic-related projects are shown.</p>
                    </div>
                `;
                document.querySelector("#project-side-details").innerHTML = '';
                document.querySelector("#project-contributors").innerHTML = '';
                document.querySelector("#project-github").innerHTML = '';
                return;
            }

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
                // Separate eNumber-based entries and legacy entries
                const eEntries = (list || []).filter(c => c.eNumber).map(c => ({ eNumber: c.eNumber, name: c.name }));
                const legacy = (list || []).filter(c => !c.eNumber).map(c => ({ image: c.image || '', name: c.name || c.displayName || '', position: c.position || '' }));

                const resolvedE = eEntries.length ? await fetchTeamMembers(eEntries) : [];

                // Create a combined array preserving original order where possible
                const resolvedMap = new Map(resolvedE.map(r => [r.eNumber, r]));
                const finalList = (list || []).map(c => {
                    if (c.eNumber) return resolvedMap.get(c.eNumber) || { image: '', name: c.eNumber, position: '' };
                    return legacy.shift();
                });

                contribContainer.innerHTML = finalList.map((r) => `
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
                
                // Resolve team members and supervisors using shared helpers
                const teamInputs = (project.teamMembers || []).map(m => ({ eNumber: m.eNumber, name: m.name }));
                const supInputs = (project.supervisors || []).map(s => ({ email: s.email, name: s.name }));

                const resolvedTeamMembers = teamInputs.length ? await fetchTeamMembers(teamInputs) : [];
                const resolvedSupervisors = supInputs.length ? await fetchSupervisors(supInputs) : [];

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


