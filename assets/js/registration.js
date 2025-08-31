// ---------- API ----------
const SHEETDB_BASE = 'https://sheetdb.io/api/v1/e5p48zbm0w5ph';
const SHEETDB_TOURNAMENTS = `${SHEETDB_BASE}?sheet=tournaments`;
const SHEETDB_REGISTRATIONS = `${SHEETDB_BASE}?sheet=registrations`;

// ---------- Helpers ----------
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
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
        const res = await fetch(`${SHEETDB_TOURNAMENTS}&scrimId=${encodeURIComponent(scrimId)}`);
        const data = await res.json();
        if (!data || data.length === 0) {
            tournamentInfoEl.textContent = "⚠️ Tournament not found.";
            invalidAccessEl.style.display = "block";
            return;
        }

        const tournament = data[0];

        // Show proper tournament name
        tournamentInfoEl.textContent = `${tournament.scrimName} (${tournament.game})`;

        // Parse dates
        const now = new Date();
        const regStart = new Date(tournament.regStart.replace(" ", "T"));
        const regEnd = new Date(tournament.regEnd.replace(" ", "T"));

        // Check registration open
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
                const res = await fetch(SHEETDB_REGISTRATIONS, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ data: [formData] }),
                });
                const result = await res.json();

                if (result.created || res.status === 201) {
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
