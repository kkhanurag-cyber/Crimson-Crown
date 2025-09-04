// ---------- API Endpoints ----------
const SHEETDB_BASE = 'https://sheetdb.io/api/v1/e5p48zbm0w5ph';
const SHEETDB_TOURNAMENTS = `${SHEETDB_BASE}?sheet=tournaments`;
const SHEETDB_REGISTRATIONS = `${SHEETDB_BASE}?sheet=registrations`;

// ---------- Globals ----------
let TEAM_LOGOS = {}; // logos.json se load honge

// ---------- Load Local Logos JSON ----------
async function loadTeamLogos() {
  try {
    const res = await fetch("assets/Teams_Logos/logos.json");
    TEAM_LOGOS = await res.json();
    console.log("✅ Local team logos loaded:", TEAM_LOGOS);
  } catch (e) {
    console.warn("⚠️ Could not load logos.json", e);
    TEAM_LOGOS = {};
  }
}

// ---------- Fetch Tournaments ----------
async function getTournaments() {
  try {
    const res = await fetch(SHEETDB_TOURNAMENTS);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("❌ Error fetching tournaments", err);
    return [];
  }
}

// ---------- Fetch Registrations ----------
async function getRegistrations(scrimId) {
  try {
    // Try both ScrimId and scrimId param names (SheetDB can be case-sensitive)
    const res = await fetch(`${SHEETDB_REGISTRATIONS}&ScrimId=${encodeURIComponent(scrimId)}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("❌ Error fetching registrations", err);
    return [];
  }
}

// ---------- Helpers: sanitize logo ----------
function sanitizeLogo(logoValue, teamName) {
  if (logoValue) {
    if (!logoValue.startsWith("http")) {
      return `https://drive.google.com/uc?export=view&id=${logoValue}`;
    }
    if (logoValue.includes("uc?export=view")) return logoValue;
    if (logoValue.includes("drive.google.com")) {
      const match = logoValue.match(/[-\w]{25,}/);
      if (match) return `https://drive.google.com/uc?export=view&id=${match[0]}`;
    }
  }
  // fallback to local mapping (path saved in logos.json could already be full relative path)
  if (teamName && TEAM_LOGOS[teamName]) return TEAM_LOGOS[teamName].startsWith("assets/") ? TEAM_LOGOS[teamName] : `assets/Teams_Logos/${TEAM_LOGOS[teamName]}`;
  // last fallback
  return "assets/images/default-logo.png";
}

// ---------- Extract players/subs robustly from registration object ----------
function extractByKeywords(obj, keywords = ["player"], maxSearch = 20) {
  // Collect entries whose key contains any of the keywords
  const items = [];
  for (const [rawKey, rawVal] of Object.entries(obj)) {
    if (!rawVal) continue;
    const key = String(rawKey).toLowerCase();
    for (const kw of keywords) {
      if (key.includes(kw)) {
        // find numeric index in key (player1 -> 1). If none, push with high index.
        const numMatch = key.match(/(\d+)/);
        const idx = numMatch ? parseInt(numMatch[1], 10) : 9999;
        items.push({ idx, value: String(rawVal).trim() });
        break;
      }
    }
  }
  // sort by index to preserve player1->player2 order
  items.sort((a, b) => a.idx - b.idx);
  return items.map(it => it.value);
}

// players: any column containing "player"
function extractPlayers(obj) {
  return extractByKeywords(obj, ["player"]);
}

// substitutes: try keys containing 'sub', 'usb', 'substitute'
function extractSubs(obj) {
  return extractByKeywords(obj, ["sub", "usb", "substitute"]);
}

// ---------- Render Tournament Dropdown ----------
async function renderTournamentDropdown() {
  const dropdown = document.getElementById("tournamentDropdown");
  if (!dropdown) return;
  dropdown.innerHTML = "";

  const tournaments = await getTournaments();
  if (!tournaments || tournaments.length === 0) {
    dropdown.innerHTML = `<option>No tournaments available</option>`;
    return;
  }

  // Only active tournaments (safe compare)
  tournaments.forEach(t => {
    if ((t.status || "").toString().toLowerCase() === "active") {
      const option = document.createElement("option");
      option.value = t.ScrimId || t.scrimId || t.scrimID || "";
      option.textContent = t.scrimName || t.scrimname || t.name || option.value;
      dropdown.appendChild(option);
    }
  });

  // Pick default tournament if any
  const defaultTournament = tournaments.find(t => {
    const v = (t.default || t.Default || t.DefaultTournament || "").toString().toLowerCase().trim();
    return v === "true" || v === "yes" || v === "1";
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
  if (!slotContainer) return;
  slotContainer.innerHTML = `<p>Loading slots...</p>`;

  const registrations = await getRegistrations(scrimId);
  if (!registrations || registrations.length === 0) {
    slotContainer.innerHTML = `<p>No teams registered yet.</p>`;
    return;
  }

  // sort by numeric slot_number (supports '1','01','10')
  registrations.sort((a, b) => (parseInt(a.slot_number || a["slot_number"] || a.slot || 9999) || 9999) - (parseInt(b.slot_number || b["slot_number"] || b.slot || 9999) || 9999));

  slotContainer.innerHTML = "";
  registrations.forEach(team => {
    const card = document.createElement("div");
    card.className = "team-card";

    // logo path (sanitize)
    const logo = sanitizeLogo(team.teamLogo || team.teamlogo || team["teamLogo"], team.teamName || team.teamname || team["teamName"]);

    // Build card HTML (logo above, slot below)
    card.innerHTML = `
      <img src="${logo}" class="team-logo" alt="Team Logo">
      <div class="team-slot">Slot #${team.slot_number || team.slot || "N/A"}</div>
      <h3 class="team-name">${team.teamName || team.teamname || team["teamName"] || "Unknown Team"}</h3>
      <p class="captain"><strong>Captain:</strong> ${team.captain || team.Captain || "N/A"}</p>
      <button class="view-details">View Details</button>
    `;

    // image fallback: if image fails, try local slug then default
    const imgEl = card.querySelector("img.team-logo");
    imgEl.onerror = function () {
      // try mapping from logos.json using exact teamName key (if relative path stored) or try local slug
      const tName = team.teamName || team.teamname || team["teamName"] || "";
      const mapped = TEAM_LOGOS[tName];
      if (mapped) {
        this.onerror = null; // avoid infinite loop
        this.src = mapped.startsWith("assets/") ? mapped : `assets/Teams_Logos/${mapped}`;
        return;
      }
      // fallback slug
      const slug = String(tName).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const localCandidate = `assets/Teams_Logos/${slug}.png`;
      if (!this.src.endsWith(localCandidate)) {
        this.onerror = null;
        this.src = localCandidate;
      } else {
        this.onerror = null;
        this.src = "assets/images/default-logo.png";
      }
    };

    // details button -> open modal
    card.querySelector(".view-details").addEventListener("click", () => openTeamModal(team));

    slotContainer.appendChild(card);
  });
}

// ---------- Modal & details ----------
function openTeamModal(team) {
  // Debug: inspect the team object in console to confirm keys/values
  console.log("Open details for team:", team);

  const modal = document.getElementById("teamModal");
  if (!modal) {
    console.error("Modal element (#teamModal) not found in HTML. Add modal markup before </body>.");
    return;
  }

  // build arrays (players and substitutes) robustly
  const players = extractPlayers(team); // looks for keys containing "player"
  const subs = extractSubs(team);       // looks for keys containing "sub" / "usb" / "substitute"

  // populate modal fields
  const teamName = team.teamName || team.teamname || team["teamName"] || "Unknown Team";
  document.getElementById("modalTeamName").textContent = teamName;
  document.getElementById("modalCaptain").textContent = team.captain || team.Captain || "N/A";
  document.getElementById("modalRanking").textContent = team.ranking || team.Ranking || "TBD";

  document.getElementById("modalMeta").textContent = `Slot #${team.slot_number || team.slot || "N/A"} • Scrim ID: ${team.scrimId || team.ScrimId || "?"}`;

  // render players as chips
  const playersWrap = document.getElementById("modalPlayers");
  playersWrap.innerHTML = players.length
    ? players.map(p => `<span class="chip">${escapeHtml(p)}</span>`).join("")
    : "—";

  // render substitutes as chips
  const subsWrap = document.getElementById("modalSubs");
  subsWrap.innerHTML = subs.length
    ? subs.map(s => `<span class="chip">${escapeHtml(s)}</span>`).join("")
    : "—";

  // show modal
  modal.style.display = "block";
}

// small helper to avoid basic HTML injection when inserting names
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (m) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]); });
}

// Close modal listeners
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("teamModal");
  if (!modal) return;
  const closeBtn = modal.querySelector(".close");
  if (closeBtn) closeBtn.addEventListener("click", () => (modal.style.display = "none"));
  window.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });
});

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", async () => {
  await loadTeamLogos();
  renderTournamentDropdown();
});
