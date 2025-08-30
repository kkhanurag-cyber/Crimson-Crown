// Function to load components dynamically
function loadComponent(id, file) {
  fetch(file)
    .then(response => response.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;
    })
    .catch(error => console.error("Error loading component:", error));
}



// Run after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  loadComponent("navbar", "assets/components/navbar.html");
  loadComponent("footer", "assets/components/footer.html");
});

// main.js
window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});