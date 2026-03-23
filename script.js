// Main script for Sujeet's portfolio
// ----------------------------------
// Handles: typing animation, hero background slider, theme toggle,
// mobile navigation, scroll reveal, and skill bar animations.

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("js-enabled");
  setupTypingAnimation();
  setupHeroBackgroundSlider();
  setupThemeToggle();
  setupMobileNav();
  setupActiveNavLink();
  setupScrollReveal();
  setupSkillBarsOnView();
  setupContactForm();
});

// Typing animation for hero subtitle
function setupTypingAnimation() {
  const typedEl = document.getElementById("typed");
  if (!typedEl) return;

  const roles = [
    "Full Stack Developer",
    "Android Developer",
    "Tech Learner",
  ];

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typingSpeed = 90;
  const deletingSpeed = 55;
  const pauseBetweenWords = 900;
  const prefersReducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    typedEl.textContent = roles[0];
    return;
  }

  function type() {
    const current = roles[roleIndex];

    if (!isDeleting) {
      typedEl.textContent = current.slice(0, charIndex + 1);
      charIndex++;

      if (charIndex === current.length) {
        isDeleting = true;
        setTimeout(type, pauseBetweenWords);
        return;
      }
    } else {
      typedEl.textContent = current.slice(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
      }
    }

    const delay = isDeleting ? deletingSpeed : typingSpeed;
    setTimeout(type, delay);
  }

  type();
}

// Rotating hero background images with smooth fade
function setupHeroBackgroundSlider() {
  const heroBg = document.getElementById("hero-bg");
  if (!heroBg) return;

  const images = [
    "images/bg1.jpg",
    "images/bg2.jpg",
    "images/bg3.jpg"
  ];

  let index = 0;
  const prefersReducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function applyBackground() {
    heroBg.classList.remove("fade-in");
    // Small timeout so the fade class re-triggers transition
    requestAnimationFrame(() => {
      heroBg.style.backgroundImage = `url('${images[index]}')`;
      heroBg.classList.add("fade-in");
    });
  }

  applyBackground();

  if (prefersReducedMotion) return;

  setInterval(() => {
    index = (index + 1) % images.length;
    applyBackground();
  }, 5000);
}

// Theme toggle (dark / light) with body classes and localStorage
// Only toggles body classes (dark-mode / light-mode). Does NOT change inline styles
// or hero background. CSS variables handle colors; hero overlay stays semi-transparent
// so background images remain visible in both themes.
function setupThemeToggle() {
  const toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) return;

  const body = document.body;
  const THEME_KEY = "sujeet-portfolio-theme";
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');

  function readSavedTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (error) {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      // Ignore storage errors in restrictive/private browsing contexts.
    }
  }

  // Apply the given theme class to <body> and save preference.
  function applyTheme(theme) {
    const isLight = theme === "light";

    body.classList.toggle("light-mode", isLight);
    body.classList.toggle("dark-mode", !isLight);
    // Backwards-compatible aliases in case older classes exist
    body.classList.toggle("light-theme", isLight);
    body.classList.toggle("dark-theme", !isLight);

    saveTheme(isLight ? "light" : "dark");
    if (themeColorMeta) {
      themeColorMeta.setAttribute("content", isLight ? "#f3f4f6" : "#020617");
    }
    updateIcon(isLight);
  }

  // Update the button icon based on current mode.
  function updateIcon(isLightMode) {
    toggleBtn.setAttribute("aria-pressed", String(isLightMode));
    if (isLightMode) {
      toggleBtn.textContent = "☀️";
      toggleBtn.setAttribute("aria-label", "Switch to dark theme");
    } else {
      toggleBtn.textContent = "🌙";
      toggleBtn.setAttribute("aria-label", "Switch to light theme");
    }
  }

  // Determine initial theme: saved preference -> system preference -> default dark.
  const savedTheme = readSavedTheme();
  if (savedTheme === "light" || savedTheme === "dark") {
    applyTheme(savedTheme);
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
    applyTheme("light");
  } else {
    applyTheme("dark");
  }

  // On click: toggle theme and add a small animation on the button.
  toggleBtn.addEventListener("click", () => {
    const isCurrentlyLight =
      body.classList.contains("light-mode") || body.classList.contains("light-theme");

    applyTheme(isCurrentlyLight ? "dark" : "light");

    // Trigger a quick animation class for feedback.
    toggleBtn.classList.remove("theme-toggle-anim");
    // Force reflow so the animation can restart.
    void toggleBtn.offsetWidth;
    toggleBtn.classList.add("theme-toggle-anim");
  });
}

// Mobile navigation (hamburger) behaviour
function setupMobileNav() {
  const menuBtn = document.getElementById("menu-btn");
  const navLinks = document.getElementById("navLinks");
  if (!menuBtn || !navLinks) return;

  function closeMenu() {
    navLinks.classList.remove("open");
    menuBtn.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  }

  menuBtn.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuBtn.classList.toggle("open", isOpen);
    menuBtn.setAttribute("aria-expanded", String(isOpen));
  });

  // Close menu when clicking a navigation link (on mobile)
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  document.addEventListener("click", (event) => {
    if (!navLinks.classList.contains("open")) return;
    if (navLinks.contains(event.target) || menuBtn.contains(event.target)) return;
    closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

// Highlight active nav link while scrolling sections
function setupActiveNavLink() {
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!navLinks.length) return;

  const sections = Array.from(navLinks)
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  function updateActiveLink() {
    let activeId = "";
    const offset = window.scrollY + 160;

    sections.forEach((section) => {
      if (offset >= section.offsetTop) {
        activeId = section.id;
      }
    });

    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${activeId}`;
      link.classList.toggle("active", isActive);
    });
  }

  updateActiveLink();
  window.addEventListener("scroll", updateActiveLink, { passive: true });
}

// Scroll reveal for elements with .reveal
function setupScrollReveal() {
  const revealEls = document.querySelectorAll(".reveal");
  if (!revealEls.length) return;
  if (!("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          // Once visible, we do not need to observe again
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
    }
  );

  revealEls.forEach((el) => observer.observe(el));
}

// Animate skill bars when they become visible
function setupSkillBarsOnView() {
  const bars = document.querySelectorAll(".progress");
  if (!bars.length) return;
  if (!("IntersectionObserver" in window)) {
    bars.forEach((bar) => {
      const value = bar.getAttribute("data-progress");
      if (value) bar.style.width = value + "%";
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const value = el.getAttribute("data-progress");
          if (value) {
            el.style.width = value + "%";
            el.classList.add("filled");
          }
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  bars.forEach((bar) => observer.observe(bar));
}

// Contact form submission using FormSubmit with AJAX-style behavior.
// Keeps the user on the page, shows a message, and clears the form on success.
function setupContactForm() {
  const form = document.getElementById("contact-form");
  const statusEl = document.getElementById("form-status");
  if (!form || !statusEl || !window.fetch) return;
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Show a temporary "sending" status while the request is in progress
    statusEl.textContent = "Sending your message...";
    statusEl.className = "form-status sending";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
    }

    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        statusEl.textContent = "Message sent successfully. Thank you!";
        statusEl.className = "form-status success";
        form.reset();
      } else {
        statusEl.textContent = "Something went wrong. Please try again.";
        statusEl.className = "form-status error";
      }
    } catch (error) {
      statusEl.textContent = "Network error. Please check your connection and try again.";
      statusEl.className = "form-status error";
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message";
      }
    }
  });
}
