/**
 * Fixed Navbar Script for Booking Page
 * This script makes the navbar always fixed at the top with content scrolling behind it
 */
document.addEventListener('DOMContentLoaded', function() {
    // Get the navbar and header elements
    const navbar = document.querySelector('.navbar');
    const header = document.querySelector('.header');
    const hamburgerMenu = document.querySelector('.menu-container');
    const socialSidebar = document.querySelector('.social-sidebar');

    // Function to initialize the fixed navbar
    function initFixedNavbar() {
        if (!navbar) return;

        // Always make the navbar fixed at the top
        navbar.classList.add('navbar-fixed');

        // Make the hamburger menu fixed for mobile
        if (hamburgerMenu) {
            hamburgerMenu.classList.add('menu-fixed');
        }

        // Hide the header when the navbar is fixed
        if (header) {
            header.style.display = 'none';
        }

        // Adjust the social sidebar position
        if (socialSidebar) {
            socialSidebar.classList.add('social-sidebar-adjusted');
        }

        // Add a class to the body for any global adjustments
        document.body.classList.add('has-fixed-navbar');

        // Set the z-index of the navbar to be higher than other elements
        navbar.style.zIndex = '9999';
    }

    // Initialize the fixed navbar immediately
    initFixedNavbar();

    // Handle window resize events
    window.addEventListener('resize', function() {
        // Re-initialize the fixed navbar on resize
        initFixedNavbar();
    });

    // Add event listener for the logo to navigate to home
    const logo = navbar.querySelector('.logo');
    if (logo) {
        logo.style.display = 'block';
    }

    // Make sure all dropdowns appear below the fixed navbar
    const dropdowns = document.querySelectorAll('.submenu');
    dropdowns.forEach(dropdown => {
        dropdown.style.zIndex = '9998';
    });
});
