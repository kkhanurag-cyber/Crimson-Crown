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
});
