/**
 * About Section Animations
 * Implements premium-quality, smooth animations for the About Us section images
 * Based on the reference video style with precise scroll-based timing
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check if GSAP and ScrollTrigger are available
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.error('GSAP or ScrollTrigger not loaded. Animations will not work.');
    return;
  }

  // Register ScrollTrigger plugin
  gsap.registerPlugin(ScrollTrigger);

  // Initialize About Section animations
  function initAboutSectionAnimations() {
    const aboutSection = document.querySelector('.about-section');
    if (!aboutSection) return;

    // Define different movement values for desktop and mobile
    const isMobile = window.innerWidth <= 768;

    // Initial setup is now handled in the ScrollTrigger

    // Create a single master timeline for both cards to ensure consistent animation
    const masterTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: '.about-section',
        start: 'top bottom',   // Start as soon as the section enters viewport from bottom
        end: 'top 40%',        // End when the top of the section reaches 40% of viewport
        scrub: 1.5,            // Reduced scrub value for quicker response
        markers: false,
        onUpdate: (self) => {
          // Apply a smoothing function to the progress to prevent jumpiness
          // This creates a more consistent speed throughout the animation
          const rawProgress = self.progress;

          // Apply a custom easing curve that starts quickly but ends smoothly
          // This ensures cards start moving immediately but still finish smoothly
          // Using power2.out means it starts faster and slows down toward the end
          const smoothProgress = gsap.parseEase("power2.out")(rawProgress);

          // Calculate left card position with smoothed progress
          gsap.set('.about-photo .card-left', {
            xPercent: -80 * (1 - smoothProgress),   // Move from -80% to 0%
            yPercent: 5 * (1 - smoothProgress),     // Slight upward movement
            scale: 0.85 + (smoothProgress * 0.15),  // Grow to full size
            rotationY: 5 * (1 - smoothProgress),    // Rotate to flat
            force3D: true,                          // Hardware acceleration
            immediateRender: false                  // Prevent initial flash
          });

          // Calculate right card position with smoothed progress and minimal delay
          // Use a modified progress that starts only slightly later but catches up quickly
          const rightCardDelay = 0.05; // 5% delay (reduced from 10%)
          const rightCardProgress = Math.max(0, (smoothProgress - rightCardDelay) / (1 - rightCardDelay));

          gsap.set('.about-photo .card-right', {
            xPercent: 80 * (1 - rightCardProgress),   // Move from 80% to 0%
            yPercent: 5 * (1 - rightCardProgress),    // Slight upward movement
            scale: 0.85 + (rightCardProgress * 0.15), // Grow to full size
            rotationY: -5 * (1 - rightCardProgress),  // Rotate to flat
            force3D: true,                            // Hardware acceleration
            immediateRender: false                    // Prevent initial flash
          });

          // Apply shadow enhancement with smoothed progress
          const shadowBlur = 30 * smoothProgress; // Increase shadow as cards appear
          gsap.set(['.about-photo .card-left', '.about-photo .card-right'], {
            boxShadow: `0 ${15 + shadowBlur}px ${30 + shadowBlur}px rgba(0, 0, 0, ${0.1 + (smoothProgress * 0.1)})`,
            immediateRender: false
          });
        }
      }
    });

    // Ensure cards are initially positioned with a slight offset so they're partially visible
    gsap.set('.about-photo .card-left', {
      xPercent: -80,  // Start closer to visible area (-80% instead of -100%)
      yPercent: 5,
      scale: 0.85,
      rotationY: 5,
      opacity: 1,
      visibility: 'visible',
      transformOrigin: 'center center',
      transformPerspective: 1000
    });

    gsap.set('.about-photo .card-right', {
      xPercent: 80,   // Start closer to visible area (80% instead of 100%)
      yPercent: 5,
      scale: 0.85,
      rotationY: -5,
      opacity: 1,
      visibility: 'visible',
      transformOrigin: 'center center',
      transformPerspective: 1000
    });

    // Add premium hover effect to images
    const cards = document.querySelectorAll('.about-photo .card-left, .about-photo .card-right');
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          y: -12,
          scale: 1.02,
          boxShadow: '0 30px 50px rgba(28, 67, 134, 0.15)',
          duration: 0.8, // Slower animation for more deliberate feel
          ease: 'power3.out', // More premium easing curve
          overwrite: true
        });

        // Create a named function for the mousemove handler so we can remove it properly
        function handleMouseMove(e) {
          const rect = card.getBoundingClientRect();
          // Calculate mouse position relative to card center
          const xPos = (e.clientX - rect.left) / rect.width - 0.5;
          const yPos = (e.clientY - rect.top) / rect.height - 0.5;

          // Apply subtle rotation (max 2 degrees)
          gsap.to(card, {
            rotationY: xPos * 2,
            rotationX: -yPos * 2,
            duration: 0.5,
            ease: 'power1.out',
            transformPerspective: 1000,
            transformOrigin: 'center center'
          });
        }

        // Add the event listener
        card.addEventListener('mousemove', handleMouseMove);

        // Store the function reference on the card element so we can remove it later
        card._handleMouseMove = handleMouseMove;
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          y: 0,
          scale: 1,
          rotationY: 0,
          rotationX: 0,
          boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
          duration: 1.2, // Even slower return animation
          ease: 'power4.out', // More premium easing curve
          overwrite: true
        });

        // Remove mousemove event using the stored reference
        if (card._handleMouseMove) {
          card.removeEventListener('mousemove', card._handleMouseMove);
        }
      });
    });
  }

  // Initialize animations
  initAboutSectionAnimations();

  // Reveal on scroll for old About Us section images
  const aboutImages = document.querySelectorAll('.about-photo .reveal-image img');

  function revealOnScrollImages() {
    aboutImages.forEach(img => {
      if (img.classList.contains('revealed')) return; // Only animate once
      const rect = img.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      // Trigger when element is 25% in view (adjust 0.75 as needed)
      if (rect.top < windowHeight * 0.75) {
        img.classList.add('revealed');
      }
    });
  }

  // Set up ScrollTrigger for the About Us section to control scroll speed
  ScrollTrigger.create({
    trigger: '.about-section', // The element that triggers the effect
    start: 'top bottom', // Start when the top of the trigger hits the bottom of the viewport
    end: 'bottom top', // End when the bottom of the trigger leaves the top of the viewport
    scrub: 1.5, // Smooth the scroll effect (higher values mean smoother/slower response)
    onUpdate: self => {
      // You could potentially tie other animations here, but scrub alone smooths scroll timing
      // We don't need complex GSAP timelines for just slowing scroll, scrub handles it.
    }
  });

  // Initial check and scroll event listener for image reveal
  revealOnScrollImages();
  window.addEventListener('scroll', revealOnScrollImages);
});
