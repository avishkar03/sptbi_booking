// Enhanced Animations and Interactions
document.addEventListener('DOMContentLoaded', function() {
  // Scroll Animation Observer
  const scrollElements = document.querySelectorAll('[data-scroll]');
  const staggerElements = document.querySelectorAll('[data-stagger]');

  const elementInView = (el, percentageScroll = 100) => {
    const elementTop = el.getBoundingClientRect().top;
    return (
      elementTop <= 
      ((window.innerHeight || document.documentElement.clientHeight) * (percentageScroll/100))
    );
  };

  const displayScrollElement = element => {
    element.classList.add('visible');
  };

  const handleScrollAnimation = () => {
    scrollElements.forEach((el) => {
      if (elementInView(el, 90)) {
        displayScrollElement(el);
      }
    });

    staggerElements.forEach((el) => {
      if (elementInView(el, 90)) {
        el.classList.add('visible');
      }
    });
  };

  // Throttle scroll events
  let throttleTimer;
  const throttle = (callback, time) => {
    if (throttleTimer) return;
    throttleTimer = true;
    setTimeout(() => {
      callback();
      throttleTimer = false;
    }, time);
  };

  // Add scroll event listener with throttling
  window.addEventListener('scroll', () => {
    throttle(handleScrollAnimation, 50);
  });

  // Initial check for visible elements
  handleScrollAnimation();

  // Back to Top Button
  const backToTop = document.createElement('a');
  backToTop.href = '#';
  backToTop.className = 'back-to-top';
  backToTop.innerHTML = '<i class="bi bi-arrow-up"></i>';
  document.body.appendChild(backToTop);

  const toggleBackToTop = () => {
    if (window.pageYOffset > 300) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', toggleBackToTop);

  backToTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Smooth Scroll for Navigation Links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Banner Enhancement
  const bannerSlides = document.querySelectorAll('.banner-slide');
  if (bannerSlides.length > 0) {
    let currentSlide = 0;
    const totalSlides = bannerSlides.length;
    
    // Create navigation indicators
    const navigation = document.querySelector('.banner-navigation');
    if (navigation) {
      const indicators = document.createElement('div');
      indicators.className = 'banner-indicators';
      for (let i = 0; i < totalSlides; i++) {
        const indicator = document.createElement('button');
        indicator.className = 'banner-indicator' + (i === 0 ? ' active' : '');
        indicator.setAttribute('aria-label', `Go to slide ${i + 1}`);
        indicator.addEventListener('click', () => goToSlide(i));
        indicators.appendChild(indicator);
      }
      navigation.appendChild(indicators);
    }

    // Progress bar animation
    const progressBar = document.querySelector('.banner-progress-bar');
    const animateProgress = () => {
      if (progressBar) {
        progressBar.style.width = '0%';
        setTimeout(() => {
          progressBar.style.width = '100%';
        }, 50);
      }
    };

    const goToSlide = (n) => {
      bannerSlides[currentSlide].classList.remove('active');
      document.querySelectorAll('.banner-indicator')[currentSlide].classList.remove('active');
      
      currentSlide = (n + totalSlides) % totalSlides;
      
      bannerSlides[currentSlide].classList.add('active');
      document.querySelectorAll('.banner-indicator')[currentSlide].classList.add('active');
      animateProgress();
    };

    // Auto advance slides
    setInterval(() => {
      goToSlide(currentSlide + 1);
    }, 5000);

    // Touch support for banner
    let touchStartX = 0;
    let touchEndX = 0;
    
    const handleSwipe = () => {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          goToSlide(currentSlide + 1);
        } else {
          goToSlide(currentSlide - 1);
        }
      }
    };

    document.querySelector('.modern-slideshow').addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.querySelector('.modern-slideshow').addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }

  // Add ARIA labels for accessibility
  const addAccessibilityAttributes = () => {
    // Navigation
    const nav = document.querySelector('nav');
    if (nav) nav.setAttribute('role', 'navigation');

    // Dropdowns
    document.querySelectorAll('.dropdown').forEach(dropdown => {
      dropdown.setAttribute('role', 'menu');
      const trigger = dropdown.querySelector('a');
      if (trigger) {
        trigger.setAttribute('role', 'menuitem');
        trigger.setAttribute('aria-haspopup', 'true');
        trigger.setAttribute('aria-expanded', 'false');
      }
    });

    // Banner
    const banner = document.querySelector('.modern-banner-container');
    if (banner) {
      banner.setAttribute('role', 'region');
      banner.setAttribute('aria-label', 'Featured content carousel');
    }
  };

  addAccessibilityAttributes();
});
