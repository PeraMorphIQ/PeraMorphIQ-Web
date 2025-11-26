// Project 5 - On-Chip Learning for Spiking Neural Networks
// Dynamic content loading and team member management

document.addEventListener('DOMContentLoaded', function() {
    // Import modules for team member fetching
    import('../../js/module/fetchTeamMembers.js')
        .then(module => {
            const { fetchTeamMembers } = module;
            
            // Load team members for project 5
            fetchTeamMembers('project5')
                .then(members => {
                    displayTeamMembers(members);
                })
                .catch(error => {
                    console.log('Using fallback team data for project 5');
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
            
            // Load supervisors for project 5
            fetchSupervisors('project5')
                .then(supervisors => {
                    displaySupervisors(supervisors);
                })
                .catch(error => {
                    console.log('Using fallback supervisor data for project 5');
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

// Fallback team members for project 5 (On-Chip Learning specialists)
function displayFallbackTeamMembers() {
    const fallbackMembers = [
        {
            name: 'Team Member 1',
            role: 'Learning Algorithms Specialist',
            department: 'Computer Engineering',
            image: '../../img/team/default-avatar.jpg'
        },
        {
            name: 'Team Member 2', 
            role: 'Plasticity Hardware Designer',
            department: 'Computer Engineering',
            image: '../../img/team/default-avatar.jpg'
        },
        {
            name: 'Team Member 3',
            role: 'STDP Implementation Engineer',
            department: 'Computer Engineering', 
            image: '../../img/team/default-avatar.jpg'
        },
        {
            name: 'Team Member 4',
            role: 'Neural Network Researcher',
            department: 'Computer Engineering',
            image: '../../img/team/default-avatar.jpg'
        }
    ];
    
    displayTeamMembers(fallbackMembers);
}

// Fallback supervisors for project 5
function displayFallbackSupervisors() {
    const fallbackSupervisors = [
        {
            name: 'Dr. Neural Learning Specialist',
            title: 'Senior Lecturer',
            department: 'Computer Engineering',
            image: '../../img/supervisors/default-avatar.jpg'
        },
        {
            name: 'Prof. Neuromorphic Systems',
            title: 'Professor',
            department: 'Computer Engineering',
            image: '../../img/supervisors/default-avatar.jpg'
        }
    ];
    
    displaySupervisors(fallbackSupervisors);
}

// Enhanced functionality for learning-related animations
function animateLearningElements() {
    const learningElements = document.querySelectorAll('.tech-item');
    learningElements.forEach((element, index) => {
        if (element.textContent.includes('Learning') || 
            element.textContent.includes('Neural') || 
            element.textContent.includes('Plasticity')) {
            element.style.animationDelay = `${index * 0.1}s`;
            element.classList.add('learning-highlight');
        }
    });
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

// Add scroll reveal animations with learning theme
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            
            // Special animation for learning-related sections
            if (entry.target.querySelector('.project-subtopics')) {
                const title = entry.target.querySelector('.project-subtopics');
                if (title && (title.textContent.includes('Learning') || 
                             title.textContent.includes('Mechanisms') ||
                             title.textContent.includes('Implementation'))) {
                    entry.target.style.background = 'linear-gradient(45deg, transparent, rgba(74, 144, 226, 0.05))';
                    entry.target.style.borderLeft = '4px solid #4a90e2';
                    entry.target.style.paddingLeft = '1rem';
                }
            }
        }
    });
}, observerOptions);

// Observe all sections for animation
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('.project-overview, .technologies-section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease, background 0.3s ease';
        observer.observe(section);
    });

    // Initialize learning animations
    setTimeout(animateLearningElements, 1000);
});

// Interactive learning mechanism demonstration
function initLearningDemo() {
    const techItems = document.querySelectorAll('.tech-item');
    techItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            if (this.textContent.includes('Learning') || 
                this.textContent.includes('STDP') || 
                this.textContent.includes('Plasticity')) {
                this.style.transform = 'scale(1.05)';
                this.style.boxShadow = '0 4px 15px rgba(74, 144, 226, 0.3)';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '';
        });
    });
}

// Initialize interactive elements when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initLearningDemo, 1500);
});
