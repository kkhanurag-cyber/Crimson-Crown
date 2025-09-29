// ===============================
// Tournaments Script — Google Sheets API
// ===============================

// ---------- Config ----------
const SHEET_ID = "1bDom_5E8GFysWTBNZ5b7g8T_Ac-GV6aJvT8fOnDGmOo";
const API_KEY = "AIzaSyDvIfL-bHWfle3L4fZtLJ2A1nVIgMYWMNk";
const TOURNAMENTS_RANGE = "tournaments!A2:Z"; // Includes regLink

// ---------- Helpers ----------
function parseIST(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;

  const parts = dateStr.split(" ");
  if (parts.length !== 2) return null;

  const [datePart, timePart] = parts;
  const [y, m, d] = datePart.split("-").map(Number);
  const [h, min, s] = timePart.split(":").map(Number);

  if ([y, m, d, h, min, s].some(isNaN)) return null;

  return new Date(Date.UTC(y, m - 1, d, h - 5, min - 30, s));
}

// ---------- Fetch Tournaments ----------
async function getTournaments() {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${TOURNAMENTS_RANGE}?key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.values || !data.values.length) return [];

    return data.values.map(row => ({
      scrimId: row[0] || "",
      scrimName: row[1] || "",
      regStart: row[2] || "",
      regEnd: row[3] || "",
      scrimStart: row[4] || "",
      scrimEnd: row[5] || "",
      slots: row[6] || "",
      game: row[7] || "",
      rounds: row[8] || "",
      mode: row[9] || "",
      rules: row[10] || "",
      description: row[11] || "",
      prizePool: row[12] || "",
      status: row[13] || "",
      default: row[14] || "",
      pointTable: row[15] || "",
      regLink: row[16] || ""   // ✅ Google Form link
    }));
  } catch (err) {
    console.error("Error fetching tournaments:", err);
    return [];
  }
}

// ---------- Render Tournaments ----------
async function renderTournaments() {
  const tournaments = await getTournaments();
  const now = new Date();

  const activeContainer = document.getElementById("activeContainer");
  const upcomingContainer = document.getElementById("upcomingContainer");
  const closedContainer = document.getElementById("closedContainer");

  if (!activeContainer || !upcomingContainer || !closedContainer) {
    console.warn("Tournament containers missing in HTML!");
    return;
  }

  activeContainer.innerHTML = "";
  upcomingContainer.innerHTML = "";
  closedContainer.innerHTML = "";

  tournaments.forEach(t => {
    const startDate = parseIST(t.scrimStart);
    const endDate = parseIST(t.scrimEnd);
    const regStart = parseIST(t.regStart);
    const regEnd = parseIST(t.regEnd);
    const scrimId = t.scrimId;

    // Determine status
    let realStatus = (t.status || "").toLowerCase().trim();
    if (!["active", "upcoming", "ended"].includes(realStatus)) {
      if (endDate && endDate < now) realStatus = "ended";
      else if (startDate && startDate > now) realStatus = "upcoming";
      else realStatus = "active";
    }

    // Create card
    const card = document.createElement("div");
    card.className = "tournament-card";

    // Actions
    let actions = `<a href="slot.html?scrimId=${encodeURIComponent(scrimId)}" class="btn-slots">View Slots</a>`;

    if (realStatus === "upcoming") {
      if (regStart && now < regStart) {
        // Registration not opened yet
        actions = `
          <button class="btn-register locked" disabled>
            Register (Opens ${regStart.toLocaleString("en-IN")})
          </button>
          ${actions}
        `;
      } else if (regStart && now >= regStart && regEnd && now <= regEnd) {
        // ✅ Registration open → use Google Form link
        if (t.regLink) {
          actions = `
            <a href="${t.regLink}" target="_blank" class="btn-register">Register</a>
            ${actions}
          `;
        } else {
          actions = `
            <button class="btn-register locked" disabled>
              Registration Link Missing
            </button>
            ${actions}
          `;
        }
      } else if (regEnd && now > regEnd) {
        // Registration closed
        actions = `
          <button class="btn-register locked" disabled>
            Registration Closed
          </button>
          ${actions}
        `;
      }
    } else if (realStatus === "active") {
      actions = `<a href="slot.html?scrimId=${encodeURIComponent(scrimId)}" class="btn-slots">View Slots</a>`;
    }

    card.innerHTML = `
      <h3>${t.scrimName}</h3>
      <p><b>Game:</b> ${t.game || "N/A"}</p>
      <p><b>Start:</b> ${startDate ? startDate.toLocaleString("en-IN") : "TBD"}</p>
      <p><b>Status:</b> ${realStatus}</p>
      <div class="tournament-actions">${actions}</div>
    `;

    // Append to correct container
    if (realStatus === "active") activeContainer.appendChild(card);
    else if (realStatus === "upcoming") upcomingContainer.appendChild(card);
    else closedContainer.appendChild(card);
  });

  // Fallback text
  if (!activeContainer.innerHTML) activeContainer.innerHTML = "<p>No active tournaments.</p>";
  if (!upcomingContainer.innerHTML) upcomingContainer.innerHTML = "<p>No upcoming tournaments.</p>";
  if (!closedContainer.innerHTML) closedContainer.innerHTML = "<p>No closed tournaments.</p>";
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", renderTournaments);
