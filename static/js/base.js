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

window.addEventListener("scroll", function () {
  const header = document.querySelector(".header");
  const navbar = document.querySelector(".navbar");
  const hamburger = document.querySelector(".menu-container");
  const scrolled = window.scrollY > header.offsetHeight;

  if (scrolled) {
    header.classList.add("header-hidden");
    navbar.classList.add("navbar-visible");
    navbar.classList.add("sticky");
    hamburger.classList.add("sticky");
  } else {
    header.classList.remove("header-hidden");
    navbar.classList.remove("navbar-visible");
    navbar.classList.remove("sticky");
    hamburger.classList.remove("sticky");
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
