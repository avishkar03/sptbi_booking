// Scroll Lock - Basic functionality
// Note: Main horizontal scrolling is now handled by horizontal-sticky-scroll.js

document.addEventListener('DOMContentLoaded', function() {
  // Load the horizontal sticky scroll script
  const script = document.createElement('script');
  script.src = '/static/js/horizontal-sticky-scroll.js';
  script.async = true;
  document.head.appendChild(script);

  // Add keyboard navigation for accessibility
  window.addEventListener('keydown', function(e) {
    const newsCards = document.querySelectorAll('.news-card');
    if (!newsCards.length) return;

    // Find the currently active card
    const activeCardIndex = Array.from(newsCards).findIndex(card => card.classList.contains('active'));
    if (activeCardIndex === -1) return;

    // Handle arrow keys
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      // Navigate to next card
      if (activeCardIndex < newsCards.length - 1) {
        // Calculate the scroll position for the next card
        const nextIndex = activeCardIndex + 1;
        const scrollRatio = nextIndex / (newsCards.length - 1);

        // Scroll the page to the corresponding position
        const stickyWrapper = document.querySelector('.sticky-section-wrapper');
        if (stickyWrapper) {
          const scrollTop = stickyWrapper.offsetTop + (scrollRatio * (stickyWrapper.scrollHeight - window.innerHeight));

          window.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
          });
        }
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      // Navigate to previous card
      if (activeCardIndex > 0) {
        // Calculate the scroll position for the previous card
        const prevIndex = activeCardIndex - 1;
        const scrollRatio = prevIndex / (newsCards.length - 1);

        // Scroll the page to the corresponding position
        const stickyWrapper = document.querySelector('.sticky-section-wrapper');
        if (stickyWrapper) {
          const scrollTop = stickyWrapper.offsetTop + (scrollRatio * (stickyWrapper.scrollHeight - window.innerHeight));

          window.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
          });
        }
      }
    }
  });
});
