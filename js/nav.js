const btnNav=document.querySelector('.btn-mobile-nav');
const header=document.querySelector('.header');
const btnScrollTo=document.querySelector('.btn--scroll-to');
const about=document.querySelector('#about');

// See more button
btnScrollTo.addEventListener('click',(e)=>{
    e.preventDefault();
    about.scrollIntoView({behavior:'smooth'});
})

btnNav.addEventListener('click',()=>{
    header.classList.toggle('nav-open');
})


// Smooth scroll for navigation links
document.querySelector('.main-nav-list').addEventListener('click', function (e) {
  e.preventDefault();

  if (e.target.classList.contains('main-nav-link')) {
    const id = e.target.getAttribute('href');
    document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
  }
});


// stricky navigation
const hero = document.querySelector('.section-hero');

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



const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.main-nav-link');
const indicator = document.querySelector('.nav-indicator');

function updateIndicator(activeLink) {
  const rect = activeLink.getBoundingClientRect();
  const navRect = activeLink.closest('.main-nav').getBoundingClientRect();

  indicator.style.width = `${rect.width}px`;
  indicator.style.left = `${rect.left - navRect.left}px`;
  indicator.style.opacity = '1';
}

function hideIndicator() {
  indicator.style.width = '0';
  indicator.style.opacity = '0';
}

function highlightNav() {
  const scrollY = window.scrollY;

  // --- Hide indicator when in hero section ---
  const hero = document.querySelector('.hero');
  const heroHeight = hero.offsetHeight;

  if (scrollY < heroHeight - 150) {
    navLinks.forEach((link) => link.classList.remove('active'));
    hideIndicator();
    return; // stop here
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
document.querySelector('.escal').addEventListener('click', function (e) {
  e.preventDefault(); // prevent the default anchor jump
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
});

const nav = document.querySelector(".main-nav");

btnNav.addEventListener("click", () => {
  document.body.classList.toggle("nav-open");
});



// reveal section
const allSections = document.querySelectorAll('.page');

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





