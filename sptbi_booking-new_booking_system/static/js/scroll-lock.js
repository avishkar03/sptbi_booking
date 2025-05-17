// Sticky News Section with Horizontal Scrolling
// This script implements a sticky section with horizontal scrolling for news cards

document.addEventListener('DOMContentLoaded', function() {
  // Get the news section element
  const newsSection = document.querySelector('.news-section');
  const carouselContainer = document.querySelector('.news-carousel-container');
  const carouselTrack = document.querySelector('.news-carousel-track');
  const newsCards = document.querySelectorAll('.news-card');
  const dotsContainer = document.querySelector('.news-carousel-dots');

  if (!newsSection || !carouselContainer || !carouselTrack || !newsCards.length) return;

  // No scroll indicator needed

  // Variables to track scroll state
  let isInNewsSection = false;
  let cardWidth = newsCards[0].offsetWidth;
  let cardGap = 32; // Gap between cards in pixels (matches CSS gap)
  let visibleCards = Math.floor(carouselContainer.clientWidth / (cardWidth + cardGap));

  // Calculate total number of pages
  const totalCards = newsCards.length;
  const totalPages = Math.ceil(totalCards / visibleCards);

  // Create pagination dots
  function createDots() {
    if (!dotsContainer) return;

    // Clear existing dots
    dotsContainer.innerHTML = '';

    // Create dots for each page
    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('div');
      dot.classList.add('news-carousel-dot');
      if (i === 0) dot.classList.add('active');

      // Add click event to scroll to corresponding page
      dot.addEventListener('click', () => {
        scrollToPage(i);
      });

      dotsContainer.appendChild(dot);
    }
  }

  // Function to scroll to a specific page
  function scrollToPage(pageIndex) {
    const scrollPosition = pageIndex * visibleCards * (cardWidth + cardGap);

    carouselContainer.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });
  }

  // Function to check if user is viewing the news section
  function isViewingNewsSection() {
    if (!newsSection) return false;
    const rect = newsSection.getBoundingClientRect();
    return rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.3;
  }

  // Function to update active dot based on scroll position
  function updateActiveDot() {
    if (!dotsContainer) return;

    const scrollPosition = carouselContainer.scrollLeft;
    const pageWidth = visibleCards * (cardWidth + cardGap);
    const currentPage = Math.round(scrollPosition / pageWidth);

    const dots = dotsContainer.querySelectorAll('.news-carousel-dot');
    dots.forEach((dot, i) => {
      if (i === currentPage) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  // Handle scroll events to track when user is in news section
  window.addEventListener('scroll', function() {
    // Check if we're in the news section
    isInNewsSection = isViewingNewsSection();
  });

  // Handle carousel container scroll events
  carouselContainer.addEventListener('scroll', function() {
    // Update active dot based on scroll position
    updateActiveDot();
  });

  // Handle window resize
  window.addEventListener('resize', function() {
    // Recalculate dimensions
    cardWidth = newsCards[0].offsetWidth;
    visibleCards = Math.floor(carouselContainer.clientWidth / (cardWidth + cardGap));

    // Update dots
    createDots();

    // Update active dot
    updateActiveDot();
  });

  // Handle navigation buttons
  const prevButton = document.querySelector('.news-carousel-prev');
  const nextButton = document.querySelector('.news-carousel-next');

  if (prevButton) {
    prevButton.addEventListener('click', function() {
      const scrollPosition = carouselContainer.scrollLeft;
      const pageWidth = visibleCards * (cardWidth + cardGap);
      const prevPage = Math.max(Math.floor(scrollPosition / pageWidth) - 1, 0);

      scrollToPage(prevPage);
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', function() {
      const scrollPosition = carouselContainer.scrollLeft;
      const pageWidth = visibleCards * (cardWidth + cardGap);
      const nextPage = Math.min(Math.ceil(scrollPosition / pageWidth) + 1, totalPages - 1);

      scrollToPage(nextPage);
    });
  }

  // Handle wheel events for horizontal scrolling
  carouselContainer.addEventListener('wheel', function(e) {
    if (isInNewsSection) {
      // Prevent default vertical scrolling
      e.preventDefault();

      // Scroll horizontally instead
      carouselContainer.scrollLeft += e.deltaY;
    }
  }, { passive: false });

  // Handle touch events for mobile
  let touchStartX = 0;
  let touchStartY = 0;
  let initialScrollLeft = 0;

  carouselContainer.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    initialScrollLeft = carouselContainer.scrollLeft;
  }, { passive: true });

  carouselContainer.addEventListener('touchmove', function(e) {
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;

    // Calculate horizontal and vertical distance
    const deltaX = touchStartX - touchX;
    const deltaY = touchStartY - touchY;

    // If horizontal movement is greater than vertical, prevent default scrolling
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault();

      // Scroll horizontally
      carouselContainer.scrollLeft = initialScrollLeft + deltaX;
    }
  }, { passive: false });

  // Initialize
  createDots();
});
