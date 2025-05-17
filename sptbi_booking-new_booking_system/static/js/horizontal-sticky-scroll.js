// Horizontal Sticky Scroll - Based on reference site
// This script implements horizontal scrolling within a sticky section triggered by vertical scrolling

document.addEventListener('DOMContentLoaded', function() {
  // Get elements
  const stickyWrapper = document.querySelector('.sticky-section-wrapper');
  const stickySection = document.querySelector('.news-section');
  const carouselTrack = document.querySelector('.news-carousel-track');
  const newsCards = document.querySelectorAll('.news-card');
  const progressBar = document.querySelector('.progress-bar');
  
  // Exit if elements don't exist
  if (!stickyWrapper || !stickySection || !carouselTrack || !newsCards.length || !progressBar) return;
  
  // Variables
  let totalCards = newsCards.length;
  let cardWidth = newsCards[0].offsetWidth;
  let cardGap = 32; // Gap between cards in pixels (matches CSS)
  let totalScrollDistance = 0;
  let currentCardIndex = 0;
  let isScrolling = false;
  
  // Set first card as active
  newsCards[0].classList.add('active');
  
  // Calculate the total width of all cards + gaps
  const totalCarouselWidth = (cardWidth + cardGap) * totalCards;
  
  // Set the height of the sticky wrapper to allow enough scroll distance
  // This is key to making the horizontal scroll work with vertical scrolling
  function setWrapperHeight() {
    // Calculate how much vertical scroll is needed to go through all cards
    // We multiply by a factor to create a comfortable scroll speed
    const scrollFactor = 2; // Adjust this for faster/slower scrolling
    totalScrollDistance = totalCarouselWidth * scrollFactor;
    
    // Set the wrapper height to viewport height plus the total scroll distance
    stickyWrapper.style.height = `calc(100vh + ${totalScrollDistance}px)`;
  }
  
  // Function to update the carousel based on scroll position
  function updateCarouselPosition() {
    // Get the scroll progress through the sticky section
    const scrollTop = window.scrollY;
    const stickyTop = stickyWrapper.offsetTop;
    const scrollPosition = scrollTop - stickyTop;
    
    // Calculate progress (0 to 1)
    let progress = Math.max(0, Math.min(1, scrollPosition / totalScrollDistance));
    
    // Calculate the horizontal scroll position
    const horizontalScroll = progress * (totalCarouselWidth - window.innerWidth + 100);
    
    // Apply the transform to move the carousel horizontally
    carouselTrack.style.transform = `translateX(-${horizontalScroll}px)`;
    
    // Update progress bar
    progressBar.style.width = `${progress * 100}%`;
    
    // Calculate which card should be active
    const newCardIndex = Math.min(
      totalCards - 1,
      Math.floor(progress * totalCards)
    );
    
    // Update active card if changed
    if (newCardIndex !== currentCardIndex) {
      // Remove active class from all cards
      newsCards.forEach(card => card.classList.remove('active'));
      
      // Add active class to current card
      newsCards[newCardIndex].classList.add('active');
      
      // Update current card index
      currentCardIndex = newCardIndex;
    }
  }
  
  // Handle window scroll
  window.addEventListener('scroll', function() {
    if (!isScrolling) {
      window.requestAnimationFrame(function() {
        updateCarouselPosition();
        isScrolling = false;
      });
      isScrolling = true;
    }
  });
  
  // Handle window resize
  window.addEventListener('resize', function() {
    // Recalculate dimensions
    cardWidth = newsCards[0].offsetWidth;
    
    // Reset wrapper height
    setWrapperHeight();
    
    // Update carousel position
    updateCarouselPosition();
  });
  
  // Initialize
  setWrapperHeight();
  
  // Update carousel position on page load
  setTimeout(updateCarouselPosition, 100);
});
