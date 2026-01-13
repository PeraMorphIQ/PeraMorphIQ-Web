import { fetchJSON } from './fetchJSON.js';
import {fetchTeamMembers} from './fetchTeamMembers.js';
import {fetchSupervisors} from './fetchSupervisors.js';


export async function loadPeoples(undergraduateSelector, supervisorSelector, graduateSelector = null, alumniSelector = null){
    const undergraduateContainer = document.querySelector(undergraduateSelector);
    const supContainer = document.querySelector(supervisorSelector);
    const graduateContainer = graduateSelector ? document.querySelector(graduateSelector) : null;
    const alumniContainer = alumniSelector ? document.querySelector(alumniSelector) : null;
    
    try{
        // Load people data with new structure
        const pres = await fetchJSON('people');
        const data = Array.isArray(pres.data) && pres.data.length > 0 ? pres.data[0] : {};
        
        // Extract categorized researchers and supervisors
        const graduateResearchers = data["Graduate Researchers"] || [];
        const undergraduateResearchers = data["Undergraduate Researchs"] || [];
        const alumniResearchers = data["Alumni Researchers"] || [];
        const supervisors = data["supervisors"] || [];
        
        // Resolve each category using fetchTeamMembers
        const resolvedGraduate = graduateResearchers.length > 0 ? await fetchTeamMembers(graduateResearchers) : [];
        const resolvedUndergraduate = undergraduateResearchers.length > 0 ? await fetchTeamMembers(undergraduateResearchers) : [];
        const resolvedAlumni = alumniResearchers.length > 0 ? await fetchTeamMembers(alumniResearchers) : [];
        
        // Resolve supervisors
        const resolvedSupervisors = supervisors.length > 0 ? await fetchSupervisors(supervisors) : [];

        // Render undergraduate researchers
        if(resolvedUndergraduate.length > 0) {
            undergraduateContainer.innerHTML = resolvedUndergraduate.map(member => `
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
            undergraduateContainer.innerHTML = '<p class="text-center">No undergraduate researchers available.</p>';
        }

        // Render graduate researchers
        if(graduateContainer) {
            if(resolvedGraduate.length > 0) {
                graduateContainer.innerHTML = resolvedGraduate.map(member => `
                    <div class="contributor">
                        <img src="${member.image || './img/default.jpg'}" alt="${member.name}" class="contributor-img" />
                        <div class="contributor-text">
                            <p class="contributor-name">${member.name}</p>
                            <p class="contributor-batch">${member.current_affiliation || member.position}</p>
                            ${member.profile_page ? `<a class="profile-btn" href="${member.profile_page}" target="_blank" rel="noopener">Profile</a>` : `<button class="profile-btn disabled" disabled>Profile</button>`}
                        </div>
                    </div>
                `).join('');
            } else {
                graduateContainer.innerHTML = '<p class="text-center">No graduate researchers available.</p>';
            }
        }

        // Render alumni researchers
        if(alumniContainer) {
            if(resolvedAlumni.length > 0) {
                alumniContainer.innerHTML = resolvedAlumni.map(member => `
                    <div class="contributor">
                        <img src="${member.image || './img/default.jpg'}" alt="${member.name}" class="contributor-img" />
                        <div class="contributor-text">
                            <p class="contributor-name">${member.name}</p>
                            <p class="contributor-batch">${member.current_affiliation || member.position}</p>
                            ${member.profile_page ? `<a class="profile-btn" href="${member.profile_page}" target="_blank" rel="noopener">Profile</a>` : `<button class="profile-btn disabled" disabled>Profile</button>`}
                        </div>
                    </div>
                `).join('');
            } else {
                alumniContainer.innerHTML = '<p class="text-center">No alumni researchers available.</p>';
            }
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
        undergraduateContainer.innerHTML = '<p class="text-center">Failed to load undergraduate researchers.</p>';
        supContainer.innerHTML = '<p class="text-center">Failed to load supervisors.</p>';
        if(graduateContainer) graduateContainer.innerHTML = '<p class="text-center">Failed to load graduate researchers.</p>';
        if(alumniContainer) alumniContainer.innerHTML = '<p class="text-center">Failed to load alumni researchers.</p>';
    }
}