async function loadIncludes() {
  const includeElements = document.querySelectorAll("[data-include]");
  
  for (let el of includeElements) {
    const file = el.getAttribute("data-include");
    try {
      const response = await fetch(file);
      if (response.ok) {
        el.innerHTML = await response.text();
      } else {
        el.innerHTML = `<p>Include not found: ${file}</p>`;
      }
    } catch (err) {
      console.error("Error loading include:", file, err);
    }
  }
}

// Run when page loads
document.addEventListener("DOMContentLoaded", loadIncludes);
