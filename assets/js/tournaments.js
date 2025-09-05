// ===============================
// Tournaments Script — Google Sheets API
// ===============================

// ---------- Config ----------
const SHEET_ID = "1bDom_5E8GFysWTBNZ5b7g8T_Ac-GV6aJvT8fOnDGmOo";
const API_KEY = "AIzaSyDvIfL-bHWfle3L4fZtLJ2A1nVIgMYWMNk";
const TOURNAMENTS_RANGE = "tournaments!A2:Z"; // Adjust columns as needed

// ---------- Fetch ----------
async function getTournaments() {
    try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${TOURNAMENTS_RANGE}?key=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!data.values) return [];

        // Map each row to an object, adjust indexes according to your sheet
        return data.values.map(row => ({
            scrimId: row[0],
            scrimName: row[1],
            game: row[2],
            scrimStart: row[3],
            scrimEnd: row[4],
            regStart: row[5],
            regEnd: row[6],
            status: row[7] || ""
        }));
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
        const scrimId = t.scrimId;

        // Determine real status
        let realStatus = (t.status || "").toLowerCase().trim();
        if (!["active", "upcoming", "ended"].includes(realStatus)) {
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
        let actions = `<a href="slot.html?scrimId=${encodeURIComponent(scrimId)}" class="btn-slots">View Slots</a>`;
        if (realStatus === "upcoming") {
            if (now >= regStart) {
                actions = `
                  <a href="registration.html?scrimId=${encodeURIComponent(scrimId)}" class="btn-register">Register</a>
                  ${actions}
                `;
            } else {
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
        if (realStatus === "active") activeContainer.appendChild(card);
        else if (realStatus === "upcoming") upcomingContainer.appendChild(card);
        else if (realStatus === "ended") closedContainer.appendChild(card);
    });

    // Fallbacks
    if (!activeContainer.innerHTML) activeContainer.innerHTML = "<p>No active tournaments.</p>";
    if (!upcomingContainer.innerHTML) upcomingContainer.innerHTML = "<p>No upcoming tournaments.</p>";
    if (!closedContainer.innerHTML) closedContainer.innerHTML = "<p>No closed tournaments.</p>";
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", renderTournaments);
