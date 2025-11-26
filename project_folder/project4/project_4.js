// Project 4 - Configurable Neuromorphic Accelerator for Embedded Applications
// Dynamic content loading and team member management

document.addEventListener('DOMContentLoaded', function() {
    // Import modules for team member fetching
    import('../../js/module/fetchTeamMembers.js')
        .then(module => {
            const { fetchTeamMembers } = module;
            
            // Load team members for project 4
            fetchTeamMembers('project4')
                .then(members => {
                    displayTeamMembers(members);
                })
                .catch(error => {
                    console.log('Using fallback team data for project 4');
                    displayFallbackTeamMembers();
                });
        })
        .catch(error => {
            console.log('Module import failed, using fallback team data');
            displayFallbackTeamMembers();
        });

    // Import modules for supervisor fetching
    import('../../js/module/fetchSupervisors.js')
        .then(module => {
            const { fetchSupervisors } = module;
            
            // Load supervisors for project 4
            fetchSupervisors('project4')
                .then(supervisors => {
                    displaySupervisors(supervisors);
                })
                .catch(error => {
                    console.log('Using fallback supervisor data for project 4');
                    displayFallbackSupervisors();
                });
        })
        .catch(error => {
            console.log('Module import failed, using fallback supervisor data');
            displayFallbackSupervisors();
        });
});

// Display team members
function displayTeamMembers(members) {
    const container = document.getElementById('team-container');
    if (!container) return;

    container.innerHTML = members.map(member => `
        <div class="team-member">
            <img src="${member.image || '../../img/team/default-avatar.jpg'}" 
                 alt="${member.name}" 
                 class="member-photo"
                 onerror="this.src='../../img/team/default-avatar.jpg'">
            <div class="member-info">
                <h4 class="member-name">${member.name}</h4>
                <p class="member-role">${member.role || 'Team Member'}</p>
                <p class="member-dept">${member.department || 'Computer Engineering'}</p>
            </div>
        </div>
    `).join('');
}

// Display supervisors
function displaySupervisors(supervisors) {
    const container = document.getElementById('supervisors-container');
    if (!container) return;

    container.innerHTML = supervisors.map(supervisor => `
        <div class="supervisor">
            <img src="${supervisor.image || '../../img/supervisors/default-avatar.jpg'}" 
                 alt="${supervisor.name}" 
                 class="supervisor-photo"
                 onerror="this.src='../../img/supervisors/default-avatar.jpg'">
            <div class="supervisor-info">
                <h4 class="supervisor-name">${supervisor.name}</h4>
                <p class="supervisor-title">${supervisor.title || 'Supervisor'}</p>
                <p class="supervisor-dept">${supervisor.department || 'Computer Engineering'}</p>
            </div>
        </div>
    `).join('');
}

// Fallback team members for project 4
function displayFallbackTeamMembers() {
    const fallbackMembers = [
        {
            name: 'Team Member 1',
            role: 'Hardware Engineer',
            department: 'Computer Engineering',
            image: '../../img/team/default-avatar.jpg'
        },
        {
            name: 'Team Member 2', 
            role: 'Systems Architect',
            department: 'Computer Engineering',
            image: '../../img/team/default-avatar.jpg'
        },
        {
            name: 'Team Member 3',
            role: 'Verification Engineer',
            department: 'Computer Engineering', 
            image: '../../img/team/default-avatar.jpg'
        },
        {
            name: 'Team Member 4',
            role: 'Software Developer',
            department: 'Computer Engineering',
            image: '../../img/team/default-avatar.jpg'
        }
    ];
    
    displayTeamMembers(fallbackMembers);
}

// Fallback supervisors for project 4
function displayFallbackSupervisors() {
    const fallbackSupervisors = [
        {
            name: 'Dr. Supervisor 1',
            title: 'Senior Lecturer',
            department: 'Computer Engineering',
            image: '../../img/supervisors/default-avatar.jpg'
        },
        {
            name: 'Dr. Supervisor 2',
            title: 'Professor',
            department: 'Computer Engineering',
            image: '../../img/supervisors/default-avatar.jpg'
        }
    ];
    
    displaySupervisors(fallbackSupervisors);
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll reveal animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections for animation
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('.project-overview, .technologies-section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
});