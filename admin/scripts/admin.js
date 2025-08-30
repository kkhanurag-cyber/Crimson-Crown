// ---------- Admin Credentials ----------
const admins = [
    { username: 'crimson', password: 'crown123' }, // super user
    { username: 'blaster', password: 'x9' }        // staff1
];

// ---------- API Endpoints ----------
const SHEETDB_BASE = 'https://sheetdb.io/api/v1/e5p48zbm0w5ph';
const SHEETDB_TOURNAMENTS = `${SHEETDB_BASE}?sheet=tournaments`;
const SHEETDB_REGISTRATIONS = `${SHEETDB_BASE}?sheet=registrations`;

// ---------- Login ----------
function loginAdmin(e){
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const admin = admins.find(a => a.username === username && a.password === password);
    if(admin){
        localStorage.setItem('adminLoggedIn','true');
        localStorage.setItem('adminUsername', username);
        window.location.href = 'dashboard.html';
    } else {
        alert('Invalid username or password');
    }
}

// ---------- Logout ----------
function logout(){
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    window.location.href = 'index.html';
}

// ---------- Login Check ----------
function checkLogin(){
    if(localStorage.getItem('adminLoggedIn') !== 'true'){
        alert('You must log in first!');
        window.location.href = 'index.html';
    }
}

// ---------- Load Tournaments ----------
async function loadDashboard(){
    const tbody = document.querySelector('#tournament-table tbody');
    tbody.innerHTML = '';
    try{
        const res = await fetch(SHEETDB_TOURNAMENTS);
        const text = await res.text();
        console.log('Raw response from tournaments:', text);

        const tournaments = JSON.parse(text);
        console.log('Tournaments fetched:', tournaments);

        tournaments.forEach(t=>{
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${t.scrimName}</td>
                            <td>${t.game}</td>
                            <td>${t.mode}</td>
                            <td>${t.slots}</td>
                            <td>
                              <button onclick="editTournament('${t.scrimId}')">Edit</button>
                              <button onclick="deleteTournament('${t.scrimId}')">Delete</button>
                              <button onclick="viewRegistrations('${t.scrimId}')">View Registrations</button>
                            </td>`;
            tbody.appendChild(tr);
        });
    } catch(err){
        console.error('Failed to load tournaments:', err);
        alert('Failed to load tournaments. Check console for details.');
    }
}

// ---------- CRUD Operations ----------

// Create Tournament
async function createTournament(e){
    e.preventDefault();
    const tournament = {
        scrimId: 'scrim_' + Date.now(),
        scrimName: document.getElementById('scrimName').value,
        regStart: document.getElementById('regStart').value,
        regEnd: document.getElementById('regEnd').value,
        scrimStart: document.getElementById('scrimStart').value,
        scrimEnd: document.getElementById('scrimEnd').value,
        slots: document.getElementById('slots').value,
        game: document.getElementById('game').value,
        rounds: document.getElementById('rounds').value,
        mode: document.getElementById('mode').value,
        rules: document.getElementById('rules').value,
        pointTable: document.getElementById('pointTable').value,
        description: document.getElementById('description').value,
        prizePool: document.getElementById('prizePool').value
    };
    try{
        const res = await fetch(SHEETDB_TOURNAMENTS, {
            method: 'POST',
            headers: { 'Content-Type':'application/json' },
            body: JSON.stringify({data: tournament})
        });
        const data = await res.json();
        console.log('Tournament created:', data);
        alert('Tournament created successfully!');
        window.location.href = 'dashboard.html';
    } catch(err){
        console.error('Failed to create tournament:', err);
        alert('Failed to create tournament. Check console for details.');
    }
}

// Populate Edit Form
async function populateEditForm(scrimId){
    try{
        const res = await fetch(`${SHEETDB_TOURNAMENTS}?scrimId=${scrimId}`);
        const text = await res.text();
        console.log('Raw edit tournament response:', text);

        const tournaments = JSON.parse(text);
        if(tournaments.length === 0) { alert('Tournament not found'); return; }
        const t = tournaments[0];

        document.getElementById('scrimName').value = t.scrimName;
        document.getElementById('regStart').value = t.regStart;
        document.getElementById('regEnd').value = t.regEnd;
        document.getElementById('scrimStart').value = t.scrimStart;
        document.getElementById('scrimEnd').value = t.scrimEnd;
        document.getElementById('slots').value = t.slots;
        document.getElementById('game').value = t.game;
        document.getElementById('rounds').value = t.rounds;
        document.getElementById('mode').value = t.mode;
        document.getElementById('rules').value = t.rules;
        document.getElementById('pointTable').value = t.pointTable;
        document.getElementById('description').value = t.description;
        document.getElementById('prizePool').value = t.prizePool;
    } catch(err){
        console.error('Failed to load tournament for edit:', err);
        alert('Failed to load tournament. Check console for details.');
    }
}

// Update Tournament
async function updateTournament(e){
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const scrimId = urlParams.get('id');

    const updated = {
        scrimName: document.getElementById('scrimName').value,
        regStart: document.getElementById('regStart').value,
        regEnd: document.getElementById('regEnd').value,
        scrimStart: document.getElementById('scrimStart').value,
        scrimEnd: document.getElementById('scrimEnd').value,
        slots: document.getElementById('slots').value,
        game: document.getElementById('game').value,
        rounds: document.getElementById('rounds').value,
        mode: document.getElementById('mode').value,
        rules: document.getElementById('rules').value,
        pointTable: document.getElementById('pointTable').value,
        description: document.getElementById('description').value,
        prizePool: document.getElementById('prizePool').value
    };

    try{
        const res = await fetch(`${SHEETDB_TOURNAMENTS}?scrimId=${scrimId}`, {
            method: 'PUT',
            headers: { 'Content-Type':'application/json' },
            body: JSON.stringify({data: updated})
        });
        const data = await res.json();
        console.log('Tournament updated:', data);
        alert('Tournament updated successfully!');
        window.location.href = 'dashboard.html';
    } catch(err){
        console.error('Failed to update tournament:', err);
        alert('Failed to update tournament. Check console for details.');
    }
}

// Delete Tournament
async function deleteTournament(scrimId){
    if(!confirm('Are you sure you want to delete this tournament?')) return;
    try{
        const res = await fetch(`${SHEETDB_TOURNAMENTS}?scrimId=${scrimId}`, { method: 'DELETE' });
        const data = await res.json();
        console.log('Tournament deleted:', data);
        alert('Tournament deleted!');
        loadDashboard();
    } catch(err){
        console.error('Failed to delete tournament:', err);
        alert('Failed to delete tournament. Check console for details.');
    }
}

// Load Registrations
async function loadRegistrations(scrimId){
    try{
        const resTournament = await fetch(`${SHEETDB_TOURNAMENTS}?scrimId=${scrimId}`);
        const tournaments = await resTournament.json();
        if(tournaments.length === 0) { alert('Tournament not found'); return; }
        document.getElementById('tournamentName').textContent = tournaments[0].scrimName;

        const res = await fetch(`${SHEETDB_REGISTRATIONS}?scrimId=${scrimId}`);
        const regs = await res.json();
        console.log('Registrations fetched:', regs);

        if(!Array.isArray(regs) || regs.length === 0){
            alert('No registrations found for this tournament.');
        }

        const tbody = document.querySelector('#registrations-table tbody');
        tbody.innerHTML = '';
        regs.forEach(r=>{
            const players = [r.player1, r.player2, r.player3, r.player4].filter(Boolean).join(', ');
            const subs = [r.sub1, r.sub2, r.sub3].filter(Boolean).join(', ');
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${r.teamName}</td>
                            <td>${r.captain}</td>
                            <td>${players}</td>
                            <td>${subs}</td>
                            <td>${r.teamLogo || '-'}</td>`;
            tbody.appendChild(tr);
        });
    } catch(err){
        console.error('Failed to load registrations:', err);
        alert('Failed to load registrations. Check console for details.');
    }
}

// Navigation helpers
function editTournament(scrimId){ window.location.href = `edit-tournament.html?id=${scrimId}`; }
function viewRegistrations(scrimId){ window.location.href = `view-registrations.html?id=${scrimId}`; }
