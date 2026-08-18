document.addEventListener('DOMContentLoaded', function () {
  const yearNode = document.getElementById('year');
  if (yearNode) yearNode.textContent = new Date().getFullYear();

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      const href = link.getAttribute('href');
      if (!href || href.length <= 1) return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  const revealEls = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || revealEls.length === 0) {
    revealEls.forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  const observer = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        
        // Trigger skills animation
        const skillsGrid = entry.target.querySelector('.skills-grid');
        if (skillsGrid) {
          skillsGrid.classList.add('reveal-ready');
        }
        
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(function (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    observer.observe(el);
  });

  // Skills Interactive Animations
  const skillsSection = document.getElementById('skills');
  if (skillsSection) {
    const skillsGrid = skillsSection.querySelector('.skills-grid');
    const skillItems = skillsSection.querySelectorAll('.skill-card li');
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobileOrTouch = () => {
      return window.innerWidth < 768 || ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    };

    // Only enable magnetic hover on desktop without reduced motion
    if (!isReducedMotion && !isMobileOrTouch() && skillItems.length > 0) {
      let mouseX = 0;
      let mouseY = 0;
      let isInSkillsSection = false;

      skillsSection.addEventListener('mouseenter', function () {
        isInSkillsSection = true;
        if (skillsGrid) skillsGrid.classList.add('active-cursor');
      });

      skillsSection.addEventListener('mouseleave', function () {
        isInSkillsSection = false;
        if (skillsGrid) skillsGrid.classList.remove('active-cursor');
        skillItems.forEach(function (item) {
          item.style.transform = 'translateY(0) scale(1)';
        });
      });

      skillsSection.addEventListener('mousemove', function (e) {
        if (!isInSkillsSection) return;
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Update cursor glow position
        const glowEl = skillsGrid;
        if (glowEl && glowEl.style) {
          glowEl.style.setProperty('--cursor-x', mouseX + 'px');
          glowEl.style.setProperty('--cursor-y', mouseY + 'px');
        }

        // Magnetic hover effect for each skill
        skillItems.forEach(function (item) {
          const rect = item.getBoundingClientRect();
          const itemX = rect.left + rect.width / 2;
          const itemY = rect.top + rect.height / 2;

          const distX = mouseX - itemX;
          const distY = mouseY - itemY;
          const distance = Math.sqrt(distX * distX + distY * distY);
          const maxDistance = 120;

          if (distance < maxDistance) {
            const force = (maxDistance - distance) / maxDistance;
            const moveX = (distX / distance) * force * 6;
            const moveY = (distY / distance) * force * 6;
            item.style.transform = 'translate(' + moveX + 'px, ' + moveY + 'px) scale(1.02)';
          } else {
            item.style.transform = 'translate(0, 0) scale(1)';
          }
        });
      });
    }
  }

  // Contact Form Modal Functionality
  const contactModal = document.getElementById('contactModal');
  const requestInfoBtn = document.querySelector('.request-info-btn');
  const modalClose = document.getElementById('modalClose');
  const modalOverlay = document.getElementById('modalOverlay');
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (requestInfoBtn && contactModal) {
    // Open modal
    requestInfoBtn.addEventListener('click', function () {
      contactModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    // Close modal
    function closeModal() {
      contactModal.classList.remove('active');
      document.body.style.overflow = '';
      contactForm.reset();
      formSuccess.classList.remove('show');
      clearAllErrors();
    }

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && contactModal.classList.contains('active')) {
        closeModal();
      }
    });

    // Form validation
    function validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }

    function validatePhone(phone) {
      if (!phone) return true; // Phone is optional
      const phoneRegex = /^[\d\s()\-+.]+$/;
      return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
    }

    function clearError(fieldId) {
      const errorEl = document.getElementById(fieldId + 'Error');
      if (errorEl) {
        errorEl.classList.remove('show');
        errorEl.textContent = '';
      }
    }

    function showError(fieldId, message) {
      const errorEl = document.getElementById(fieldId + 'Error');
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('show');
      }
    }

    function clearAllErrors() {
      const errorEls = document.querySelectorAll('.form-error');
      errorEls.forEach(function (el) {
        el.classList.remove('show');
        el.textContent = '';
      });
    }

    // Form submission
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearAllErrors();

      const firstName = document.getElementById('firstName').value.trim();
      const lastName = document.getElementById('lastName').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const message = document.getElementById('message').value.trim();

      let isValid = true;

      // Validate first name
      if (!firstName) {
        showError('firstName', 'First name is required');
        isValid = false;
      }

      // Validate last name
      if (!lastName) {
        showError('lastName', 'Last name is required');
        isValid = false;
      }

      // Validate email
      if (!email) {
        showError('email', 'Email is required');
        isValid = false;
      } else if (!validateEmail(email)) {
        showError('email', 'Please enter a valid email');
        isValid = false;
      }

      // Validate phone if provided
      if (phone && !validatePhone(phone)) {
        showError('phone', 'Please enter a valid phone number');
        isValid = false;
      }

      // Validate message
      if (!message) {
        showError('message', 'Message is required');
        isValid = false;
      }

      if (isValid) {
        // Submit form using Formspree
        const formData = new FormData(contactForm);
        const submitBtn = contactForm.querySelector('button[type=\"submit\"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'SENDING...';

        fetch(contactForm.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        })
          .then(function (response) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
            if (response.ok) {
              formSuccess.classList.add('show');
              contactForm.reset();
              setTimeout(function () {
                closeModal();
              }, 2000);
            } else {
              showError('message', 'There was an error sending your message. Please try again.');
            }
          })
          .catch(function (error) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
            showError('message', 'There was an error sending your message. Please try again.');
            console.error('Error:', error);
          });
      }
    });
  }
});
