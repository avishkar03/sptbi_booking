/**
 * Navbar Visibility Script
 * This script ensures the navbar is always visible and properly styled
 */
(function() {
    // Run this script immediately to ensure the navbar is visible
    function ensureNavbarVisibility() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        
        // Force the navbar to be visible
        navbar.style.display = 'flex';
        navbar.style.opacity = '1';
        
        // Add the fixed class if not already added
        if (!navbar.classList.contains('navbar-fixed')) {
            navbar.classList.add('navbar-fixed');
        }
        
        // Hide the header
        const header = document.querySelector('.header');
        if (header) {
            header.style.display = 'none';
        }
        
        // Adjust body padding
        document.body.style.paddingTop = navbar.offsetHeight + 'px';
        document.body.classList.add('has-fixed-navbar');
    }
    
    // Run immediately
    ensureNavbarVisibility();
    
    // Also run after a short delay to ensure it works after any other scripts
    setTimeout(ensureNavbarVisibility, 100);
    
    // And run again after the page is fully loaded
    window.addEventListener('load', ensureNavbarVisibility);
})();
