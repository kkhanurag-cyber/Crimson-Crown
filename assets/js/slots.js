// ===============================
// Slots / Teams Script — Google Sheets API & Logos
// ===============================

// ---------- Config ----------
const SHEET_ID = "1bDom_5E8GFysWTBNZ5b7g8T_Ac-GV6aJvT8fOnDGmOo";
const API_KEY = "AIzaSyDvIfL-bHWfle3L4fZtLJ2A1nVIgMYWMNk";
const REGISTRATIONS_RANGE = "registrations!A1:Z"; // include headers
const TOURNAMENTS_RANGE = "tournaments!A2:Z";
const LOGOS_JSON = "/assets/Teams_Logos/logos.json";
const LOGO_FOLDER = "/assets/Teams_Logos/";

// ---------- Globals ----------
let TEAM_LOGOS = {}; // from logos.json

// ---------- Helpers ----------
function getQueryParam(param) {
  return new URLSearchParams(window.location.search).get(param);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]));
}

function extractByKeywords(obj, keywords = ["player"]) {
  const items = [];
  for (const [rawKey, rawVal] of Object.entries(obj)) {
    if (!rawVal) continue;
    const key = String(rawKey).toLowerCase();
    for (const kw of keywords) {
      if (key.includes(kw)) {
        const numMatch = key.match(/(\d+)/);
        const idx = numMatch ? parseInt(numMatch[1], 10) : 9999;
        items.push({ idx, value: String(rawVal).trim() });
        break;
      }
    }
  }
  items.sort((a,b)=>a.idx-b.idx);
  return items.map(it=>it.value);
}

function extractPlayers(obj) { return extractByKeywords(obj, ["player"]); }
function extractSubs(obj) { return extractByKeywords(obj, ["sub","usb","substitute"]); }

// ---------- Load Logos ----------
async function loadTeamLogos() {
  try {
    const res = await fetch(LOGOS_JSON);
    TEAM_LOGOS = await res.json();
    console.log("✅ Team logos loaded:", TEAM_LOGOS);
  } catch(e) {
    console.warn("⚠️ Could not load logos.json", e);
    TEAM_LOGOS = {};
  }
}

// ---------- Get Logo Path ----------
function getLogo(teamName, sheetLogo) {
  if (sheetLogo) return `${LOGO_FOLDER}${sheetLogo}`;
  if (teamName && TEAM_LOGOS[teamName]) return `${LOGO_FOLDER}${TEAM_LOGOS[teamName]}`;
  return `${LOGO_FOLDER}default-logo.png`;
}

// ---------- Fetch Registrations ----------
async function getRegistrations(scrimId) {
  try {
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${REGISTRATIONS_RANGE}?key=${API_KEY}`);
    const data = await res.json();
    if (!data.values || !data.values.length) return [];

    const headers = data.values[0];
    const rows = data.values.slice(1);

    return rows
      .map(r => headers.reduce((obj, key, i) => ({ ...obj, [key]: r[i] ? r[i].toString().trim() : "" }), {}))
      .filter(t => (t.scrimId || t.ScrimId || "").toString().trim().toUpperCase() === scrimId.toString().trim().toUpperCase());
  } catch(e) {
    console.error("❌ Error fetching registrations", e);
    return [];
  }
}

// ---------- Render Slots ----------
async function loadSlots(scrimId) {
  const slotContainer = document.getElementById("slotList");
  if (!slotContainer) return;
  slotContainer.innerHTML = `<p>Loading slots...</p>`;

  const registrations = await getRegistrations(scrimId);
  if (!registrations.length) {
    slotContainer.innerHTML = `<p>No teams registered yet.</p>`;
    return;
  }

  registrations.sort((a,b)=> (parseInt(a.slot_number||a.slot||9999)) - (parseInt(b.slot_number||b.slot||9999)));

  slotContainer.innerHTML = "";
  registrations.forEach(team => {
    const card = document.createElement("div");
    card.className = "team-card";

    const logo = getLogo(team.teamName, team.teamLogo);
    console.log("Team:", team.teamName, "Logo path:", logo);

    card.innerHTML = `
      <img src="${logo}" class="team-logo" alt="${escapeHtml(team.teamName)}">
      <div class="team-slot">Slot #${team.slot_number || team.slot || "N/A"}</div>
      <h3 class="team-name">${escapeHtml(team.teamName) || "Unknown Team"}</h3>
      <p class="captain"><strong>Captain:</strong> ${escapeHtml(team.captain) || "N/A"}</p>
      <button class="view-details">View Details</button>
    `;

    card.querySelector("img.team-logo").onerror = function() {
      this.onerror = null;
      this.src = `${LOGO_FOLDER}default-logo.png`;
    };

    card.querySelector(".view-details").addEventListener("click", ()=> openTeamModal(team));

    slotContainer.appendChild(card);
  });
}

// ---------- Modal ----------
function openTeamModal(team) {
  const modal = document.getElementById("teamModal");
  if (!modal) return;

  const players = extractPlayers(team);
  const subs = extractSubs(team);

  document.getElementById("modalTeamName").textContent = team.teamName||"Unknown Team";
  document.getElementById("modalCaptain").textContent = team.captain||"N/A";
  document.getElementById("modalRanking").textContent = team.ranking||"TBD";
  document.getElementById("modalMeta").textContent = `Slot #${team.slot_number || team.slot || "N/A"} • Scrim ID: ${team.scrimId || "?"}`;

  document.getElementById("modalPlayers").innerHTML = players.length ? players.map(p=>`<span class="chip">${escapeHtml(p)}</span>`).join("") : "—";
  document.getElementById("modalSubs").innerHTML = subs.length ? subs.map(s=>`<span class="chip">${escapeHtml(s)}</span>`).join("") : "—";

  modal.style.display = "block";
}

// ---------- Modal Close ----------
document.addEventListener("DOMContentLoaded", ()=>{
  const modal = document.getElementById("teamModal");
  if (!modal) return;
  const closeBtn = modal.querySelector(".close");
  if (closeBtn) closeBtn.addEventListener("click", ()=> modal.style.display="none");
  window.addEventListener("click", e=> { if(e.target===modal) modal.style.display="none"; });
});

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", async ()=>{
  await loadTeamLogos();

  const scrimIdFromURL = getQueryParam("scrimId");
  const dropdown = document.getElementById("tournamentDropdown");

  if (dropdown) {
    // Optional: Populate dropdown with tournaments
    try {
      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${TOURNAMENTS_RANGE}?key=${API_KEY}`);
      const data = await res.json();
      if (data.values && data.values.length) {
        data.values.forEach(row=>{
          const option = document.createElement("option");
          option.value = row[0]; // ScrimId
          option.textContent = row[1]; // ScrimName
          dropdown.appendChild(option);
        });
        if (scrimIdFromURL) dropdown.value = scrimIdFromURL;
        dropdown.addEventListener("change", ()=> loadSlots(dropdown.value));
      }
    } catch(e) {
      console.warn("⚠️ Could not fetch tournaments for dropdown", e);
    }
  }

  if (scrimIdFromURL) loadSlots(scrimIdFromURL);
  else if (dropdown && dropdown.options.length) loadSlots(dropdown.value);
});
