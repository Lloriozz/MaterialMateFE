// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add animation to the CTA button
    const ctaButton = document.querySelector('.btn-orange');
    if (ctaButton) {
        ctaButton.addEventListener('mouseover', function() {
            this.classList.add('pulse');
        });
        
        ctaButton.addEventListener('mouseout', function() {
            this.classList.remove('pulse');
        });
    }
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Show/hide footer on scroll
    const footer = document.querySelector('footer');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Show footer when scrolling down (even a little bit)
        if (scrollTop > 10) {
            footer.classList.add('visible');
        } 
        // Hide footer when at the top
        else {
            footer.classList.remove('visible');
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Mobile menu toggle
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (navbarToggler && navbarCollapse) {
        navbarToggler.addEventListener('click', function() {
            navbarCollapse.classList.toggle('show');
        });
    }
});