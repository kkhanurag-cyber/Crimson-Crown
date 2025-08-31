// ---------- API Endpoints ----------
const SHEETDB_BASE = 'https://sheetdb.io/api/v1/e5p48zbm0w5ph';
const SHEETDB_TOURNAMENTS = `${SHEETDB_BASE}?sheet=tournaments`;
const SHEETDB_REGISTRATIONS = `${SHEETDB_BASE}?sheet=registrations`;

// ---------- Fetch Tournaments ----------
async function getTournaments() {
  try {
    const res = await fetch(SHEETDB_TOURNAMENTS);
    const data = await res.json();
    console.log("Tournaments:", data);
    return data;
  } catch (err) {
    console.error("Error fetching tournaments", err);
    return [];
  }
}

// ---------- Fetch Registrations ----------
async function getRegistrations(scrimId) {
  try {
    const res = await fetch(`${SHEETDB_REGISTRATIONS}&ScrimId=${encodeURIComponent(scrimId)}`);
    const data = await res.json();
    console.log("Registrations:", data);
    return data;
  } catch (err) {
    console.error("Error fetching registrations", err);
    return [];
  }
}

// ---------- Sanitize Logo ----------
function sanitizeLogo(logoValue) {
  if (!logoValue) return 'assets/images/default-logo.png';

  // Agar sirf Google Drive ID hai
  if (!logoValue.startsWith("http")) {
    return `https://drive.google.com/uc?export=view&id=${logoValue}`;
  }

  // Agar already UC URL hai
  if (logoValue.includes("uc?export=view")) {
    return logoValue;
  }

  // Agar kisi aur format
  return 'assets/images/default-logo.png';
}

// ---------- Render Tournament Dropdown ----------
async function renderTournamentDropdown() {
  const dropdown = document.getElementById("tournamentDropdown");
  dropdown.innerHTML = "";

  const tournaments = await getTournaments();

  if (!tournaments || tournaments.length === 0) {
    dropdown.innerHTML = `<option>No tournaments available</option>`;
    return;
  }

  // Only active tournaments
  tournaments.forEach(t => {
    if ((t.status || "").toLowerCase() === "active") {
      const option = document.createElement("option");
      option.value = t.ScrimId || t.scrimId;
      option.textContent = t.scrimName;
      dropdown.appendChild(option);
    }
  });

  // Pick default tournament
  const defaultTournament = tournaments.find(t => {
    const val = (t.default || t.Default || "").toString().toLowerCase().trim();
    return val === "true" || val === "yes" || val === "1";
  });

  if (defaultTournament) {
    dropdown.value = defaultTournament.ScrimId || defaultTournament.scrimId;
    loadSlots(defaultTournament.ScrimId || defaultTournament.scrimId);
  } else if (dropdown.options.length > 0) {
    loadSlots(dropdown.options[0].value);
  }

  dropdown.addEventListener("change", () => {
    loadSlots(dropdown.value);
  });
}

// ---------- Load Slots ----------
async function loadSlots(scrimId) {
  const slotContainer = document.getElementById("slotList");
  slotContainer.innerHTML = `<p>Loading slots...</p>`;

  const registrations = await getRegistrations(scrimId);

  if (!registrations || registrations.length === 0) {
    slotContainer.innerHTML = `<p>No teams registered yet.</p>`;
    return;
  }

  slotContainer.innerHTML = "";
  registrations
    .sort((a, b) => parseInt(a.slot_number || 999) - parseInt(b.slot_number || 999))
    .forEach(team => {
      const card = document.createElement("div");
      card.className = "team-card";

      card.innerHTML = `
        <div class="team-slot">Slot #${team.slot_number || "N/A"}</div>
        <img src="${sanitizeLogo(team.teamLogo)}" class="team-logo" alt="Team Logo">
        <h3 class="team-name">${team.teamName || "Unknown Team"}</h3>
        <p class="captain">Captain: ${team.captain || "N/A"}</p>
      `;

      slotContainer.appendChild(card);
    });
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
  renderTournamentDropdown();
});
