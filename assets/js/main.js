// =========================
// Hamburger toggle
// =========================
function initHamburger() {
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });
  }
}

<<<<<<< Updated upstream
// =========================
// Dynamic component loader
// =========================
function loadComponent(id, file) {
  fetch(file)
    .then(res => res.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;
      if (id === "navbar") initHamburger();
    })
    .catch(err => console.error("Error loading component:", err));
}

// =========================
// Toggle navigation for small screens
// =========================
function toggleNav() {
  const topnav = document.getElementById("myTopnav");
  if (topnav.className === "topnav") {
    topnav.className += " responsive";
  } else {
    topnav.className = "topnav";
  }
}

// =========================
// Fade-in page
// =========================
window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

document.addEventListener("DOMContentLoaded", () => {
  loadComponent("navbar", "assets/components/navbar.html");
  loadComponent("footer", "assets/components/footer.html");
  initHamburger();
=======
// Highlight active link after navbar loads
function highlightActiveLink() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const links = document.querySelectorAll(".nav-links a");

  links.forEach(link => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    }
  });
}


// Run after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  loadComponent("navbar", "assets/components/navbar.html");
  loadComponent("footer", "assets/components/footer.html");
  
  // Call highlightActiveLink after a short delay to ensure navbar is loaded
  setTimeout(highlightActiveLink, 300);
});


// Handle mobile menu toggle
document.addEventListener("click", (e) => {
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");

  if (menuToggle && navLinks && (e.target === menuToggle || e.target.closest("#menu-toggle"))) {
    navLinks.classList.toggle("show");
    menuToggle.classList.toggle("active"); // Toggle active class for animation
  } else if (navLinks && navLinks.classList.contains("show") && !e.target.closest(".nav-links")) {
    // Close menu when clicking outside
    navLinks.classList.remove("show");
    menuToggle.classList.remove("active");
  }
>>>>>>> Stashed changes
});
