// Function to load external HTML (header/footer)
function loadHTML(id, file) {
  fetch(file)
    .then(response => {
      if (!response.ok) throw new Error("Page not found " + file);
      return response.text();
    })
    .then(data => {
      document.getElementById(id).innerHTML = data;
    })
    .catch(error => console.error(error));
}

// Load header and footer automatically
document.addEventListener("DOMContentLoaded", () => {
  loadHTML("header", "includes/header.html");
  loadHTML("footer", "includes/footer.html");
});
// Function to load partial HTML (navbar/footer)
function loadHTML(id, file) {
  fetch(file)
    .then(response => response.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;
    })
    .catch(error => console.error("Error loading file:", file, error));
}
