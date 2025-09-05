// ===============================
// 🔥 Leaderboard Script (with Top 3 Logos)
// ===============================

// 👇 Config
const SHEET_ID = "1bDom_5E8GFysWTBNZ5b7g8T_Ac-GV6aJvT8fOnDGmOo";
const API_KEY = "AIzaSyDvIfL-bHWfle3L4fZtLJ2A1nVIgMYWMNk"; 
const RANGE = "Leaderboard!A2:H"; 
const LOGOS_JSON = "/assets/Teams_Logos/logos.json"; // Path to logos.json
const LOGO_FOLDER = "/assets/Teams_Logos/"; // Folder containing images

// ===============================
// Fetch Data from Google Sheets
// ===============================
async function fetchLeaderboard() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.values) {
      console.error("❌ No data found in sheet");
      return [];
    }

    return data.values.map(row => ({
      team: row[0] || "Unknown",
      points: parseInt(row[5]) || 0,
      avgRank: parseFloat(row[6]) || 9999
    }));
  } catch (error) {
    console.error("❌ Error fetching leaderboard:", error);
    return [];
  }
}

// ===============================
// Fetch Team Logos
// ===============================
async function fetchLogos() {
  try {
    const response = await fetch(LOGOS_JSON);
    const logos = await response.json(); // { "Team Name": "logo.png", ... }
    return logos;
  } catch (error) {
    console.error("❌ Error fetching logos:", error);
    return {};
  }
}

// ===============================
// Rank Calculation
// ===============================
function calculateRanking(data) {
  data.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return a.avgRank - b.avgRank;
  });

  return data.map((entry, index) => ({
    ...entry,
    finalRank: index + 1
  }));
}

// ===============================
// Render Leaderboard
// ===============================
async function renderLeaderboard(data) {
  if (!data || data.length === 0) return;

  const logos = await fetchLogos();

  // Top 3 podium
  for (let i = 0; i < 3; i++) {
    const logoElement = document.getElementById(`logo-${i + 1}`);
    const teamElement = document.getElementById(`team-${i + 1}`);
    const pointsElement = document.getElementById(`points-${i + 1}`);
    const teamData = data[i];

    if (!teamData) {
      if (teamElement) teamElement.textContent = "-";
      if (pointsElement) pointsElement.textContent = "0 pts";
      if (logoElement) logoElement.style.display = "none";
      continue;
    }

    const logoFile = logos[teamData.team];
    if (logoFile && logoElement) {
      logoElement.src = `${LOGO_FOLDER}${logoFile}`;
      logoElement.alt = teamData.team;
      logoElement.style.display = "block";
    } else if (logoElement) {
      logoElement.style.display = "none";
    }

    if (teamElement) teamElement.textContent = teamData.team;
    if (pointsElement) pointsElement.textContent = `${teamData.points} pts`;
  }

  // Table rows for 4th onwards
  const tbody = document.getElementById("leaderboard-body");
  if (tbody) {
    tbody.innerHTML = "";
    data.slice(3).forEach(entry => {
      const row = `
        <tr>
          <td>${entry.finalRank}</td>
          <td>${entry.team}</td>
          <td>${entry.points}</td>
        </tr>`;
      tbody.innerHTML += row;
    });
  }
}

// ===============================
// Init
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  let leaderboardData = await fetchLeaderboard();
  leaderboardData = calculateRanking(leaderboardData);
  await renderLeaderboard(leaderboardData);
});
