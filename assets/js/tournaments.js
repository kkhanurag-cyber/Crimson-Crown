// ---------- API ----------
const SHEETDB_BASE = 'https://sheetdb.io/api/v1/e5p48zbm0w5ph';
const SHEETDB_TOURNAMENTS = `${SHEETDB_BASE}?sheet=tournaments`;

// ---------- Fetch ----------
async function getTournaments() {
  try {
    const res = await fetch(SHEETDB_TOURNAMENTS);
    return await res.json();
  } catch (err) {
    console.error("Error fetching tournaments", err);
    return [];
  }
}

// ---------- Render ----------
async function renderTournaments() {
  const tournaments = await getTournaments();
  const now = new Date();

  const activeContainer = document.getElementById("activeContainer");
  const upcomingContainer = document.getElementById("upcomingContainer");
  const closedContainer = document.getElementById("closedContainer");

  activeContainer.innerHTML = "";
  upcomingContainer.innerHTML = "";
  closedContainer.innerHTML = "";

  tournaments.forEach(t => {
    const startDate = new Date(t.scrimStart);
    const endDate = new Date(t.scrimEnd);
    const regStart = new Date(t.regStart);
    const status = (t.status || "").toLowerCase().trim();
    const scrimId = t.ScrimId || t.scrimId;

    // Decide real status (priority: sheet -> dates)
    let realStatus = status;
    if (realStatus !== "active" && realStatus !== "upcoming" && realStatus !== "ended") {
      if (endDate < now) {
        realStatus = "ended";
      } else if (startDate > now) {
        realStatus = "upcoming";
      } else {
        realStatus = "active";
      }
    }

    // Card HTML
    const card = document.createElement("div");
    card.className = "tournament-card";

    // Actions
    let actions = `<a href="slot.html?scrimId=${scrimId}" class="btn-slots">View Slots</a>`;
    if (realStatus === "upcoming") {
      if (now >= regStart) {
        // Registration is open
        actions = `
          <a href="registration.html?scrimId=${scrimId}" class="btn-register">Register</a>
          ${actions}
        `;
      } else {
        // Registration not started yet -> show locked button
        actions = `
          <button class="btn-register locked" disabled>
            Register (Opens ${regStart.toLocaleDateString()})
          </button>
          ${actions}
        `;
      }
    }

    card.innerHTML = `
      <h3>${t.scrimName}</h3>
      <p><b>Game:</b> ${t.game}</p>
      <p><b>Start:</b> ${startDate.toLocaleDateString()}</p>
      <p><b>Status:</b> ${realStatus}</p>
      <div class="tournament-actions">${actions}</div>
    `;

    // Place in correct section
    if (realStatus === "active") {
      activeContainer.appendChild(card);
    } else if (realStatus === "upcoming") {
      upcomingContainer.appendChild(card);
    } else if (realStatus === "ended") {
      closedContainer.appendChild(card);
    }
  });

  // Fallbacks
  if (activeContainer.innerHTML === "") activeContainer.innerHTML = "<p>No active tournaments.</p>";
  if (upcomingContainer.innerHTML === "") upcomingContainer.innerHTML = "<p>No upcoming tournaments.</p>";
  if (closedContainer.innerHTML === "") closedContainer.innerHTML = "<p>No closed tournaments.</p>";
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", renderTournaments);
