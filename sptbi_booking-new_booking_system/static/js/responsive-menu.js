/**
 * Responsive Menu Handler
 * Ensures the correct menu is shown at different screen sizes
 */
document.addEventListener('DOMContentLoaded', function() {
    // Get the navbar and hamburger menu elements
    const navbar = document.querySelector('.navbar');
    const menuContainer = document.querySelector('.menu-container');

    // Function to handle responsive menu display
    function handleResponsiveMenu() {
        const windowWidth = window.innerWidth;

        // At 914px or less, hide navbar and show hamburger menu
        if (windowWidth <= 914) {
            if (navbar) {
                navbar.style.display = 'none';
                navbar.style.visibility = 'hidden';
            }
            if (menuContainer) {
                menuContainer.style.display = 'flex';
                menuContainer.style.visibility = 'visible';
            }
        }
        // Above 914px, show navbar and hide hamburger menu
        else {
            if (navbar) {
                navbar.style.display = 'flex';
                navbar.style.visibility = 'visible';
            }
            if (menuContainer) {
                menuContainer.style.display = 'none';
                menuContainer.style.visibility = 'hidden';
            }
        }
    }

    // Run on page load
    handleResponsiveMenu();

    // Run on window resize
    window.addEventListener('resize', handleResponsiveMenu);

    // Run again after a short delay to ensure it works
    setTimeout(handleResponsiveMenu, 100);
});
