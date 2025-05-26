/**
 * Modern Visitor Counter Animation
 * This script creates a digit-by-digit animation for the visitor counter
 */
document.addEventListener('DOMContentLoaded', function() {
  // Get the visitor count from the data attribute
  const visitorCounterContainer = document.getElementById('visitorCounter');
  if (!visitorCounterContainer) return;

  // Get visitor count from data attribute or use a fallback value
  let visitorCount = visitorCounterContainer.getAttribute('data-count');
  if (!visitorCount) {
    // If no data-count attribute, check for existing counter elements
    const counterElements = document.querySelectorAll('.numbox');
    if (counterElements && counterElements.length > 0) {
      // Try to extract the count from existing counter elements
      try {
        const countArray = Array.from(counterElements).map(el => {
          const computedStyle = window.getComputedStyle(el, '::after');
          const content = computedStyle.content;
          // Extract the first digit from the content
          return content.charAt(1) || '0';
        });
        visitorCount = countArray.join('');
      } catch (e) {
        // Fallback to a default value if extraction fails
        visitorCount = "100000";
      }
    } else {
      // Default fallback value
      visitorCount = "100000";
    }
  }

  // Pad the count with leading zeros to ensure at least 6 digits
  const digits = visitorCount.toString().padStart(6, "0").split("");

  // Clear any existing content
  visitorCounterContainer.innerHTML = '';

  // Create digit wrappers and strips
  digits.forEach((digit, i) => {
    const wrapper = document.createElement("div");
    wrapper.className = "digit-wrapper";
    // Set custom property for staggered animation
    wrapper.style.setProperty('--digit-index', i);

    const strip = document.createElement("div");
    strip.className = "digit-strip";

    // Create spans for all possible digits (0-9)
    for (let d = 0; d <= 9; d++) {
      const span = document.createElement("span");
      span.textContent = d;
      strip.appendChild(span);
    }

    wrapper.appendChild(strip);
    visitorCounterContainer.appendChild(wrapper);

    // Animate with a staggered delay for each digit
    setTimeout(() => {
      // Get the actual height of a digit span
      const digitHeight = strip.querySelector('span').offsetHeight;
      strip.style.transform = `translateY(-${digit * digitHeight}px)`;
    }, 200 * i);
  });
});
