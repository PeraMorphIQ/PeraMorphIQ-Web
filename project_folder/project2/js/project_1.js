import { fetchTeamMembers } from '../../../js/module/fetchTeamMembers.js';
import { fetchSupervisors } from '../../../js/module/fetchSupervisors.js';

// Project team data
const teamMembersData = [
    { eNumber: "E/17/018", name: "Balasuriya I.S." },
    { eNumber: "E/17/154", name: "Karunanayake A.I." },
    { eNumber: "E/17/286", name: "Rathnayaka R.M.T.N.K." }
];

const supervisorsData = [
    { email: "isurunawinne@eng.pdn.ac.lk", name: "Dr. Isuru Nawinne" },
    { email: "mahanamaw@eng.pdn.ac.lk", name: "Dr. Mahanama Wickramasinghe" },
    { email: "roshanr@eng.pdn.ac.lk", name: "Prof. Roshan Ragel" },
    { email: "isurud@ee.pdn.ac.lk", name: "Dr. Isuru Dasanayake" }
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
                <img src="../../../img/default.jpg" alt="E/17/018" class="contributor-img" />
                <div class="contributor-text">
                    <p class="contributor-name">Balasuriya I.S.</p>
                    <p class="contributor-batch">E/17/018</p>
                </div>
            </div>
            <div class="contributor">
                <img src="../../../img/default.jpg" alt="E/17/154" class="contributor-img" />
                <div class="contributor-text">
                    <p class="contributor-name">Karunanayake A.I.</p>
                    <p class="contributor-batch">E/17/154</p>
                </div>
            </div>
            <div class="contributor">
                <img src="../../../img/default.jpg" alt="E/17/286" class="contributor-img" />
                <div class="contributor-text">
                    <p class="contributor-name">Rathnayaka R.M.T.N.K.</p>
                    <p class="contributor-batch">E/17/286</p>
                </div>
            </div>
            
            <!-- Supervisors -->
            <div class="contributor">
                <img src="../../../img/default.jpg" alt="Dr. Isuru Nawinne" class="contributor-img" />
                <div class="contributor-text">
                    <p class="contributor-name">Dr. Isuru Nawinne</p>
                    <p class="contributor-batch">Supervisor</p>
                </div>
            </div>
            <div class="contributor">
                <img src="../../../img/default.jpg" alt="Dr. Mahanama Wickramasinghe" class="contributor-img" />
                <div class="contributor-text">
                    <p class="contributor-name">Dr. Mahanama Wickramasinghe</p>
                    <p class="contributor-batch">Supervisor</p>
                </div>
            </div>
            <div class="contributor">
                <img src="../../../img/default.jpg" alt="Prof. Roshan Ragel" class="contributor-img" />
                <div class="contributor-text">
                    <p class="contributor-name">Prof. Roshan Ragel</p>
                    <p class="contributor-batch">Supervisor</p>
                </div>
            </div>
            <div class="contributor">
                <img src="../../../img/default.jpg" alt="Dr. Isuru Dasanayake" class="contributor-img" />
                <div class="contributor-text">
                    <p class="contributor-name">Dr. Isuru Dasanayake</p>
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