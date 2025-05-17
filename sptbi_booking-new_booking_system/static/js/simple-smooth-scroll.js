/**
 * Enhanced Smooth Scroll Implementation
 * A lightweight alternative that uses native browser features
 * with advanced animation capabilities
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Enhanced smooth scroll initialized');

  // Debug mode - set to true to see console logs
  const DEBUG = true;

  function debugLog(...args) {
    if (DEBUG) {
      console.log(...args);
    }
  }

  // Add smooth scrolling to html element
  document.documentElement.style.scrollBehavior = 'smooth';

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
      e.preventDefault();

      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      debugLog(`Scrolling to target: ${targetId}`);

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
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

  // Add reveal animations to elements with data-scroll attribute
  const revealElements = document.querySelectorAll('[data-scroll]');

  if (revealElements.length > 0) {
    debugLog(`Found ${revealElements.length} elements with data-scroll attribute`);

    // Function to check if element is in viewport
    function isElementInViewport(el) {
      const rect = el.getBoundingClientRect();
      return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom >= 0
      );
    }

    // Function to reveal element with delay
    function revealElement(element) {
      // Get animation delay if specified
      const delay = element.dataset.delay ? parseInt(element.dataset.delay) : 0;

      // Add revealed class after delay
      setTimeout(() => {
        element.classList.add('revealed');
        debugLog(`Revealed element: `, element);

        // Also add revealed class to parent section if this is a section title
        if (element.classList.contains('section-title')) {
          const section = element.closest('.about-section, .offerings, .news');
          if (section) {
            section.classList.add('revealed');
            debugLog(`Revealed section: `, section);
          }
        }
      }, delay);
    }

    // Function to check all elements on scroll
    function checkElements() {
      revealElements.forEach(element => {
        if (isElementInViewport(element) && !element.classList.contains('revealed')) {
          revealElement(element);
        }
      });
    }

    // Check elements on scroll
    window.addEventListener('scroll', checkElements, { passive: true });

    // Check elements on page load
    window.addEventListener('load', checkElements);

    // Initial check
    setTimeout(checkElements, 100);
  }

  // Add parallax effect to elements with data-parallax attribute
  const parallaxElements = document.querySelectorAll('[data-parallax]');

  if (parallaxElements.length > 0) {
    debugLog(`Found ${parallaxElements.length} elements with data-parallax attribute`);

    // Handle scroll for parallax effect
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset;

      parallaxElements.forEach(element => {
        const speed = parseFloat(element.dataset.parallax) || 0.2;
        const offset = scrollTop * speed;

        element.style.transform = `translateY(${offset}px)`;
      });
    }, { passive: true });
  }

  // Add staggered animations to elements with data-stagger attribute
  const staggerContainers = document.querySelectorAll('[data-stagger]');

  if (staggerContainers.length > 0) {
    debugLog(`Found ${staggerContainers.length} stagger containers`);

    // Function to check if element is in viewport
    function isElementInViewport(el) {
      const rect = el.getBoundingClientRect();
      return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom >= 0
      );
    }

    // Function to reveal staggered container
    function revealStaggerContainer(container) {
      if (container.classList.contains('revealed')) return;

      const selector = container.dataset.stagger;
      const delay = parseInt(container.dataset.staggerDelay) || 100;
      const type = container.dataset.staggerType || 'fade-in';

      debugLog(`Revealing stagger container with selector: ${selector}, delay: ${delay}, type: ${type}`);

      // Add revealed class to container
      container.classList.add('revealed');

      // Find all children matching the selector
      const children = selector ? container.querySelectorAll(selector) : container.children;

      // Add stagger animation to each child
      Array.from(children).forEach((child, index) => {
        setTimeout(() => {
          child.classList.add('revealed');
          debugLog(`Revealed stagger child ${index}`);
        }, index * delay);
      });
    }

    // Function to check all stagger containers on scroll
    function checkStaggerContainers() {
      staggerContainers.forEach(container => {
        if (isElementInViewport(container) && !container.classList.contains('revealed')) {
          revealStaggerContainer(container);
        }
      });
    }

    // Check stagger containers on scroll
    window.addEventListener('scroll', checkStaggerContainers, { passive: true });

    // Check stagger containers on page load
    window.addEventListener('load', checkStaggerContainers);

    // Initial check
    setTimeout(checkStaggerContainers, 100);
  }

  // Add special animations for section titles
  const sectionTitles = document.querySelectorAll('.section-title');

  if (sectionTitles.length > 0) {
    debugLog(`Found ${sectionTitles.length} section titles`);

    // Function to check if element is in viewport
    function isElementInViewport(el) {
      const rect = el.getBoundingClientRect();
      return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom >= 0
      );
    }

    // Function to reveal section title
    function revealSectionTitle(title) {
      if (title.classList.contains('revealed')) return;

      // Add revealed class
      title.classList.add('revealed');
      debugLog(`Revealed section title: ${title.textContent}`);
    }

    // Function to check all section titles on scroll
    function checkSectionTitles() {
      sectionTitles.forEach(title => {
        if (isElementInViewport(title) && !title.classList.contains('revealed')) {
          revealSectionTitle(title);
        }
      });
    }

    // Check section titles on scroll
    window.addEventListener('scroll', checkSectionTitles, { passive: true });

    // Check section titles on page load
    window.addEventListener('load', checkSectionTitles);

    // Initial check
    setTimeout(checkSectionTitles, 100);
  }
});
