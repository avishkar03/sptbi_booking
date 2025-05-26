// Modern Banner Initialization with Enhanced Navigation
document.addEventListener('DOMContentLoaded', function() {
  console.log("Starting completely new banner slider implementation");

  // First, let's clean up any existing slick instances
  if ($(".autoplay").hasClass('slick-initialized')) {
    $(".autoplay").slick('unslick');
  }

  // Get the container and all slides
  const container = document.querySelector('.autoplay');
  const slides = container.querySelectorAll('.banner-slide');
  const slideCount = slides.length;

  console.log(`Found ${slideCount} slides in the banner`);

  // Remove all slick-related classes and styles that might be causing issues
  const slickElements = document.querySelectorAll('.slick-track, .slick-list, .slick-slide');
  slickElements.forEach(el => {
    el.removeAttribute('style');
    // Remove all slick-related classes
    el.className = el.className.split(' ').filter(c => !c.startsWith('slick-')).join(' ');
  });

  // Add custom CSS to ensure proper slider behavior
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    /* Core slider styles */
    .banner-slider {
      position: relative;
      overflow: hidden;
      width: 100vw;
      height: auto;
      margin: 0;
      padding: 0;
      border: none;
    }

    .banner-slider-track {
      display: flex;
      transition: transform 0.5s ease;
      width: 100%;
      margin: 0;
      padding: 0;
    }

    .banner-slide-item {
      flex: 0 0 100%;
      width: 100%;
      position: relative;
      margin: 0;
      padding: 0;
    }

    /* Hide all slides by default */
    .banner-slide {
      display: none;
      width: 100%;
      margin: 0;
      padding: 0;
      border: none;
      overflow: hidden;
    }

    /* Only show active slide */
    .banner-slide.active {
      display: block;
    }

    /* Ensure images are responsive and fill container */
    .banner-image-container {
      width: 100%;
      height: auto;
      position: relative;
      overflow: hidden;
      padding: 0;
      margin: 0;
    }

    .banner-image-container img {
      display: block;
      width: 100%;
      height: auto;
      object-fit: cover;
      margin: 0;
      padding: 0;
    }
  `;
  document.head.appendChild(styleElement);

  // Create a completely new slider structure
  function setupNewSlider() {
    // First, save all the original content
    const originalContent = container.innerHTML;

    // Clear the container
    container.innerHTML = '';

    // Create a new slider structure
    container.className = 'banner-slider';

    // Re-add the original content
    container.innerHTML = originalContent;

    // Get all slides again after DOM update
    const allSlides = container.querySelectorAll('.banner-slide');

    // Set the first slide as active
    if (allSlides.length > 0) {
      allSlides[0].classList.add('active');
    }

    console.log(`Rebuilt slider with ${allSlides.length} slides`);

    return allSlides.length;
  }

  // Set up the new slider
  const totalSlides = setupNewSlider();

  // Set up pagination dots
  const paginationContainer = document.querySelector('.banner-pagination');
  paginationContainer.innerHTML = '';

  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('div');
    dot.classList.add('pagination-dot');
    if (i === 0) dot.classList.add('active');
    dot.dataset.index = i;

    dot.addEventListener('click', function() {
      goToSlide(i);
    });

    paginationContainer.appendChild(dot);
  }

  // Progress bar animation
  const progressBar = document.querySelector('.banner-progress-bar');
  let animationFrame;
  let startTime;
  const duration = 6000; // 6 seconds per slide

  function animateProgressBar(timestamp) {
    if (!startTime) startTime = timestamp;

    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration * 100, 100);

    progressBar.style.width = `${progress}%`;

    if (elapsed < duration) {
      animationFrame = requestAnimationFrame(animateProgressBar);
    } else {
      // Move to next slide when progress bar completes
      nextSlide();
    }
  }

  function resetProgressBar() {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    progressBar.style.width = '0%';
    startTime = null;
    animationFrame = requestAnimationFrame(animateProgressBar);
  }

  // Start progress bar
  resetProgressBar();

  // Current slide index
  let currentSlide = 0;
  let isPlaying = true;

  // Navigation functions
  function goToSlide(index) {
    // Get all slides
    const slides = container.querySelectorAll('.banner-slide');
    const dots = paginationContainer.querySelectorAll('.pagination-dot');

    // Hide all slides
    slides.forEach(slide => {
      slide.classList.remove('active');
    });

    // Show the target slide
    if (slides[index]) {
      slides[index].classList.add('active');
    }

    // Update pagination dots
    dots.forEach(dot => {
      dot.classList.remove('active');
    });

    if (dots[index]) {
      dots[index].classList.add('active');
    }

    // Update current slide index
    currentSlide = index;

    // Reset progress bar
    resetProgressBar();
  }

  function nextSlide() {
    const nextIndex = (currentSlide + 1) % totalSlides;
    goToSlide(nextIndex);
  }

  function prevSlide() {
    const prevIndex = (currentSlide - 1 + totalSlides) % totalSlides;
    goToSlide(prevIndex);
  }

  // Autoplay control
  function pauseAutoplay() {
    isPlaying = false;
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  }

  function resumeAutoplay() {
    if (!isPlaying) {
      isPlaying = true;
      resetProgressBar();
    }
  }

  // Add hover pause functionality
  const slideshow = document.querySelector('.modern-slideshow');
  slideshow.addEventListener('mouseenter', pauseAutoplay);
  slideshow.addEventListener('mouseleave', resumeAutoplay);

  // Add swipe/drag functionality
  let startX, moveX;
  let isDragging = false;

  // Touch events for mobile
  slideshow.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
    isDragging = true;
    pauseAutoplay();
  });

  slideshow.addEventListener('touchmove', function(e) {
    if (!isDragging) return;
    moveX = e.touches[0].clientX;
  });

  slideshow.addEventListener('touchend', function() {
    if (!isDragging) return;

    if (startX - moveX > 50) { // Swiped left
      nextSlide();
    } else if (moveX - startX > 50) { // Swiped right
      prevSlide();
    }

    isDragging = false;
    resumeAutoplay();
  });

  // Mouse events for desktop
  slideshow.addEventListener('mousedown', function(e) {
    startX = e.clientX;
    isDragging = true;
    slideshow.classList.add('dragging');
    pauseAutoplay();
    e.preventDefault();
  });

  slideshow.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    moveX = e.clientX;
  });

  slideshow.addEventListener('mouseup', function() {
    if (!isDragging) return;

    if (startX - moveX > 50) { // Dragged left
      nextSlide();
    } else if (moveX - startX > 50) { // Dragged right
      prevSlide();
    }

    isDragging = false;
    slideshow.classList.remove('dragging');
    resumeAutoplay();
  });

  slideshow.addEventListener('mouseleave', function() {
    if (isDragging) {
      isDragging = false;
      slideshow.classList.remove('dragging');
    }
  });

  // Add visual cue for dragging
  slideshow.style.cursor = 'grab';

  // Show one-time swipe hint on mobile
  function showSwipeHint() {
    if (window.innerWidth <= 768 && !localStorage.getItem('swipeHintShown')) {
      const hint = document.createElement('div');
      hint.className = 'swipe-hint';
      hint.innerHTML = '<div class="swipe-arrow"></div>';
      slideshow.appendChild(hint);

      // Store in localStorage so we only show it once
      localStorage.setItem('swipeHintShown', 'true');

      // Remove the hint after animation
      setTimeout(() => {
        if (hint.parentNode) {
          hint.parentNode.removeChild(hint);
        }
      }, 3000);
    }
  }

  // Show swipe hint after a short delay
  setTimeout(showSwipeHint, 1000);

  // Add keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  });

  // Debug function to help identify issues
  function debugSlider() {
    console.log("=== SLIDER DEBUG INFO ===");

    // Check container
    const container = document.querySelector('.autoplay');
    console.log("Container:", container);
    console.log("Container class:", container.className);

    // Check slides
    const slides = container.querySelectorAll('.banner-slide');
    console.log(`Found ${slides.length} slides`);

    slides.forEach((slide, index) => {
      console.log(`Slide ${index}:`, {
        isActive: slide.classList.contains('active'),
        display: window.getComputedStyle(slide).display,
        position: window.getComputedStyle(slide).position,
        width: window.getComputedStyle(slide).width,
        height: window.getComputedStyle(slide).height
      });
    });

    // Check pagination
    const dots = document.querySelectorAll('.pagination-dot');
    console.log(`Found ${dots.length} pagination dots`);

    // Check if any slick elements remain
    const slickElements = document.querySelectorAll('[class*="slick-"]');
    console.log(`Found ${slickElements.length} slick elements that might be causing issues`);

    console.log("=== END DEBUG INFO ===");
  }

  // Run debug after a short delay to ensure everything is rendered
  setTimeout(debugSlider, 1000);

  console.log("New banner slider implementation complete");

  // Force refresh the slider after page load to ensure proper display
  window.addEventListener('load', function() {
    // Force redraw of the slider
    const slider = document.querySelector('.modern-slideshow');
    if (slider) {
      slider.style.display = 'none';
      setTimeout(() => {
        slider.style.display = '';
        console.log("Forced slider redraw");

        // Fix for banner images - ensure they display properly
        const bannerImages = document.querySelectorAll('.banner-media');
        bannerImages.forEach(img => {
          // Set specific styles to ensure full image is visible and fills container
          img.style.objectFit = 'cover';
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.maxHeight = 'none';
          img.style.display = 'block';

          // Log image dimensions for debugging
          console.log("Banner image dimensions:", {
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            displayWidth: img.offsetWidth,
            displayHeight: img.offsetHeight
          });

          // Add modern overlay to each slide
          const slide = img.closest('.banner-slide');
          if (slide && !slide.querySelector('.banner-modern-overlay')) {
            // Create modern overlay
            const overlay = document.createElement('div');
            overlay.className = 'banner-modern-overlay';

            // Create content container
            const contentContainer = document.createElement('div');
            contentContainer.className = 'banner-content-container';

            // Add content based on slide index or data attributes
            const slideIndex = Array.from(slide.parentNode.children).indexOf(slide);
            const titles = [
              'Turn Your Idea Into Reality',
              'Innovation Starts Here',
              'Building Tomorrow\'s Technology'
            ];

            const descriptions = [
              'Get support and funding for your startup at SP-TBI',
              'Join our incubation program and transform your vision',
              'Access mentorship, resources and networking opportunities'
            ];

            // Create title element
            const title = document.createElement('h2');
            title.style.fontSize = '28px';
            title.style.fontWeight = '600';
            title.style.marginBottom = '15px';
            title.style.fontFamily = 'Anuphan, sans-serif';
            title.textContent = titles[slideIndex % titles.length];

            // Create description element
            const description = document.createElement('p');
            description.style.fontSize = '16px';
            description.style.lineHeight = '1.6';
            description.style.marginBottom = '20px';
            description.style.fontFamily = 'Anuphan, sans-serif';
            description.textContent = descriptions[slideIndex % descriptions.length];

            // Create button element
            const button = document.createElement('a');
            button.className = 'banner-button';
            button.href = '#';
            button.textContent = 'Learn More';

            // Add click event to button
            button.addEventListener('click', function(e) {
              e.preventDefault();
              // You can add custom action here, like scrolling to a section
              const aboutSection = document.querySelector('.about-section');
              if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
              }
            });

            // Add elements to container
            contentContainer.appendChild(title);
            contentContainer.appendChild(description);
            contentContainer.appendChild(button);
            overlay.appendChild(contentContainer);

            // Add overlay to slide
            slide.appendChild(overlay);
          }
        });

        debugSlider();
      }, 50);
    }
  });
});

// Original slider initialization (commented out)
// $(".autoplay").slick({
//   slidesToShow: 1,
//   slidesToScroll: 1,
//   autoplay: true,
//   autoplaySpeed: 2000,
//   prevArrow: $(".prev-button"),
//   nextArrow: $(".next-button"),
// });

// $(".variable-width").slick({
//   dots: true,
//   infinite: true,
//   slidesToShow: 1,
//   centerMode: true,
//   variableWidth: true,
//   autoplay: true,
//   autoplaySpeed: 1000,
// });

// Removed custom animation code for About section to avoid conflicts with scroll-animations.js
// Animation is now handled by the scroll-animations.js file

$(".facility").on("click", function () {
  $(".card").toggleClass("flipped");
});

const swiper = new Swiper(".swiper", {
  // Optional parameters
  autoHeight: true,
  loop: true,

  // If we need pagination
  pagination: {
    el: ".swiper-pagination",
  },

  // Navigation arrows
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },

  // And if we need scrollbar
  scrollbar: {
    el: ".swiper-scrollbar",
  },
});

$(".customer-logos").slick({
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    variablewidth: true,
    autoplaySpeed: 1500,
    arrows: false,
    dots: false,
    pauseOnHover: false,
  centerMode: true,
  variableWidth: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 520,
        settings: {
          slidesToShow: 3,
        },
      },
    ],
  });

var startups = parseInt(document.getElementById("startups").value);
var current = parseInt(document.getElementById("currentstartups").value);
var graduated = parseInt(document.getElementById("graduatedstartups").value);

const data1 = {
  labels: ["Current", "Graduated"],
  datasets: [
    {
      data: [current, graduated],
      backgroundColor: ["#1c4386", "lightblue"],
      borderWidth: 0,
      borderRadius: 0,
      borderJoinStyle: "round",
      weight: 2,
      hoverOffset: 50,
      hoverBackgroundColor: ["#1c4386", "lightblue"],
    },
  ],
};

const doughnutLabel = {
  id: "doughnutLabel",
  beforeDatasetsDraw(chart, args, pluginOptions) {
    const { ctx, data } = chart;
    ctx.save();
    const xCoor = chart.getDatasetMeta(0).data[0].x;
    const yCoor = chart.getDatasetMeta(0).data[0].y;
    ctx.font = "bold 40px  sans-serif";
    ctx.fillStyle = "#1c4386";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      startups,
      xCoor,
      yCoor
    );
  },
};

document.addEventListener("DOMContentLoaded", function () {
  // Get the canvas elements and create 2d contexts
  const ctx1 = document.getElementById("doughnutChart1").getContext("2d");

  // Create the doughnut charts
  const doughnutChart1 = new Chart(ctx1, {
    type: "doughnut",
    data: data1,
    options: {
      radius: 90,
      cutout: 75,
      onClick: function (event, elements) {
        if (elements && elements.length > 0) {
          // Get the index of the clicked segment
          const segmentIndex = elements[0].index;
          console.log(segmentIndex);
          // Send an AJAX request to the server
          fetch("/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": getCookie("csrftoken"), // Assuming you use Django CSRF protection
            },
            body: JSON.stringify({ segmentIndex }),
          }).then((response) => response.json());
        }
      },
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: {
            font: {
              family: "Poppins", // Set the font family
              size: 14, // Set the font size in pixels
              weight: "bold", // Set the font weight (e.g., 'normal', 'bold', etc.)
              style: "italic", // Set the font style (e.g., 'normal', 'italic', 'oblique')
            },
          },
        },
        title: {
          display: true,
          text: "Startups Incubated",
          font: {
            size: 30,
            family: "Poppins",
          },
        },
      },
      animation: {
        animateScale: true,
        animateRotate: true,
      },
    },
    plugins: [doughnutLabel],
  });
});

function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Card overlay functionality
document.addEventListener('DOMContentLoaded', function() {
  console.log("Setting up card overlay functionality");

  // Debug: Check if we can find the learn-more buttons
  const learnMoreButtons = document.querySelectorAll('.learn-more');
  console.log("Found " + learnMoreButtons.length + " learn-more buttons");

  // Add click event listeners to all "Learn More" buttons
  learnMoreButtons.forEach(btn => {
    console.log("Adding click listener to button:", btn);
    btn.addEventListener('click', function(e) {
      console.log("Learn More button clicked");
      e.preventDefault();
      // Find the closest modern-card parent and add the show-overlay class
      const card = this.closest('.modern-card');
      console.log("Found parent card:", card);
      card.classList.add('show-overlay');
      console.log("Added show-overlay class");
    });
  });

  // Add click event listeners to all close buttons
  const closeButtons = document.querySelectorAll('.close-btn');
  console.log("Found " + closeButtons.length + " close buttons");

  closeButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      console.log("Close button clicked");
      // Find the closest modern-card parent and remove the show-overlay class
      const card = this.closest('.modern-card');
      card.classList.remove('show-overlay');
      console.log("Removed show-overlay class");
    });
  });

  // Close overlay when clicking outside the content (on the overlay itself)
  document.querySelectorAll('.card-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
      // Only close if the click was directly on the overlay, not on its children
      if (e.target === this) {
        console.log("Clicked on overlay background");
        this.closest('.modern-card').classList.remove('show-overlay');
      }
    });
  });

  // Close overlay with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      console.log("Escape key pressed");
      document.querySelectorAll('.modern-card.show-overlay').forEach(card => {
        card.classList.remove('show-overlay');
      });
    }
  });
});

// Legacy modal functionality (kept for backward compatibility)
$(".button").click(function () {
  // Get the content
  var buttonId = $(this).attr("id");
  console.log("Button clicked: " + buttonId);

  // Get the title from the button element
  var titleid = document.getElementById(buttonId).innerHTML;
  console.log("Title: " + titleid);

  // Get the modal content
  var modalId = "#modaltitle-" + buttonId;
  console.log("Modal ID: " + modalId);
  var modalTitle = document.querySelector(modalId).value;
  console.log("Modal content: " + modalTitle);

  // Update modal content with enhanced styling
  document.querySelector(".modal").innerHTML =
    "<h2 style='color: #1c4386; font-family: Anuphan, sans-serif; margin-bottom: 15px;'>" +
    titleid +
    "</h2><hr style='border: 0; height: 2px; background: linear-gradient(to right, transparent, #1c4386, transparent); margin: 15px 0;'><p style='line-height: 1.6; color: #333;'>" +
    modalTitle +
    "</p>";

  // Show the modal with animation
  $("#modal-container").removeAttr("class").addClass("five");
  $("body").addClass("modal-active");
});

$("#modal-container").click(function () {
  $(this).addClass("out");
  $("body").removeClass("modal-active");
});