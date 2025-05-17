// Sticky News Section with Horizontal Scrolling
// This script enhances the news carousel with sticky behavior and horizontal scrolling

document.addEventListener('DOMContentLoaded', function() {
  // Get carousel elements
  const newsSection = document.querySelector('.news-section');
  const carouselContainer = document.querySelector('.news-carousel-container');
  const track = document.querySelector('.news-carousel-track');
  const prevButton = document.querySelector('.news-carousel-prev');
  const nextButton = document.querySelector('.news-carousel-next');
  const dotsContainer = document.querySelector('.news-carousel-dots');

  // If carousel elements don't exist, exit early
  if (!newsSection || !carouselContainer || !track) return;

  // Get all cards
  const cards = Array.from(track.querySelectorAll('.news-card'));
  if (cards.length === 0) return;

  // Set initial variables
  let cardWidth = cards[0].offsetWidth;
  let cardGap = 32; // Gap between cards in pixels (matches CSS gap)
  let visibleCards = Math.floor(carouselContainer.clientWidth / (cardWidth + cardGap));
  let isInNewsSection = false;

  // Calculate total number of pages
  const totalCards = cards.length;
  const totalPages = Math.ceil(totalCards / visibleCards);

  // Function to check if user is viewing the news section
  function isViewingNewsSection() {
    if (!newsSection) return false;
    const rect = newsSection.getBoundingClientRect();
    return rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.3;
  }

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

  // No scroll indicator needed

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
    cardWidth = cards[0].offsetWidth;
    visibleCards = Math.floor(carouselContainer.clientWidth / (cardWidth + cardGap));

    // Update dots
    createDots();

    // Update active dot
    updateActiveDot();
  });

  // Handle navigation buttons
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

  // Add hover effects to cards
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      // Add hover effect
      this.style.transform = 'translateY(-10px)';
      this.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.15)';
    });

    card.addEventListener('mouseleave', function() {
      // Remove hover effect
      this.style.transform = '';
      this.style.boxShadow = '';
    });
  });

  // Auto-scroll every 8 seconds if not interacted with
  let autoScrollInterval;
  let userInteracted = false;

  function startAutoScroll() {
    autoScrollInterval = setInterval(() => {
      if (isInNewsSection && !userInteracted) {
        const scrollPosition = carouselContainer.scrollLeft;
        const pageWidth = visibleCards * (cardWidth + cardGap);
        const maxScroll = (totalPages - 1) * pageWidth;

        // If at the end, go back to beginning
        if (scrollPosition >= maxScroll - 10) {
          carouselContainer.scrollTo({
            left: 0,
            behavior: 'smooth'
          });
        } else {
          // Otherwise go to next page
          const nextPage = Math.ceil(scrollPosition / pageWidth) + 1;
          scrollToPage(nextPage);
        }
      }
    }, 8000);
  }

  function stopAutoScroll() {
    clearInterval(autoScrollInterval);
  }

  // Start auto-scroll
  startAutoScroll();

  // Track user interaction
  carouselContainer.addEventListener('mouseenter', function() {
    userInteracted = true;
    stopAutoScroll();
  });

  carouselContainer.addEventListener('mouseleave', function() {
    // Reset after 30 seconds of no interaction
    setTimeout(() => {
      userInteracted = false;
      startAutoScroll();
    }, 30000);
  });

  carouselContainer.addEventListener('touchstart', function() {
    userInteracted = true;
    stopAutoScroll();
  });

  // Initialize
  createDots();

  // Check if we're in the news section on page load
  setTimeout(() => {
    isInNewsSection = isViewingNewsSection();
  }, 1000);
});
