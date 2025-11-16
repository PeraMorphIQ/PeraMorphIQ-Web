import { fetchJSON } from './fetchJSON.js';
import {fetchTeamMembers} from './fetchTeamMembers.js';
import {fetchSupervisors} from './fetchSupervisors.js';


export async function loadPeoples(teamSelector, supervisorSelector){
    const teamContainer = document.querySelector(teamSelector);
    const supContainer = document.querySelector(supervisorSelector);
    
    try{
        // Load projects to get teamMembers and supervisors
        const pres = await fetchJSON('people');
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
                    });
                }
            });
            
            // Process supervisors (email based)
            (project.supervisors || []).forEach(supervisor => {
                if(supervisor.email && !supervisorMap.has(supervisor.email)) {
                    supervisorMap.set(supervisor.email, {
                        email: supervisor.email,
                        name:supervisor.name,
                        profile_page:supervisor.profile_page
                    });
                }
            });
        });
        

        allTeamMembers = Array.from(teamMemberMap.values());
        allSupervisors = Array.from(supervisorMap.values());

        // Resolve team members 
        const resolvedTeamMembers = await fetchTeamMembers(allTeamMembers);


        // Resolve supervisors 
        const resolvedSupervisors = await fetchSupervisors(allSupervisors);


        // Render team members
        if(resolvedTeamMembers.length > 0) {
            teamContainer.innerHTML = resolvedTeamMembers.map(member => `
                <div class="contributor">
                    <img src="${member.image || './img/default.jpg'}" alt="${member.name}" class="contributor-img" />
                    <div class="contributor-text">
                        <p class="contributor-name">${member.name}</p>
                        <p class="contributor-batch">${member.position}</p>
                        ${member.profile_page ? `<a class="profile-btn" href="${member.profile_page}" target="_blank" rel="noopener">Profile</a>` : `<button class="profile-btn disabled" disabled>Profile</button>`}
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
                        ${supervisor.profile_page ? `<a class="profile-btn" href="${supervisor.profile_page}" target="_blank" rel="noopener">Profile</a>` : `<button class="profile-btn disabled" disabled>Profile</button>`}
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