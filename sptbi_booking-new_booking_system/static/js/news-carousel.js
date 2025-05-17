// News Carousel - Basic functionality
// Note: Main horizontal scrolling is now handled by horizontal-sticky-scroll.js

document.addEventListener('DOMContentLoaded', function() {
  // Get carousel elements
  const newsSection = document.querySelector('.news-section');
  const carouselContainer = document.querySelector('.news-carousel-container');
  const track = document.querySelector('.news-carousel-track');
  const prevButton = document.querySelector('.news-carousel-prev');
  const nextButton = document.querySelector('.news-carousel-next');
  const cards = Array.from(track?.querySelectorAll('.news-card') || []);

  // Exit if elements don't exist
  if (!newsSection || !carouselContainer || !track || !cards.length) return;

  // Handle click on cards
  cards.forEach(card => {
    card.addEventListener('click', function(e) {
      // Don't trigger if clicking on a link or button
      if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;

      // Get the card's link
      const link = card.querySelector('.news-card-button');
      if (link) {
        // Navigate to the link URL
        window.location.href = link.href;
      }
    });
  });

  // Handle navigation buttons (for accessibility)
  if (prevButton && nextButton) {
    // Get the horizontal-sticky-scroll instance
    const horizontalScroll = window.horizontalStickyScroll;

    prevButton.addEventListener('click', function() {
      // Scroll to previous card
      const currentIndex = cards.findIndex(card => card.classList.contains('active'));
      if (currentIndex > 0) {
        // Calculate the scroll position for the previous card
        const prevIndex = currentIndex - 1;
        const scrollRatio = prevIndex / (cards.length - 1);

        // Scroll the page to the corresponding position
        const stickyWrapper = document.querySelector('.sticky-section-wrapper');
        const scrollTop = stickyWrapper.offsetTop + (scrollRatio * (stickyWrapper.scrollHeight - window.innerHeight));

        window.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        });
      }
    });

    nextButton.addEventListener('click', function() {
      // Scroll to next card
      const currentIndex = cards.findIndex(card => card.classList.contains('active'));
      if (currentIndex < cards.length - 1) {
        // Calculate the scroll position for the next card
        const nextIndex = currentIndex + 1;
        const scrollRatio = nextIndex / (cards.length - 1);

        // Scroll the page to the corresponding position
        const stickyWrapper = document.querySelector('.sticky-section-wrapper');
        const scrollTop = stickyWrapper.offsetTop + (scrollRatio * (stickyWrapper.scrollHeight - window.innerHeight));

        window.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        });
      }
    });
  }
});
