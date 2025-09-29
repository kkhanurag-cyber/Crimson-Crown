// ---------- API Endpoints ----------
const SHEETDB_BASE = 'https://sheetdb.io/api/v1/e5p48zbm0w5ph';
const SHEETDB_TOURNAMENTS = `${SHEETDB_BASE}?sheet=tournaments`;

// ---------- Form Submit ----------
document.getElementById("tournamentForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;

  // ✅ Auto-generate unique Scrim ID (always string)
  const scrimId = "SCRIM" + Date.now();

  // Format dates as "YYYY-MM-DD HH:mm:ss" for consistency
  function formatDate(input) {
    const d = new Date(input);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  }

  const formData = {
    scrimId: scrimId,
    scrimName: form.scrimName.value,
    regStart: formatDate(form.regStart.value),
    regEnd: formatDate(form.regEnd.value),
    scrimStart: formatDate(form.scrimStart.value),
    scrimEnd: formatDate(form.scrimEnd.value),
    slots: form.slots.value,
    game: form.game.value,
    rounds: form.rounds.value,
    mode: form.mode.value,
    rules: form.rules.value,
    pointTable: form.pointTable.value,
    description: form.description.value,
    prizePool: form.prizePool.value,
    status: form.status.value,
    default: form.defaultTournament.checked ? "true" : "false",
  };

  try {
    const res = await fetch(SHEETDB_TOURNAMENTS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [formData] }), // must be array
    });

    const result = await res.json();
    console.log("Response:", result);

    if (result.created || res.status === 201) {
      document.getElementById("message").textContent = "✅ Tournament added successfully!";
      form.reset();
    } else {
      throw new Error("Tournament not saved");
    }
  } catch (err) {
    console.error("Error adding tournament:", err);
    document.getElementById("message").textContent = "⚠️ Error adding tournament.";
  }
});
