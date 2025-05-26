var loader = document.getElementById("preloader");
window.addEventListener("load", function () {
  loader.style.display = "none";
});

const scrollToFooter = () => {
  const footer = document.querySelector("#footer");
  footer.scrollIntoView({ behavior: "smooth" });
};

document.addEventListener('DOMContentLoaded', function() {
  const links = document.querySelectorAll('a[href="#footer"]');
  links.forEach(link => {
    link.addEventListener("click", scrollToFooter);
  });
});

// No custom ticker initialization needed - using HTML marquee tag

// Improved scroll event handler for smooth sticky navbar
(function() {
  // Variables for throttling scroll events
  let lastScrollTop = 0;
  let ticking = false;
  let isSticky = false;
  let stickyTransitionInProgress = false;

  // Get elements once to improve performance
  const header = document.querySelector(".header");
  const navbar = document.querySelector(".navbar");
  const newsTicker = document.querySelector(".news-ticker-container");
  const hamburger = document.querySelector(".menu-container");

  // Function to handle the sticky transition
  function handleStickyTransition(scrolled) {
    if (scrolled && !isSticky) {
      // Prepare for sticky transition
      if (!stickyTransitionInProgress) {
        stickyTransitionInProgress = true;

        // Hide the original navbar during transition to prevent text compression
        navbar.style.opacity = "0";

        // Create a static clone of the navbar that won't change during transition
        const navbarClone = navbar.cloneNode(true);
        navbarClone.classList.remove("navbar-visible", "sticky", "sticky-animate", "preparing-sticky");
        navbarClone.classList.add("navbar-clone");
        navbarClone.style.position = "fixed";
        navbarClone.style.top = "0";
        navbarClone.style.left = "0";
        navbarClone.style.width = "100%";
        navbarClone.style.zIndex = "10000";
        navbarClone.style.opacity = "1";
        navbarClone.style.pointerEvents = "none";
        document.body.appendChild(navbarClone);

        // Prepare the real navbar for the final state without intermediate classes
        // Apply all classes at once in the next frame to avoid intermediate states
        requestAnimationFrame(() => {
          // Hide header
          header.classList.add("header-hidden");

          // Make news ticker sticky if it exists
          if (newsTicker) {
            newsTicker.style.position = "fixed";
            newsTicker.style.top = navbar.offsetHeight + "px";
            newsTicker.style.left = "0";
            newsTicker.style.width = "100%";
            newsTicker.style.zIndex = "9998"; // Just below navbar
            newsTicker.style.boxShadow = "0 3px 5px rgba(0,0,0,0.2)";
          }

          // Handle hamburger menu for mobile
          if (hamburger) {
            hamburger.classList.add("sticky");
          }

          // Add padding to body to prevent content jump
          const totalHeight = navbar.offsetHeight + (newsTicker ? newsTicker.offsetHeight : 0);
          document.body.style.paddingTop = totalHeight + "px";

          // Apply the final state classes directly
          navbar.className = "navbar sticky navbar-visible";

          // Fade in the real navbar after a short delay
          setTimeout(() => {
            navbar.style.opacity = "1";

            // Remove the clone after the real navbar is visible
            if (document.querySelector('.navbar-clone')) {
              document.body.removeChild(document.querySelector('.navbar-clone'));
            }

            stickyTransitionInProgress = false;
            isSticky = true;
          }, 50);
        });
      }
    } else if (!scrolled && isSticky) {
      // Reset to non-sticky state
      isSticky = false;

      // Create a static clone of the navbar for the transition back
      const navbarClone = navbar.cloneNode(true);
      navbarClone.classList.add("navbar-clone");
      navbarClone.style.position = "fixed";
      navbarClone.style.top = "0";
      navbarClone.style.left = "0";
      navbarClone.style.width = "100%";
      navbarClone.style.zIndex = "10000";
      navbarClone.style.opacity = "1";
      navbarClone.style.pointerEvents = "none";
      document.body.appendChild(navbarClone);

      // Hide the real navbar
      navbar.style.opacity = "0";

      // Show header
      header.classList.remove("header-hidden");

      // Reset the navbar class in one step
      navbar.className = "navbar";

      // Reset news ticker position if it exists
      if (newsTicker) {
        newsTicker.style.position = "";
        newsTicker.style.top = "";
        newsTicker.style.left = "";
        newsTicker.style.width = "";
        newsTicker.style.zIndex = "";
        newsTicker.style.boxShadow = "";
      }

      // Handle hamburger menu for mobile
      if (hamburger) {
        hamburger.classList.remove("sticky");
      }

      // Reset body padding
      document.body.style.paddingTop = "0";

      // Fade in the navbar after a short delay
      setTimeout(() => {
        navbar.style.opacity = "1";

        // Remove the clone
        if (document.querySelector('.navbar-clone')) {
          document.body.removeChild(document.querySelector('.navbar-clone'));
        }
      }, 50);
    }
  }

  // Throttled scroll event handler
  function onScroll() {
    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrolled = currentScrollTop > header.offsetHeight;
        handleStickyTransition(scrolled);
        lastScrollTop = currentScrollTop;
        ticking = false;
      });

      ticking = true;
    }
  }

  // Add scroll event listener
  window.addEventListener("scroll", onScroll, { passive: true });

  // Initial check on page load
  document.addEventListener("DOMContentLoaded", () => {
    onScroll();
  });
})();

const menuIcon = document.querySelector(".menu-icon");
const menuItems = document.querySelector(".menu-items");

menuIcon.addEventListener("click", (event) => {
  event.stopPropagation();
  menuItems.classList.toggle("show");
});

const dropdownItems = document.querySelectorAll(".menu-items li");
dropdownItems.forEach((item) => {
  const subMenu = item.querySelector(".sub-hammenu");
  if (subMenu) {
    item.addEventListener("click", (event) => {
      event.stopPropagation();
      subMenu.classList.toggle("show");
    });
  }
});

// Close the menu when clicking outside
document.addEventListener("click", (event) => {
  if (!menuItems.contains(event.target)) {
    menuItems.classList.remove("show");
    const subMenu = document.querySelectorAll(".menu-items li .show");
    subMenu.forEach((item) => {
      item.classList.remove("show");
    });
  }
});

// Function to check if an element is in the viewport
/*  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  // Function to handle scroll event and trigger the animation
  function handleScroll() {
    const elementToAnimate = document.querySelector('.footer-wrapper');
    const scrollTrigger = document.getElementById('scroll-trigger');

    if (isElementInViewport(scrollTrigger)) {
      elementToAnimate.classList.add('animated'); // Add the CSS class to trigger the animation
      window.removeEventListener('scroll', handleScroll); // Remove the event listener once animation is triggered
    }
  }

  // Add the scroll event listener
  window.addEventListener('scroll', handleScroll);
  */
  $(document).ready(function () {
    $(".menu-icon").click(function () {
      $(this).toggleClass("is-active");
    });
  });
