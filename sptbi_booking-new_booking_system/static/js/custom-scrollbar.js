/**
 * Custom Scrollbar Component
 * Inspired by Delassus.com
 */

class CustomScrollbar {
  constructor(options = {}) {
    // Default options
    this.options = {
      container: document.body,
      scrollbarClass: 'custom-scrollbar',
      trackClass: 'custom-scrollbar-track',
      thumbClass: 'custom-scrollbar-thumb',
      minThumbHeight: 40,
      hideTimeout: 1500,
      ...options
    };

    // State variables
    this.isVisible = false;
    this.isDragging = false;
    this.dragStartY = 0;
    this.dragStartTop = 0;
    this.hideTimeoutId = null;
    this.scrollHeight = 0;
    this.windowHeight = 0;
    this.scrollbarHeight = 0;
    this.thumbHeight = 0;
    this.scrollRatio = 0;
    this.maxScrollTop = 0;

    // Bind methods
    this.onScroll = this.onScroll.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onThumbMouseDown = this.onThumbMouseDown.bind(this);
    this.onDocumentMouseMove = this.onDocumentMouseMove.bind(this);
    this.onDocumentMouseUp = this.onDocumentMouseUp.bind(this);
    this.update = this.update.bind(this);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.scheduleHide = this.scheduleHide.bind(this);

    // Initialize
    this.init();
  }

  init() {
    // Create scrollbar elements
    this.createScrollbar();
    
    // Set initial values
    this.setValues();
    
    // Add event listeners
    this.addEventListeners();
    
    // Initial update
    this.update();
    
    console.log('Custom scrollbar initialized');
  }

  createScrollbar() {
    // Create scrollbar container
    this.scrollbar = document.createElement('div');
    this.scrollbar.className = this.options.scrollbarClass;
    
    // Create scrollbar track
    this.track = document.createElement('div');
    this.track.className = this.options.trackClass;
    
    // Create scrollbar thumb
    this.thumb = document.createElement('div');
    this.thumb.className = this.options.thumbClass;
    
    // Assemble scrollbar
    this.track.appendChild(this.thumb);
    this.scrollbar.appendChild(this.track);
    
    // Add to document
    document.body.appendChild(this.scrollbar);
  }

  setValues() {
    // Get dimensions
    this.scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    this.windowHeight = window.innerHeight;
    this.scrollbarHeight = this.track.offsetHeight;
    this.maxScrollTop = this.scrollHeight - this.windowHeight;
    
    // Calculate thumb height
    this.thumbHeight = Math.max(
      (this.windowHeight / this.scrollHeight) * this.scrollbarHeight,
      this.options.minThumbHeight
    );
    
    // Set thumb height
    this.thumb.style.height = `${this.thumbHeight}px`;
    
    // Calculate scroll ratio
    this.scrollRatio = (this.scrollbarHeight - this.thumbHeight) / this.maxScrollTop;
  }

  addEventListeners() {
    // Scroll event
    window.addEventListener('scroll', this.onScroll, { passive: true });
    
    // Resize event
    window.addEventListener('resize', this.onResize, { passive: true });
    
    // Mouse events for scrollbar
    this.scrollbar.addEventListener('mouseenter', this.onMouseEnter);
    this.scrollbar.addEventListener('mouseleave', this.onMouseLeave);
    this.thumb.addEventListener('mousedown', this.onThumbMouseDown);
    
    // Document mouse events for dragging
    document.addEventListener('mousemove', this.onDocumentMouseMove);
    document.addEventListener('mouseup', this.onDocumentMouseUp);
  }

  onScroll() {
    // Show scrollbar
    this.show();
    
    // Update scrollbar position
    this.update();
    
    // Schedule hiding scrollbar
    this.scheduleHide();
  }

  onResize() {
    // Recalculate values
    this.setValues();
    
    // Update scrollbar position
    this.update();
  }

  onMouseMove() {
    // Show scrollbar
    this.show();
    
    // Cancel hide timeout
    this.cancelHideTimeout();
  }

  onMouseEnter() {
    // Show scrollbar
    this.show();
    
    // Cancel hide timeout
    this.cancelHideTimeout();
  }

  onMouseLeave() {
    // Schedule hiding scrollbar if not dragging
    if (!this.isDragging) {
      this.scheduleHide();
    }
  }

  onThumbMouseDown(e) {
    // Start dragging
    this.isDragging = true;
    
    // Store initial position
    this.dragStartY = e.clientY;
    this.dragStartTop = this.getThumbTop();
    
    // Add dragging class
    this.thumb.classList.add('dragging');
    
    // Show scrollbar
    this.show();
    
    // Cancel hide timeout
    this.cancelHideTimeout();
    
    // Prevent text selection
    e.preventDefault();
  }

  onDocumentMouseMove(e) {
    if (!this.isDragging) return;
    
    // Calculate new position
    const delta = e.clientY - this.dragStartY;
    const newTop = this.dragStartTop + delta;
    
    // Clamp position
    const maxTop = this.scrollbarHeight - this.thumbHeight;
    const clampedTop = Math.max(0, Math.min(newTop, maxTop));
    
    // Set thumb position
    this.thumb.style.transform = `translateY(${clampedTop}px)`;
    
    // Calculate and set scroll position
    const scrollTop = clampedTop / this.scrollRatio;
    window.scrollTo(0, scrollTop);
  }

  onDocumentMouseUp() {
    if (!this.isDragging) return;
    
    // Stop dragging
    this.isDragging = false;
    
    // Remove dragging class
    this.thumb.classList.remove('dragging');
    
    // Schedule hiding scrollbar
    this.scheduleHide();
  }

  update() {
    // Calculate thumb position
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const thumbTop = scrollTop * this.scrollRatio;
    
    // Update thumb position
    this.thumb.style.transform = `translateY(${thumbTop}px)`;
  }

  getThumbTop() {
    // Get current thumb position
    const transform = this.thumb.style.transform;
    const translateY = transform.replace('translateY(', '').replace('px)', '');
    return parseFloat(translateY) || 0;
  }

  show() {
    if (this.isVisible) return;
    
    // Show scrollbar
    this.scrollbar.style.opacity = '1';
    this.isVisible = true;
  }

  hide() {
    if (!this.isVisible || this.isDragging) return;
    
    // Hide scrollbar
    this.scrollbar.style.opacity = '0';
    this.isVisible = false;
  }

  scheduleHide() {
    // Cancel any existing timeout
    this.cancelHideTimeout();
    
    // Set new timeout
    this.hideTimeoutId = setTimeout(this.hide, this.options.hideTimeout);
  }

  cancelHideTimeout() {
    if (this.hideTimeoutId) {
      clearTimeout(this.hideTimeoutId);
      this.hideTimeoutId = null;
    }
  }

  destroy() {
    // Remove event listeners
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onResize);
    this.scrollbar.removeEventListener('mouseenter', this.onMouseEnter);
    this.scrollbar.removeEventListener('mouseleave', this.onMouseLeave);
    this.thumb.removeEventListener('mousedown', this.onThumbMouseDown);
    document.removeEventListener('mousemove', this.onDocumentMouseMove);
    document.removeEventListener('mouseup', this.onDocumentMouseUp);
    
    // Remove scrollbar from DOM
    if (this.scrollbar.parentNode) {
      this.scrollbar.parentNode.removeChild(this.scrollbar);
    }
    
    // Cancel hide timeout
    this.cancelHideTimeout();
    
    console.log('Custom scrollbar destroyed');
  }
}

// Initialize custom scrollbar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Create custom scrollbar
  window.customScrollbar = new CustomScrollbar();
});
