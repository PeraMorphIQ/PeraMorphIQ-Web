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
            // Set global context for image resolution
            window.currentRepoFullName = fullName;
            
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

            // Abstract/Description with enhanced styling
            if (parsedReadme?.description) {
                mainContent += `
                    <div class="project-overview">
                        <h2 class="project-subtopics">Abstract</h2>
                        <div class="project-description">${formatMarkdown(parsedReadme.description)}</div>
                    </div>
                `;
            }

            // Table of Contents if sections exist
            if (parsedReadme?.sections && parsedReadme.sections.length > 0) {
                const tocItems = parsedReadme.sections
                    .filter(section => section.title && section.title !== 'Table of content')
                    .map(section => {
                        const anchor = section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                        return `<li><a href="#${anchor}" class="toc-link">${section.title}</a></li>`;
                    }).join('');
                
                if (tocItems) {
                    mainContent += `
                        <div class="project-overview">
                            <h2 class="project-subtopics">Table of Contents</h2>
                            <ul class="table-of-contents">${tocItems}</ul>
                        </div>
                    `;
                }
            }

            // Additional sections from README with enhanced formatting
            if (parsedReadme?.sections && parsedReadme.sections.length > 0) {
                parsedReadme.sections.forEach(section => {
                    if (section.title && section.content && section.title !== 'Table of content') {
                        const anchor = section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                        mainContent += `
                            <div class="project-overview" id="${anchor}">
                                <h2 class="project-subtopics">${section.title}</h2>
                                <div class="section-content">${formatMarkdown(section.content)}</div>
                            </div>
                        `;
                    }
                });
            }

            // Links section if available
            if (parsedReadme?.links && parsedReadme.links.length > 0) {
                const linksHTML = parsedReadme.links.map(link => 
                    `<li><a href="${link.url}" target="_blank" class="resource-link">${link.title} <span class="external-icon">↗</span></a></li>`
                ).join('');
                
                mainContent += `
                    <div class="project-overview">
                        <h2 class="project-subtopics">Resources & Links</h2>
                        <ul class="resource-links">${linksHTML}</ul>
                    </div>
                `;
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

                    // Separate CE and external supervisors
                    const ceSupervisors = parsedReadme.supervisors.filter(s => !s.isExternal && s.email);
                    const externalSupervisors = parsedReadme.supervisors.filter(s => s.isExternal || !s.email);

                    let supervisorsHTML = '<div class="container grid grid--5--cols">';
                    
                    // Handle CE supervisors with API lookup
                    if (ceSupervisors.length > 0) {
                        const supInputs = ceSupervisors.map(s => ({ email: s.email, name: s.name, profile_page: s.profile_page }));
                        const resolvedSup = await fetchSupervisors(supInputs);
                        
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
                    }
                    
                    // Handle external supervisors without API lookup
                    externalSupervisors.forEach(supervisor => {
                        supervisorsHTML += `
                            <div class="contributor">
                                <img src="./img/default.jpg" alt="${supervisor.name}" class="contributor-img" />
                                <div class="contributor-text">
                                    <p class="contributor-name">${supervisor.name}</p>
                                    <p class="contributor-batch">External Supervisor</p>
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

            // Check for Abstract/Description section
            if (line.match(/^##\s+(Abstract|Description)$/i)) {
                if (currentSection) {
                    result.sections.push({ title: currentSection, content: currentContent.join('\n') });
                }
                currentSection = null;
                currentContent = [];
                inTeamMembers = false;
                inSupervisors = false;
                inLinks = false;
                
                // Collect content for Abstract/Description
                let abstractContent = [];
                for (let j = i + 1; j < lines.length; j++) {
                    const nextLine = lines[j].trim();
                    if (nextLine.startsWith('##')) break; // Stop at next section
                    if (nextLine && !nextLine.startsWith('[//]:')) {
                        abstractContent.push(nextLine);
                    }
                }
                result.description = abstractContent.join(' ');
                
                // Find the end of this section
                let endIndex = i + 1;
                while (endIndex < lines.length && !lines[endIndex].trim().startsWith('##')) {
                    endIndex++;
                }
                i = endIndex - 1;
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
                    
                    // Only add supervisors from CE department to avoid API errors
                    if (email && email.includes('@eng.pdn.ac.lk')) {
                        result.supervisors.push({ name, email });
                    } else {
                        // For non-CE supervisors, just store the name
                        result.supervisors.push({ name, email: '', isExternal: true });
                    }
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

            // Handle other sections (capture everything including subsections)
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

            // Add content to current section (including subsections and all content)
            if (currentSection && !inTeamMembers && !inSupervisors && !inLinks) {
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
        if (!markdown) return '';
        
        // Basic markdown to HTML conversion with enhanced features
        let html = markdown
            // Code blocks
            .replace(/```[\s\S]*?```/g, match => {
                const codeContent = match.slice(3, -3).trim();
                return `<pre><code class="code-block">${codeContent}</code></pre>`;
            })
            // Inline code
            .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
            // Headers (process in order from largest to smallest)
            .replace(/^#### (.*$)/gim, '<h4 class="section-h4">$1</h4>')
            .replace(/^### (.*$)/gim, '<h3 class="section-h3">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="section-h2">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="section-h1">$1</h1>')
            // Images with better handling and GitHub raw content support
            .replace(/!\[([^\]]*)\]\(([^)]+)(?:\s+"([^"]*)")?\)/g, (match, alt, src, title) => {
                // Handle different image path scenarios
                let imageSrc = src;
                
                // If we're in a GitHub project context, try to resolve images from GitHub
                if (window.currentRepoFullName && (src.startsWith('./') || src.startsWith('images/'))) {
                    // Convert relative paths to GitHub raw content URLs
                    const cleanPath = src.replace(/^\.\//, '');
                    imageSrc = `https://raw.githubusercontent.com/${window.currentRepoFullName}/main/${cleanPath}`;
                }
                // If it's an absolute path or external URL, keep as is
                else if (src.startsWith('http') || src.startsWith('/')) {
                    imageSrc = src;
                }
                // For other relative paths in local context
                else {
                    imageSrc = `./img/${src.replace(/^\.\//, '')}`;
                }

                const titleAttr = title ? ` title="${title}"` : '';
                const fallbackAlt = alt || title || 'Project Diagram';
                
                return `<div class="image-container">
                    <img src="${imageSrc}" 
                         alt="${fallbackAlt}" 
                         class="content-image" 
                         loading="lazy"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
                         onload="this.nextElementSibling.style.display='none';"${titleAttr} />
                    <div class="image-placeholder" style="display: none; background: #f8f9fa; border: 2px dashed #dee2e6; padding: 3rem; text-align: center; border-radius: 0.8rem;">
                        <div class="placeholder-icon" style="font-size: 3rem; color: #6c757d; margin-bottom: 1rem;">📊</div>
                        <p class="placeholder-text" style="color: #6c757d; font-size: 1.4rem; margin: 0;">
                            <strong>${fallbackAlt}</strong><br>
                            <small>Source: ${src}</small>
                        </p>
                        <small style="color: #adb5bd; font-size: 1.2rem;">
                            Image could not be loaded from repository
                        </small>
                    </div>
                    ${alt || title ? `<p class="image-caption">${alt || title}</p>` : ''}
                </div>`;
            })
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="content-link">$1 <span class="external-icon">↗</span></a>')
            // Bold text
            .replace(/\*\*([^*]+)\*\*/g, '<strong class="bold-text">$1</strong>')
            // Italic text
            .replace(/\*([^*]+)\*/g, '<em class="italic-text">$1</em>')
            // Unordered lists (multi-level support)
            .replace(/^(\s*)-\s+(.+)$/gm, (match, spaces, content) => {
                const level = Math.floor(spaces.length / 2);
                return `<li class="list-item list-level-${level}">${content}</li>`;
            })
            // Ordered lists
            .replace(/^(\s*)\d+\.\s+(.+)$/gm, (match, spaces, content) => {
                const level = Math.floor(spaces.length / 2);
                return `<li class="numbered-item list-level-${level}">${content}</li>`;
            })
            // Horizontal rules
            .replace(/^---+$/gm, '<hr class="section-divider" />')
            // Tables (basic support)
            .replace(/\|(.+)\|/g, (match, content) => {
                const cells = content.split('|').map(cell => cell.trim());
                if (cells.some(cell => cell.match(/^:?-+:?$/))) {
                    return ''; // Skip separator rows
                }
                const cellsHTML = cells.map(cell => `<td class="table-cell">${cell}</td>`).join('');
                return `<tr class="table-row">${cellsHTML}</tr>`;
            })
            // Paragraphs (convert double line breaks to paragraphs)
            .replace(/\n\n/g, '</p><p class="content-paragraph">')
            // Single line breaks
            .replace(/\n/g, '<br />');

        // Wrap in paragraph tags if not already wrapped
        if (!html.startsWith('<')) {
            html = `<p class="content-paragraph">${html}</p>`;
        }

        // Wrap list items in proper ul/ol tags
        html = html.replace(/(<li class="list-item[^"]*">[^<]+<\/li>)/g, '<ul class="content-list">$1</ul>');
        html = html.replace(/(<li class="numbered-item[^"]*">[^<]+<\/li>)/g, '<ol class="numbered-list">$1</ol>');
        
        // Wrap table rows in table tags
        if (html.includes('<tr class="table-row">')) {
            html = html.replace(/(<tr class="table-row">.*?<\/tr>)/gs, '<table class="content-table"><tbody>$1</tbody></table>');
        }

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

// Image enlargement functionality
function toggleImageEnlargement(img) {
  if (img.classList.contains('enlarged')) {
    img.classList.remove('enlarged');
    document.body.style.overflow = 'auto';
    
    // Remove backdrop
    const backdrop = document.querySelector('.image-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
  } else {
    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'image-backdrop';
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.8);
      z-index: 999;
      backdrop-filter: blur(5px);
    `;
    
    backdrop.addEventListener('click', () => toggleImageEnlargement(img));
    document.body.appendChild(backdrop);
    
    img.classList.add('enlarged');
    document.body.style.overflow = 'hidden';
  }
}

// Add click handlers to existing images
document.addEventListener('DOMContentLoaded', function() {
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('content-image')) {
      e.preventDefault();
      toggleImageEnlargement(e.target);
    }
  });
  
  // Close on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const enlargedImg = document.querySelector('.content-image.enlarged');
      if (enlargedImg) {
        toggleImageEnlargement(enlargedImg);
      }
    }
  });
});


