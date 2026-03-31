// Portfolio Website JavaScript
// - Theme toggle, mobile nav, smooth scroll, animations, focus mode, preloader, etc.

// ======= Preloader =======
window.addEventListener("DOMContentLoaded", () => {
  const preloader = document.getElementById("preloader");
  if (preloader) {
    window.addEventListener("load", () => {
      setTimeout(() => {
        preloader.classList.add("fade");
        setTimeout(() => (preloader.style.display = "none"), 600);
      }, 400);
    });
  }
});

// ======= Theme Toggle =======
const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const THEME_KEY = "portfolio-theme";
function setTheme(theme) {
  root.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
  updateThemeIcon(theme);
}
function updateThemeIcon(theme) {
  const icon = document.querySelector(".theme-icon");
  if (!icon) return;
  icon.innerHTML = "";
  if (theme === "dark") {
    icon.innerHTML =
      '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/></svg>';
  } else {
    icon.innerHTML =
      '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 7.07l-1.41-1.41M6.34 6.34L4.93 4.93m12.02 0l-1.41 1.41M6.34 17.66l-1.41 1.41"/></svg>';
  }
}
function getPreferredTheme() {
  return (
    localStorage.getItem(THEME_KEY) ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light")
  );
}
function initTheme() {
  setTheme(getPreferredTheme());
}
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current =
      root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    setTheme(current);
  });
}
initTheme();

// ======= Navbar Mobile Toggle =======
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const expanded = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", expanded);
  });
  // Close nav on link click (mobile)
  navLinks.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// ======= Smooth Scrolling =======
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const targetId = this.getAttribute("href").slice(1);
    const target = document.getElementById(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      target.focus({ preventScroll: true });
    }
  });
});

// ======= Scroll-triggered Animations =======
function animateOnScroll() {
  const fadeEls = document.querySelectorAll(".fade-in, .timeline-entry");
  const observer = new window.IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );
  fadeEls.forEach((el) => observer.observe(el));
}
window.addEventListener("DOMContentLoaded", animateOnScroll);

// ======= Focus Mode Hover Effect =======
function setupFocusMode() {
  const focusables = document.querySelectorAll(
    ".focusable, .btn, .project-card, .skill-card, .filter-btn, .social-icon, .nav-link, .submit-btn",
  );
  focusables.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      document.body.classList.add("focus-mode");
      focusables.forEach((f) => f.classList.add("focusable"));
    });
    el.addEventListener("mouseleave", () => {
      document.body.classList.remove("focus-mode");
      focusables.forEach((f) => f.classList.remove("focusable"));
    });
  });
}
window.addEventListener("DOMContentLoaded", setupFocusMode);

// ======= Scroll to Top Button =======
const scrollBtn = document.getElementById("scrollToTop");
window.addEventListener("scroll", () => {
  if (!scrollBtn) return;
  if (window.scrollY > 400) {
    scrollBtn.classList.add("visible");
  } else {
    scrollBtn.classList.remove("visible");
  }
});
if (scrollBtn) {
  scrollBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ======= Projects Filtering =======
const filterBtns = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const filter = btn.getAttribute("data-filter");
    projectCards.forEach((card) => {
      if (filter === "all" || card.getAttribute("data-category") === filter) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
  });
});

// ======= Contact Form Validation =======
const contactForm = document.querySelector(".contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
    let valid = true;
    this.querySelectorAll(".form-group").forEach((group) => {
      const input = group.querySelector("input, textarea");
      const error = group.querySelector(".form-error");
      if (input && error) {
        if (!input.value.trim()) {
          error.textContent = "This field is required.";
          valid = false;
        } else if (
          input.type === "email" &&
          !/^\S+@\S+\.\S+$/.test(input.value)
        ) {
          error.textContent = "Enter a valid email.";
          valid = false;
        } else {
          error.textContent = "";
        }
      }
    });
    if (valid) {
      // Simulate successful submission
      contactForm.reset();
      alert("Thank you for your message!");
    }
  });
}

// ======= Set Current Year in Footer =======
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}
