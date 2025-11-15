import { fetchJSON } from './fetchJson.js';

export async function loadPeoples(teamSelector, supervisorSelector){
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