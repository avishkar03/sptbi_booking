/**
 * Scroll Animations JS
 * Handles scroll-triggered animations and effects
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Scroll animations initialized');

  // Debug mode - set to true to see console logs
  const DEBUG = true;

  function debugLog(...args) {
    if (DEBUG) {
      console.log(...args);
    }
  }

  // Create scroll progress indicator if it doesn't exist
  if (!document.querySelector('.scroll-progress')) {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.prepend(progressBar);
    debugLog('Created scroll progress indicator');
  }

  // Update scroll progress indicator on scroll
  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = (scrollTop / scrollHeight) * 100;

    const progressBar = document.querySelector('.scroll-progress');
    if (progressBar) {
      progressBar.style.width = `${scrollProgress}%`;
    }
  }, { passive: true });

  // Add smooth scrolling to all internal links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();

        // Get the target's position
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;

        // Account for fixed header if present
        const headerOffset = 100; // Adjust based on your header height
        const offsetPosition = targetPosition - headerOffset;

        // Scroll to the target
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Function to check if element is in viewport
  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    const threshold = 0.2; // 20% of element must be visible

    return (
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) * (1 - threshold) &&
      rect.bottom >= (window.innerHeight || document.documentElement.clientHeight) * threshold
    );
  }

  // Handle section title animations
  const sectionTitles = document.querySelectorAll('.section-title');

  if (sectionTitles.length > 0) {
    debugLog(`Found ${sectionTitles.length} section titles`);

    function checkSectionTitles() {
      sectionTitles.forEach(title => {
        if (isElementInViewport(title) && !title.classList.contains('revealed')) {
          title.classList.add('revealed');
          debugLog(`Revealed section title: ${title.textContent}`);

          // Also reveal parent section if applicable
          const section = title.closest('.about-section, .offerings, .news');
          if (section) {
            section.classList.add('revealed');
          }
        }
      });
    }

    window.addEventListener('scroll', checkSectionTitles, { passive: true });
    window.addEventListener('load', checkSectionTitles);
    setTimeout(checkSectionTitles, 100);
  }

  // Handle scroll-triggered animations
  const animatedElements = document.querySelectorAll('[data-scroll]');

  if (animatedElements.length > 0) {
    debugLog(`Found ${animatedElements.length} animated elements`);

    function checkAnimatedElements() {
      animatedElements.forEach(element => {
        if (isElementInViewport(element) && !element.classList.contains('revealed')) {
          // Get animation delay if specified
          const delay = element.dataset.delay ? parseInt(element.dataset.delay) : 0;

          // Add revealed class after delay
          setTimeout(() => {
            element.classList.add('revealed');
            debugLog(`Revealed element with animation: ${element.dataset.scroll}`);
          }, delay);
        }
      });
    }

    window.addEventListener('scroll', checkAnimatedElements, { passive: true });
    window.addEventListener('load', checkAnimatedElements);
    setTimeout(checkAnimatedElements, 100);
  }

  // Handle parallax effects
  const parallaxElements = document.querySelectorAll('[data-parallax]');

  if (parallaxElements.length > 0) {
    debugLog(`Found ${parallaxElements.length} parallax elements`);

    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset;

      parallaxElements.forEach(element => {
        const speed = parseFloat(element.dataset.parallax) || 0.2;
        const offset = scrollTop * speed;

        element.style.transform = `translateY(${offset}px)`;
      });
    }, { passive: true });
  }

  // Handle staggered animations
  const staggerContainers = document.querySelectorAll('[data-stagger]');

  if (staggerContainers.length > 0) {
    debugLog(`Found ${staggerContainers.length} stagger containers`);

    function checkStaggerContainers() {
      staggerContainers.forEach(container => {
        if (isElementInViewport(container) && !container.classList.contains('revealed')) {
          // Get the selector for staggered items
          const selector = container.dataset.stagger;

          // Get the delay between items
          const staggerDelay = parseInt(container.dataset.staggerDelay) || 200;

          // Add revealed class to container
          container.classList.add('revealed');
          debugLog(`Revealed stagger container`);

          // Find all staggered items
          let staggerItems;
          if (selector && selector !== '.stagger-item') {
            staggerItems = container.querySelectorAll(selector);
          } else {
            // If no specific selector or it's the default .stagger-item
            staggerItems = container.querySelectorAll('.stagger-item');
            if (staggerItems.length === 0) {
              // Fallback to direct children if no .stagger-item found
              staggerItems = container.children;
            }
          }

          // Add revealed class to each item with staggered delay
          Array.from(staggerItems).forEach((item, index) => {
            setTimeout(() => {
              item.classList.add('revealed');
              debugLog(`Revealed stagger item ${index + 1}`);
            }, index * staggerDelay);
          });
        }
      });
    }

    window.addEventListener('scroll', checkStaggerContainers, { passive: true });
    window.addEventListener('load', checkStaggerContainers);
    setTimeout(checkStaggerContainers, 100);
  }

  // Special handling for About Us, What We Offer, and News sections
  const aboutSection = document.querySelector('.about-section');
  const offeringsSection = document.querySelector('.offerings');
  const newsSection = document.querySelector('.news');

  function checkSpecialSections() {
    // About section
    if (aboutSection && isElementInViewport(aboutSection) && !aboutSection.classList.contains('revealed')) {
      aboutSection.classList.add('revealed');
      debugLog('Revealed About section');
    }

    // Offerings section
    if (offeringsSection && isElementInViewport(offeringsSection) && !offeringsSection.classList.contains('revealed')) {
      offeringsSection.classList.add('revealed');
      debugLog('Revealed Offerings section');
    }

    // News section
    if (newsSection && isElementInViewport(newsSection) && !newsSection.classList.contains('revealed')) {
      newsSection.classList.add('revealed');
      debugLog('Revealed News section');
    }
  }

  window.addEventListener('scroll', checkSpecialSections, { passive: true });
  window.addEventListener('load', checkSpecialSections);
  setTimeout(checkSpecialSections, 100);

  // Initial check for all animations
  setTimeout(() => {
    checkSectionTitles && checkSectionTitles();
    checkAnimatedElements && checkAnimatedElements();
    checkStaggerContainers && checkStaggerContainers();
    checkSpecialSections();
    debugLog('Initial animation check complete');
  }, 200);
});
