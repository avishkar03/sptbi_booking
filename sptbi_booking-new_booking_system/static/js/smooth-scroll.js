/**
 * Smooth Scroll Implementation
 * Inspired by Delassus.com
 */

// Debug flag - set to true to see console logs
const DEBUG = true;

function debugLog(...args) {
  if (DEBUG) {
    console.log(...args);
  }
}

class SmoothScroll {
  constructor(options) {
    debugLog('SmoothScroll constructor called');

    // Default options
    this.options = {
      container: document.body,
      smoothness: 0.1,
      lerp: 0.1,
      touchMultiplier: 2,
      scrollbarContainer: null,
      scrollbarThumb: null,
      scrollbarTrack: null,
      ...options
    };

    // DOM elements
    this.container = this.options.container;
    this.scrollbarContainer = this.options.scrollbarContainer;
    this.scrollbarThumb = this.options.scrollbarThumb;
    this.scrollbarTrack = this.options.scrollbarTrack;

    // State variables
    this.current = 0;
    this.target = 0;
    this.lastScroll = 0;
    this.resizeRequest = null;
    this.scrollRequest = null;
    this.isScrolling = false;
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    this.isTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.isHorizontal = false;
    this.scrollHeight = 0;
    this.windowHeight = 0;
    this.maxScroll = 0;
    this.scrollbarHeight = 0;
    this.scrollbarThumbHeight = 0;
    this.scrollbarRatio = 0;

    // Bind methods
    this.onScroll = this.onScroll.bind(this);
    this.onResize = this.onResize.bind(this);
    this.update = this.update.bind(this);
    this.render = this.render.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.updateScrollbar = this.updateScrollbar.bind(this);

    // Initialize
    this.init();
  }

  init() {
    debugLog('SmoothScroll init called');

    // Skip smooth scrolling for mobile, touch devices, or reduced motion preference
    if (this.isReducedMotion) {
      debugLog('Smooth scrolling disabled due to reduced motion preference');
      return;
    }

    try {
      // Create virtual scroller
      this.createVirtualScroller();

      // Set initial values
      this.setValues();

      // Add event listeners
      this.addEventListeners();

      // Start animation loop
      this.startRender();

      // Initialize custom scrollbar if elements are provided
      if (this.scrollbarContainer && this.scrollbarThumb && this.scrollbarTrack) {
        this.initScrollbar();
      }

      debugLog('Smooth scroll initialized successfully');
    } catch (error) {
      console.error('Error initializing smooth scroll:', error);
    }
  }

  createVirtualScroller() {
    debugLog('Creating virtual scroller');

    try {
      // Check if the container is valid
      if (!this.container || !(this.container instanceof HTMLElement)) {
        throw new Error('Invalid container element');
      }

      // Create a wrapper for the content
      this.wrapper = document.createElement('div');
      this.wrapper.classList.add('smooth-scroll-wrapper');

      // Apply styles to the wrapper
      Object.assign(this.wrapper.style, {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1
      });

      // Create the virtual scroller
      this.virtualScroller = document.createElement('div');
      this.virtualScroller.classList.add('virtual-scroller');

      // Apply styles to the virtual scroller
      Object.assign(this.virtualScroller.style, {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        transform: 'translateY(0)',
        willChange: 'transform',
        pointerEvents: 'all'
      });

      // Store original children before moving them
      const originalChildren = Array.from(this.container.children);
      debugLog(`Found ${originalChildren.length} children in container`);

      // Skip certain elements that should not be moved (like preloader)
      const skipElements = ['#preloader', '.scroll-progress'];

      // Move children to the virtual scroller, skipping certain elements
      originalChildren.forEach(child => {
        let shouldSkip = false;

        // Check if this element should be skipped
        skipElements.forEach(selector => {
          if (child.matches(selector) || child.querySelector(selector)) {
            shouldSkip = true;
            debugLog(`Skipping element matching ${selector}`);
          }
        });

        if (!shouldSkip) {
          this.virtualScroller.appendChild(child);
        }
      });

      // Append the virtual scroller to the wrapper
      this.wrapper.appendChild(this.virtualScroller);

      // Append the wrapper to the container
      this.container.appendChild(this.wrapper);

      // Create a spacer element to maintain scroll height
      this.spacer = document.createElement('div');
      this.spacer.classList.add('smooth-scroll-spacer');
      this.container.appendChild(this.spacer);

      debugLog('Virtual scroller created successfully');
    } catch (error) {
      console.error('Error creating virtual scroller:', error);
      // Revert any changes if there was an error
      this.destroy();
    }
  }

  setValues() {
    // Get dimensions
    this.windowHeight = window.innerHeight;
    this.scrollHeight = this.virtualScroller.scrollHeight;
    this.maxScroll = this.scrollHeight - this.windowHeight;

    // Update spacer height
    this.spacer.style.height = `${this.scrollHeight}px`;
  }

  addEventListeners() {
    // Scroll event
    window.addEventListener('scroll', this.onScroll, { passive: true });

    // Resize event
    window.addEventListener('resize', this.onResize, { passive: true });

    // Touch events for mobile
    if (this.isTouch) {
      this.wrapper.addEventListener('touchstart', this.handleTouchStart, { passive: false });
      this.wrapper.addEventListener('touchmove', this.handleTouchMove, { passive: false });
      this.wrapper.addEventListener('touchend', this.handleTouchEnd, { passive: true });
    }
  }

  onScroll() {
    // Update target scroll position
    this.target = window.scrollY;

    // Request animation frame for update
    if (!this.scrollRequest) {
      this.scrollRequest = requestAnimationFrame(() => {
        this.isScrolling = true;
        this.scrollRequest = null;
      });
    }
  }

  onResize() {
    // Cancel any pending resize request
    if (this.resizeRequest) {
      cancelAnimationFrame(this.resizeRequest);
    }

    // Request animation frame for resize
    this.resizeRequest = requestAnimationFrame(() => {
      this.setValues();
      this.resizeRequest = null;
    });
  }

  update() {
    // Calculate new current position using linear interpolation (LERP)
    this.current = this.lerp(this.current, this.target, this.options.lerp);

    // Round to 2 decimal places to avoid floating point issues
    this.current = parseFloat(this.current.toFixed(2));

    // Check if we've reached the target (or close enough)
    if (Math.abs(this.current - this.target) < 0.1) {
      this.current = this.target;
      this.isScrolling = false;
    }

    // Update virtual scroller position
    this.virtualScroller.style.transform = `translateY(-${this.current}px)`;

    // Update scrollbar if it exists
    if (this.scrollbarThumb) {
      this.updateScrollbar();
    }
  }

  render() {
    // Update positions
    this.update();

    // Continue animation loop
    requestAnimationFrame(this.render);
  }

  startRender() {
    // Start the animation loop
    this.render();
  }

  lerp(start, end, factor) {
    // Linear interpolation formula
    return start + (end - start) * factor;
  }

  handleTouchStart(e) {
    // Store initial touch position
    this.touchStart = {
      y: e.touches[0].clientY,
      x: e.touches[0].clientX
    };

    // Reset touch delta
    this.touchDelta = 0;
  }

  handleTouchMove(e) {
    // Calculate touch delta
    const touchY = e.touches[0].clientY;
    const touchX = e.touches[0].clientX;

    // Determine if scroll is more horizontal or vertical
    const deltaX = this.touchStart.x - touchX;
    const deltaY = this.touchStart.y - touchY;

    // If horizontal scrolling is enabled and horizontal movement is greater
    if (this.isHorizontal && Math.abs(deltaX) > Math.abs(deltaY)) {
      this.touchDelta = deltaX * this.options.touchMultiplier;
    } else {
      this.touchDelta = deltaY * this.options.touchMultiplier;
    }

    // Update target position
    this.target += this.touchDelta;

    // Clamp target to valid range
    this.target = Math.max(0, Math.min(this.target, this.maxScroll));

    // Prevent default to avoid native scrolling
    e.preventDefault();
  }

  handleTouchEnd() {
    // Reset touch data
    this.touchStart = null;
    this.touchDelta = 0;
  }

  initScrollbar() {
    // Set initial scrollbar dimensions
    this.scrollbarHeight = this.scrollbarTrack.offsetHeight;
    this.scrollbarRatio = this.scrollbarHeight / this.scrollHeight;
    this.scrollbarThumbHeight = Math.max(this.scrollbarHeight * (this.windowHeight / this.scrollHeight), 40);
    this.scrollbarThumb.style.height = `${this.scrollbarThumbHeight}px`;

    // Add drag functionality to scrollbar
    this.scrollbarThumb.addEventListener('mousedown', this.handleScrollbarDragStart.bind(this));
    window.addEventListener('mousemove', this.handleScrollbarDragMove.bind(this));
    window.addEventListener('mouseup', this.handleScrollbarDragEnd.bind(this));
  }

  updateScrollbar() {
    // Calculate thumb position based on scroll position
    const scrollProgress = this.current / this.maxScroll;
    const thumbPosition = scrollProgress * (this.scrollbarHeight - this.scrollbarThumbHeight);

    // Update thumb position
    this.scrollbarThumb.style.transform = `translateY(${thumbPosition}px)`;
  }

  handleScrollbarDragStart(e) {
    // Store initial drag position
    this.isDragging = true;
    this.dragStart = e.clientY;
    this.dragStartTop = parseInt(this.scrollbarThumb.style.transform.replace('translateY(', '').replace('px)', '')) || 0;

    // Add dragging class
    this.scrollbarThumb.classList.add('dragging');

    // Prevent text selection during drag
    e.preventDefault();
  }

  handleScrollbarDragMove(e) {
    if (!this.isDragging) return;

    // Calculate drag distance
    const delta = e.clientY - this.dragStart;
    const dragPosition = this.dragStartTop + delta;

    // Clamp position to scrollbar track
    const maxDragPosition = this.scrollbarHeight - this.scrollbarThumbHeight;
    const clampedPosition = Math.max(0, Math.min(dragPosition, maxDragPosition));

    // Update thumb position
    this.scrollbarThumb.style.transform = `translateY(${clampedPosition}px)`;

    // Calculate and update scroll position
    const scrollProgress = clampedPosition / maxDragPosition;
    this.target = scrollProgress * this.maxScroll;
    window.scrollTo(0, this.target);
  }

  handleScrollbarDragEnd() {
    // Reset dragging state
    this.isDragging = false;
    this.scrollbarThumb.classList.remove('dragging');
  }

  // Public methods
  scrollTo(target, options = {}) {
    // Default options
    const defaultOptions = {
      offset: 0,
      duration: 1000,
      easing: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    };

    const scrollOptions = { ...defaultOptions, ...options };

    // Get target position
    let targetPosition;
    if (typeof target === 'number') {
      targetPosition = target;
    } else if (typeof target === 'string') {
      const element = document.querySelector(target);
      if (element) {
        targetPosition = element.offsetTop;
      } else {
        console.warn(`Element with selector "${target}" not found.`);
        return;
      }
    } else if (target instanceof HTMLElement) {
      targetPosition = target.offsetTop;
    } else {
      console.warn('Invalid target for scrollTo method.');
      return;
    }

    // Apply offset
    targetPosition += scrollOptions.offset;

    // Clamp target position
    targetPosition = Math.max(0, Math.min(targetPosition, this.maxScroll));

    // Animate scroll
    const startPosition = this.current;
    const distance = targetPosition - startPosition;
    const startTime = performance.now();

    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / scrollOptions.duration, 1);
      const easedProgress = scrollOptions.easing(progress);

      // Update target position
      this.target = startPosition + distance * easedProgress;
      window.scrollTo(0, this.target);

      // Continue animation if not complete
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  }

  destroy() {
    debugLog('Destroying smooth scroll');

    try {
      // Remove event listeners
      window.removeEventListener('scroll', this.onScroll);
      window.removeEventListener('resize', this.onResize);

      // Remove touch event listeners if they exist
      if (this.isTouch && this.wrapper) {
        this.wrapper.removeEventListener('touchstart', this.handleTouchStart);
        this.wrapper.removeEventListener('touchmove', this.handleTouchMove);
        this.wrapper.removeEventListener('touchend', this.handleTouchEnd);
      }

      // Remove scrollbar event listeners if they exist
      if (this.scrollbarThumb) {
        this.scrollbarThumb.removeEventListener('mousedown', this.handleScrollbarDragStart);
        window.removeEventListener('mousemove', this.handleScrollbarDragMove);
        window.removeEventListener('mouseup', this.handleScrollbarDragEnd);
      }

      // Restore DOM structure if elements exist
      if (this.virtualScroller && this.wrapper && this.container) {
        // Move all children back to the container
        while (this.virtualScroller.firstChild) {
          this.container.insertBefore(this.virtualScroller.firstChild, this.wrapper);
        }

        // Remove wrapper if it exists
        if (this.wrapper.parentNode === this.container) {
          this.container.removeChild(this.wrapper);
        }

        // Remove spacer if it exists
        if (this.spacer && this.spacer.parentNode === this.container) {
          this.container.removeChild(this.spacer);
        }
      }

      // Remove smooth scroll classes from html and body
      document.documentElement.classList.remove('has-smooth-scroll');
      document.body.classList.remove('has-smooth-scroll');

      // Reset any inline styles
      document.body.style.height = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.width = '';
      document.body.style.overflow = '';

      debugLog('Smooth scroll destroyed successfully');
    } catch (error) {
      console.error('Error destroying smooth scroll:', error);
    }
  }
}

// Initialize smooth scroll when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  debugLog('DOM loaded, initializing smooth scroll');

  try {
    // Check if smooth scrolling is already initialized
    if (window.smoothScroll) {
      debugLog('Smooth scroll already initialized, destroying previous instance');
      window.smoothScroll.destroy();
    }

    // Add smooth scroll classes to html and body
    document.documentElement.classList.add('has-smooth-scroll');
    document.body.classList.add('has-smooth-scroll');

    // Create scroll progress indicator if it doesn't exist
    if (!document.querySelector('.scroll-progress')) {
      const progressBar = document.createElement('div');
      progressBar.className = 'scroll-progress';
      document.body.prepend(progressBar);
      debugLog('Created scroll progress indicator');
    }

    // Create smooth scroll instance with a slight delay to ensure DOM is fully ready
    setTimeout(() => {
      window.smoothScroll = new SmoothScroll({
        container: document.body,
        lerp: 0.08, // Lower values make scrolling smoother but slower
        touchMultiplier: 2.5
      });

      // Update scroll progress indicator on scroll
      window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollProgress = (scrollTop / scrollHeight) * 100;

        const progressBar = document.querySelector('.scroll-progress');
        if (progressBar) {
          progressBar.style.width = `${scrollProgress}%`;
        }
      }, { passive: true });

      debugLog('Smooth scroll instance created');
    }, 100);

    // Add smooth scrolling to all internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        debugLog(`Scrolling to target: ${targetId}`);

        if (window.smoothScroll) {
          window.smoothScroll.scrollTo(targetId, {
            offset: -100, // Offset to account for fixed header
            duration: 1000 // Duration in milliseconds
          });
        } else {
          // Fallback for when smooth scroll is disabled
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            window.scrollTo({
              top: targetElement.offsetTop - 100,
              behavior: 'smooth'
            });
          }
        }
      });
    });
  } catch (error) {
    console.error('Error setting up smooth scroll:', error);

    // Remove smooth scroll classes in case of error
    document.documentElement.classList.remove('has-smooth-scroll');
    document.body.classList.remove('has-smooth-scroll');

    // Enable native smooth scrolling as fallback
    document.documentElement.style.scrollBehavior = 'smooth';
  }
});
