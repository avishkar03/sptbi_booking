/**
 * Modern Dividers JS
 * Adds interactive effects to the elegant dividers
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Elegant dividers initialized');

  // Function to check if element is in viewport
  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.bottom >= 0
    );
  }

  // Add animation to dividers when they come into view
  const dividers = document.querySelectorAll('.elegant-divider');

  function animateDividers() {
    dividers.forEach(divider => {
      if (isElementInViewport(divider) && !divider.classList.contains('animated')) {
        divider.classList.add('animated');

        // Add subtle fade-in animation
        divider.style.opacity = '1';
      }
    });
  }

  // Check dividers on scroll
  window.addEventListener('scroll', animateDividers, { passive: true });

  // Initial check
  setTimeout(animateDividers, 100);
});
