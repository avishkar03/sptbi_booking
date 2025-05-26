document.addEventListener('DOMContentLoaded', function() {
    // Initialize all scrollable containers
    initScrollShadows();
});

function initScrollShadows() {
    // Find all scroll containers
    const scrollContainers = document.querySelectorAll('.scroll-container');
    
    scrollContainers.forEach(container => {
        // Add shadow elements
        const topShadow = document.createElement('div');
        topShadow.className = 'scroll-shadow-top';
        const bottomShadow = document.createElement('div');
        bottomShadow.className = 'scroll-shadow-bottom';
        
        // Add shadows to container
        container.appendChild(topShadow);
        container.appendChild(bottomShadow);
        
        // Wrap content in scroll-content div if not already wrapped
        const content = container.querySelector('.scroll-content');
        if (!content) {
            const wrapper = document.createElement('div');
            wrapper.className = 'scroll-content';
            // Move all content into wrapper
            while (container.firstChild) {
                if (!container.firstChild.classList?.contains('scroll-shadow-top') && 
                    !container.firstChild.classList?.contains('scroll-shadow-bottom')) {
                    wrapper.appendChild(container.firstChild);
                } else {
                    break;
                }
            }
            container.insertBefore(wrapper, topShadow);
        }

        // Get the content element
        const scrollContent = container.querySelector('.scroll-content');
        
        // Update shadows on load
        updateScrollShadows(container, scrollContent);
        
        // Update shadows on scroll
        scrollContent.addEventListener('scroll', () => {
            updateScrollShadows(container, scrollContent);
        });
        
        // Update on content changes
        const observer = new MutationObserver(() => {
            updateScrollShadows(container, scrollContent);
        });
        
        observer.observe(scrollContent, {
            childList: true,
            subtree: true,
            characterData: true
        });
    });
}

function updateScrollShadows(container, content) {
    // Check if can scroll up
    if (content.scrollTop > 0) {
        container.classList.add('can-scroll-up');
    } else {
        container.classList.remove('can-scroll-up');
    }
    
    // Check if can scroll down
    if (content.scrollTop < (content.scrollHeight - content.clientHeight)) {
        container.classList.add('can-scroll-down');
    } else {
        container.classList.remove('can-scroll-down');
    }
}
