// ===============================
// Registration Script — Google Sheets API
// ===============================

// 👇 Config
const SHEET_ID = "1bDom_5E8GFysWTBNZ5b7g8T_Ac-GV6aJvT8fOnDGmOo";
const API_KEY = "AIzaSyDvIfL-bHWfle3L4fZtLJ2A1nVIgMYWMNk";
const TOURNAMENTS_RANGE = "tournaments!A2:Z";       // tournaments sheet
const REGISTRATIONS_RANGE = "registrations!A2:Z";   // registrations sheet

// ---------- Helpers ----------
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// ---------- Fetch Tournament Info ----------
async function fetchTournament(scrimId) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${TOURNAMENTS_RANGE}?key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.values) return null;

    // Map columns: adjust indexes according to your sheet
    const tournaments = data.values.map(row => ({
        scrimId: row[0],
        scrimName: row[1],
        game: row[2],
        regStart: row[3],
        regEnd: row[4]
    }));

    return tournaments.find(t => t.scrimId === scrimId);
}

// ---------- Submit Registration ----------
async function submitRegistration(formData) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${REGISTRATIONS_RANGE}:append?valueInputOption=RAW&key=${API_KEY}`;
    
    // Convert formData to array matching your sheet columns
    const values = [Object.values(formData)]; 
    
    const body = { values };

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    return res.ok;
}

// ---------- Main ----------
document.addEventListener("DOMContentLoaded", async () => {
    const scrimId = getQueryParam("scrimId");
    const tournamentInfoEl = document.getElementById("tournamentInfo");
    const registrationForm = document.getElementById("registrationForm");
    const invalidAccessEl = document.getElementById("invalidAccess");
    const messageEl = document.getElementById("message");

    if (!scrimId) {
        tournamentInfoEl.textContent = "⚠️ Invalid access. No tournament selected.";
        invalidAccessEl.style.display = "block";
        return;
    }

    try {
        const tournament = await fetchTournament(scrimId);
        if (!tournament) {
            tournamentInfoEl.textContent = "⚠️ Tournament not found.";
            invalidAccessEl.style.display = "block";
            return;
        }

        // Show tournament name
        tournamentInfoEl.textContent = `${tournament.scrimName} (${tournament.game})`;

        // Parse dates
        const now = new Date();
        const regStart = new Date(tournament.regStart.replace(" ", "T"));
        const regEnd = new Date(tournament.regEnd.replace(" ", "T"));

        // Check registration window
        if (now < regStart) {
            tournamentInfoEl.textContent += " — Registration not yet open.";
            invalidAccessEl.textContent = "⚠️ Registration is not open for this tournament.";
            invalidAccessEl.style.display = "block";
            return;
        }

        if (now > regEnd) {
            tournamentInfoEl.textContent += " — Registration is closed.";
            invalidAccessEl.textContent = "⚠️ Registration is closed for this tournament.";
            invalidAccessEl.style.display = "block";
            return;
        }

        // Registration open
        registrationForm.style.display = "block";
        document.getElementById("scrimId").value = tournament.scrimId;

        registrationForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            messageEl.textContent = "";

            const formData = {};
            Array.from(registrationForm.elements).forEach(el => {
                if (el.name) formData[el.name] = el.value;
            });

            try {
                const success = await submitRegistration(formData);
                if (success) {
                    messageEl.style.color = "green";
                    messageEl.textContent = "✅ Registration submitted successfully!";
                    registrationForm.reset();
                } else {
                    throw new Error("Failed to submit registration");
                }
            } catch (err) {
                console.error(err);
                messageEl.style.color = "red";
                messageEl.textContent = "⚠️ Error submitting registration.";
            }
        });

    } catch (err) {
        console.error(err);
        tournamentInfoEl.textContent = "⚠️ Error fetching tournament data.";
        invalidAccessEl.style.display = "block";
    }
});
// ===============================