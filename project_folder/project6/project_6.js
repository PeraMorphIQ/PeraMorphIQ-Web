// Project 6 - Memory and Power Optimization in Neuromorphic Accelerators
// Dynamic content loading and team member management

document.addEventListener('DOMContentLoaded', function() {
    // Import modules for team member fetching
    import('../../js/module/fetchTeamMembers.js')
        .then(module => {
            const { fetchTeamMembers } = module;
            
            // Load team members for project 6
            fetchTeamMembers('project6')
                .then(members => {
                    displayTeamMembers(members);
                })
                .catch(error => {
                    console.log('Using fallback team data for project 6');
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
            
            // Load supervisors for project 6
            fetchSupervisors('project6')
                .then(supervisors => {
                    displaySupervisors(supervisors);
                })
                .catch(error => {
                    console.log('Using fallback supervisor data for project 6');
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

// Fallback team members for project 6 (Memory and Power Optimization specialists)
function displayFallbackTeamMembers() {
    const fallbackMembers = [
        {
            name: 'Team Member 1',
            role: 'Memory Architecture Designer',
            department: 'Computer Engineering',
            image: '../../img/team/default-avatar.jpg'
        },
        {
            name: 'Team Member 2', 
            role: 'Power Optimization Engineer',
            department: 'Computer Engineering',
            image: '../../img/team/default-avatar.jpg'
        },
        {
            name: 'Team Member 3',
            role: 'Performance Analysis Specialist',
            department: 'Computer Engineering', 
            image: '../../img/team/default-avatar.jpg'
        },
        {
            name: 'Team Member 4',
            role: 'System Integration Engineer',
            department: 'Computer Engineering',
            image: '../../img/team/default-avatar.jpg'
        }
    ];
    
    displayTeamMembers(fallbackMembers);
}

// Fallback supervisors for project 6
function displayFallbackSupervisors() {
    const fallbackSupervisors = [
        {
            name: 'Dr. Memory Systems Expert',
            title: 'Senior Lecturer',
            department: 'Computer Engineering',
            image: '../../img/supervisors/default-avatar.jpg'
        },
        {
            name: 'Prof. Power Electronics',
            title: 'Professor',
            department: 'Computer Engineering',
            image: '../../img/supervisors/default-avatar.jpg'
        }
    ];
    
    displaySupervisors(fallbackSupervisors);
}

// Enhanced functionality for optimization-related animations
function animateOptimizationElements() {
    const optimizationElements = document.querySelectorAll('.tech-item');
    optimizationElements.forEach((element, index) => {
        if (element.textContent.includes('Optimization') || 
            element.textContent.includes('Memory') || 
            element.textContent.includes('Power') ||
            element.textContent.includes('Efficiency')) {
            element.style.animationDelay = `${index * 0.15}s`;
            element.classList.add('optimization-highlight');
            
            // Add special hover effects for optimization-related items
            element.addEventListener('mouseenter', function() {
                this.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
                this.style.color = 'white';
                this.style.transform = 'scale(1.08)';
            });
            
            element.addEventListener('mouseleave', function() {
                this.style.background = '';
                this.style.color = '';
                this.style.transform = 'scale(1)';
            });
        }
    });
}

// Performance metrics animation
function initPerformanceMetrics() {
    const performanceItems = document.querySelectorAll('.content-list li');
    performanceItems.forEach((item, index) => {
        if (item.textContent.includes('%') || 
            item.textContent.includes('milliwatt') || 
            item.textContent.includes('latency') ||
            item.textContent.includes('bandwidth')) {
            
            item.style.position = 'relative';
            item.style.paddingLeft = '2rem';
            
            // Add performance indicator
            const indicator = document.createElement('span');
            indicator.style.cssText = `
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                width: 12px;
                height: 12px;
                background: linear-gradient(45deg, #3498db, #2980b9);
                border-radius: 50%;
                animation: pulse 2s infinite;
            `;
            item.appendChild(indicator);
        }
    });
}

// Power consumption visualization
function createPowerVisualization() {
    const powerSections = document.querySelectorAll('.project-subtopics');
    powerSections.forEach(section => {
        if (section.textContent.includes('Power') || 
            section.textContent.includes('Memory') ||
            section.textContent.includes('Performance')) {
            
            section.style.position = 'relative';
            section.style.overflow = 'hidden';
            
            // Add animated background gradient
            const gradient = document.createElement('div');
            gradient.style.cssText = `
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(52, 152, 219, 0.1), transparent);
                animation: sweep 3s infinite;
                pointer-events: none;
            `;
            section.appendChild(gradient);
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

// Enhanced scroll reveal animations with optimization theme
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            
            // Special animation for optimization-related sections
            if (entry.target.querySelector('.project-subtopics')) {
                const title = entry.target.querySelector('.project-subtopics');
                if (title && (title.textContent.includes('Memory') || 
                             title.textContent.includes('Power') ||
                             title.textContent.includes('Optimization') ||
                             title.textContent.includes('Performance'))) {
                    entry.target.style.background = 'linear-gradient(135deg, transparent, rgba(46, 204, 113, 0.05))';
                    entry.target.style.borderLeft = '4px solid #2ecc71';
                    entry.target.style.paddingLeft = '1rem';
                    entry.target.style.borderRadius = '0 8px 8px 0';
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

    // Initialize optimization animations
    setTimeout(() => {
        animateOptimizationElements();
        initPerformanceMetrics();
        createPowerVisualization();
    }, 1000);
});

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { opacity: 1; transform: translateY(-50%) scale(1); }
        50% { opacity: 0.7; transform: translateY(-50%) scale(1.2); }
    }
    
    @keyframes sweep {
        0% { left: -100%; }
        50% { left: 100%; }
        100% { left: 100%; }
    }
    
    .optimization-highlight {
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(46, 204, 113, 0.2);
    }
    
    .tech-item:hover {
        box-shadow: 0 4px 15px rgba(46, 204, 113, 0.4) !important;
    }
`;
document.head.appendChild(style);