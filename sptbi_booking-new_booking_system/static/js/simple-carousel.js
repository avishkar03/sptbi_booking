// Simple Horizontal Carousel
// This script implements basic horizontal scrolling for the news carousel

document.addEventListener('DOMContentLoaded', function() {
  // Get carousel elements
  const carouselContainer = document.querySelector('.news-carousel-container');
  const track = document.querySelector('.news-carousel-track');
  const prevButton = document.querySelector('.news-carousel-prev');
  const nextButton = document.querySelector('.news-carousel-next');
  const cards = Array.from(track?.querySelectorAll('.news-card') || []);
  
  // Exit if elements don't exist
  if (!carouselContainer || !track || !cards.length) return;
  
  // Calculate card width including gap
  const cardWidth = cards[0].offsetWidth;
  const cardGap = 32; // Gap between cards in pixels (matches CSS)
  const scrollAmount = cardWidth + cardGap;
  
  // Handle navigation buttons
  if (prevButton) {
    prevButton.addEventListener('click', function() {
      carouselContainer.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    });
  }
  
  if (nextButton) {
    nextButton.addEventListener('click', function() {
      carouselContainer.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    });
  }
  
  // Handle keyboard navigation
  carouselContainer.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight') {
      carouselContainer.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    } else if (e.key === 'ArrowLeft') {
      carouselContainer.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    }
  });
  
  // Make container focusable for keyboard navigation
  carouselContainer.setAttribute('tabindex', '0');
  
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
  
  // Add touch swipe support
  let touchStartX = 0;
  let touchEndX = 0;
  
  carouselContainer.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  carouselContainer.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
  
  function handleSwipe() {
    const swipeThreshold = 50; // Minimum distance to be considered a swipe
    
    if (touchEndX < touchStartX - swipeThreshold) {
      // Swipe left - go to next
      carouselContainer.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
    
    if (touchEndX > touchStartX + swipeThreshold) {
      // Swipe right - go to previous
      carouselContainer.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    }
  }
});
