const btnNav=document.querySelector('.btn-mobile-nav');
const header=document.querySelector('.header');
    btnNav.addEventListener('click',()=>{
    header.classList.toggle('nav-open');
})



window.addEventListener("scroll", function() {
    const header = document.querySelector(".header");
    const logo = header.querySelector("img.escal");
    if (window.scrollY > 50) {
    header.style.backgroundColor ="rgba(255, 255, 255, 0.98)";
    header.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.1)";
    } else {
    header.style.backgroundColor = "transparent";
    header.style.boxShadow = "none";
    }
});
