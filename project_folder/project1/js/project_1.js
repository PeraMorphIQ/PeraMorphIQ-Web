import { fetchTeamMembers } from '../../../js/module/fetchTeamMembers.js';
import { fetchSupervisors } from '../../../js/module/fetchSupervisors.js';

// Project team data
const teamMembersData = [
    { eNumber: "E/18/379", name: "Thamish Wanduragala" },
    { eNumber: "E/18/147", name: "Saadia Jameel" }
];

const supervisorsData = [
    { email: "roshanr@eng.pdn.ac.lk", name: "Prof. Roshan G. Ragel" },
    { email: "isurunawinne@eng.pdn.ac.lk", name: "Dr. Isuru Nawinne" }
];

// Function to render team members
function renderTeamMembers(teamMembers) {
    return teamMembers.map(member => `
        <div class="contributor">
            <img src="${member.image || '../../../img/default.jpg'}" alt="${member.name}" class="contributor-img" />
            <div class="contributor-text">
                <p class="contributor-name">${member.name}</p>
                <p class="contributor-batch">${member.eNumber || member.position || 'Team Member'}</p>
            </div>
        </div>
    `).join('');
}

// Function to render supervisors
function renderSupervisors(supervisors) {
    return supervisors.map(supervisor => `
        <div class="contributor">
            <img src="${supervisor.image || '../../../img/default.jpg'}" alt="${supervisor.name}" class="contributor-img" />
            <div class="contributor-text">
                <p class="contributor-name">${supervisor.name}</p>
                <p class="contributor-batch">${supervisor.position || 'Supervisor'}</p>
            </div>
        </div>
    `).join('');
}

// Function to load team data
async function loadTeamData() {
    const container = document.querySelector("#project-contributors");
    
    if (!container) {
        console.error("Contributors container not found");
        return;
    }

    // Show loading state
    container.innerHTML = `
        <div class="contributor">
            <div class="loading-placeholder">Loading team data...</div>
        </div>
    `;

    try {
        // Fetch team members and supervisors in parallel
        const [teamMembers, supervisors] = await Promise.all([
            fetchTeamMembers(teamMembersData),
            fetchSupervisors(supervisorsData)
        ]);

        console.log('Fetched team members:', teamMembers);
        console.log('Fetched supervisors:', supervisors);

        // Combine and render all contributors
        const teamHTML = renderTeamMembers(teamMembers);
        const supervisorHTML = renderSupervisors(supervisors);
        
        container.innerHTML = teamHTML + supervisorHTML;

    } catch (error) {
        console.error('Error fetching team data:', error);
        
        // Fallback to static data
        const fallbackHTML = `
            <!-- Team Members -->
            <div class="contributor">
                <img src="../../../img/default.jpg" alt="E/18/379" class="contributor-img" />
                <div class="contributor-text">
                    <p class="contributor-name">Thamish Wanduragala</p>
                    <p class="contributor-batch">E/18/379</p>
                </div>
            </div>
            <div class="contributor">
                <img src="../../../img/default.jpg" alt="E/18/147" class="contributor-img" />
                <div class="contributor-text">
                    <p class="contributor-name">Saadia Jameel</p>
                    <p class="contributor-batch">E/18/147</p>
                </div>
            </div>
            
            <!-- Supervisors -->
            <div class="contributor">
                <img src="../../../img/default.jpg" alt="Prof. Roshan G. Ragel" class="contributor-img" />
                <div class="contributor-text">
                    <p class="contributor-name">Prof. Roshan G. Ragel</p>
                    <p class="contributor-batch">Supervisor</p>
                </div>
            </div>
            <div class="contributor">
                <img src="../../../img/default.jpg" alt="Dr. Isuru Nawinne" class="contributor-img" />
                <div class="contributor-text">
                    <p class="contributor-name">Dr. Isuru Nawinne</p>
                    <p class="contributor-batch">Supervisor</p>
                </div>
            </div>
        `;
        
        container.innerHTML = fallbackHTML;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadTeamData();
});

// Export for potential external use
export { loadTeamData };