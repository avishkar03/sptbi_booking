var loader = document.getElementById("preloader");
window.addEventListener("load", function () {
  loader.style.display = "none";
});

const scrollToFooter = () => {
  const footer = document.querySelector("#footer");
  footer.scrollIntoView({ behavior: "smooth" });
};

const link = document.querySelector('a[href="#footer"]');
link.addEventListener("click", scrollToFooter);

// No custom ticker initialization needed - using HTML marquee tag

// Enhanced scroll event handler for sticky navbar
window.addEventListener("scroll", function () {
  const header = document.querySelector(".header");
  const navbar = document.querySelector(".navbar");
  const newsTicker = document.querySelector(".news-ticker-container");
  const hamburger = document.querySelector(".menu-container");
  const scrolled = window.scrollY > header.offsetHeight;

  if (scrolled) {
    // Hide header
    header.classList.add("header-hidden");

    // Make navbar sticky and visible with smooth transition
    navbar.classList.add("navbar-visible");
    navbar.classList.add("sticky");

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

    // Apply inline styles to ensure it works
    navbar.style.position = "fixed";
    navbar.style.top = "0";
    navbar.style.left = "0";
    navbar.style.width = "100%";
    navbar.style.zIndex = "9999";
    navbar.style.opacity = "1";

    // Add padding to body to prevent content jump
    const totalHeight = navbar.offsetHeight + (newsTicker ? newsTicker.offsetHeight : 0);
    document.body.style.paddingTop = totalHeight + "px";
  } else {
    // Show header
    header.classList.remove("header-hidden");

    // Remove sticky and visible classes from navbar
    navbar.classList.remove("navbar-visible");
    navbar.classList.remove("sticky");

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

    // Reset inline styles
    navbar.style.position = "";
    navbar.style.top = "";
    navbar.style.left = "";
    navbar.style.width = "";
    navbar.style.zIndex = "";
    navbar.style.opacity = "";

    // Reset body padding
    document.body.style.paddingTop = "0";
  }
});

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
