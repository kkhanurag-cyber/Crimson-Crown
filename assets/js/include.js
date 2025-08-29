// Simple HTML include system for navbar and footer
document.addEventListener("DOMContentLoaded", () => {
  const includes = document.querySelectorAll('[data-include]');
  includes.forEach(el => {
    fetch(el.getAttribute('data-include'))
      .then(resp => resp.text())
      .then(data => el.innerHTML = data);
  });
});
