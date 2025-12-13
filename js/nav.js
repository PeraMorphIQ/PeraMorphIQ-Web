const btnNav=document.querySelector('.btn-mobile-nav');
const header=document.querySelector('.header');
const btnScrollTo=document.querySelector('.btn--scroll-to');
const about=document.querySelector('#about');

// See more button - only add listener if elements exist
if (btnScrollTo && about) {
    btnScrollTo.addEventListener('click',(e)=>{
        e.preventDefault();
        about.scrollIntoView({behavior:'smooth'});
    });
}

// Mobile navigation - only add listener if elements exist
if (btnNav && header) {
    btnNav.addEventListener('click',()=>{
        header.classList.toggle('nav-open');
    });
}


// Smooth scroll for navigation links
const mainNavList = document.querySelector('.main-nav-list');
if (mainNavList) {
    mainNavList.addEventListener('click', function (e) {
        if (e.target.classList.contains('main-nav-link')) {
            const href = e.target.getAttribute('href');
            
            // Only prevent default and do smooth scroll for same-page anchors
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
            // For external links (other pages), let the default behavior work
            // No e.preventDefault() needed - browser will handle the navigation
        }
    });
}


// Sticky navigation - only for main page
const hero = document.querySelector('.section-hero');

if (hero && header) {
    const navHeight = header.getBoundingClientRect().height;

    const stickyNav = function (entries) {
        const [entry] = entries;

        if (!entry.isIntersecting) header.classList.add('sticky');
        else header.classList.remove('sticky');
    };

    const headerObserver = new IntersectionObserver(stickyNav, {
        root: null,
        threshold: 0,
        rootMargin: `-${navHeight}px`,
    });

    headerObserver.observe(hero);
}



const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.main-nav-link');
const indicator = document.querySelector('.nav-indicator');

function updateIndicator(activeLink) {
    if (!indicator || !activeLink) return;
    
    const rect = activeLink.getBoundingClientRect();
    const navElement = activeLink.closest('.main-nav');
    if (!navElement) return;
    
    const navRect = navElement.getBoundingClientRect();

    indicator.style.width = `${rect.width}px`;
    indicator.style.left = `${rect.left - navRect.left}px`;
    indicator.style.opacity = '1';
}

function hideIndicator() {
    if (!indicator) return;
    indicator.style.width = '0';
    indicator.style.opacity = '0';
}

function highlightNav() {
    if (sections.length === 0 || navLinks.length === 0) return;
    
    const scrollY = window.scrollY;

    // --- Hide indicator when in hero section ---
    const heroElement = document.querySelector('.hero');
    if (heroElement) {
        const heroHeight = heroElement.offsetHeight;

        if (scrollY < heroHeight - 150) {
            navLinks.forEach((link) => link.classList.remove('active'));
            hideIndicator();
            return; // stop here
        }
    }

    // --- Otherwise, highlight matching section ---
    let foundActive = false;

    sections.forEach((section) => {
        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            navLinks.forEach((link) => link.classList.remove('active'));
            const activeLink = document.querySelector(`.main-nav-link[href="#${sectionId}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
                updateIndicator(activeLink);
                foundActive = true;
            }
        }
    });

    if (!foundActive) hideIndicator();
}

window.addEventListener('scroll', highlightNav);
window.addEventListener('load', highlightNav);


// Smooth scroll to top when clicking logo
const logoElement = document.querySelector('.escal');
if (logoElement) {
    logoElement.addEventListener('click', function (e) {
        e.preventDefault(); // prevent the default anchor jump
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    });
}

const nav = document.querySelector(".main-nav");




// Reveal section
const allSections = document.querySelectorAll('.page');

if (allSections.length > 0) {
    const revealSection = (entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            // Add reveal class
            entry.target.classList.add('reveal');

            // Optional: stagger child elements
            const children = entry.target.querySelectorAll('.fade-in');
            children.forEach((child, i) => {
                child.style.transitionDelay = `${i * 0.2}s`;
            });

            observer.unobserve(entry.target);
        });
    };

    const sectionObserver = new IntersectionObserver(revealSection, {
        root: null,
        threshold: 0.15,
    });

    allSections.forEach(section => {
        sectionObserver.observe(section);

        // Optionally mark children for staggered animation
        section.querySelectorAll('h2, h3, p, li, img, .hero-main--header, .hero-description').forEach(el => {
            el.classList.add('fade-in');
        });
    });
}




// Header scroll effect - only for main page
window.addEventListener("scroll", function() {
    const headerElement = document.querySelector(".header");
    if (!headerElement) return;
    const logo = headerElement.querySelector("img.escal");
    const logoName = headerElement.querySelector(".logoName");
    if (!logo) return;
    
    // Check if we're on main page
    const isMainPage = document.querySelector('.section-hero');
    
    // Only apply scroll effect on main page
    if (!isMainPage) return;
    
    // Get the target section height for better scroll detection
    const sectionHeight = document.querySelector('.section-hero').offsetHeight;
    const triggerPoint = Math.min(sectionHeight * 0.8, 150);
    
    if (window.scrollY > triggerPoint) {
        headerElement.style.backgroundColor = "rgba(255, 255, 255, 0.98)";
        headerElement.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.1)";
        headerElement.style.backdropFilter = "blur(10px)";
        
        logo.src = "./img/title/image3.png";
        if (logoName) {
            logoName.style.display = "inline";
            logoName.style.color = "#2c3e50";
        }
        logo.style.height = "5rem";
    } else {
        headerElement.style.backgroundColor = "transparent";
        headerElement.style.boxShadow = "none";
        headerElement.style.backdropFilter = "none";
        
        logo.src = "./img/title/image3.png";
        if (logoName) {
            logoName.style.display = "inline";
            logoName.style.color="#7e95adff";
        }
        logo.style.height = "4rem";
    }
});





