console.log('patients.js loaded', document.getElementById('search'));


import { renderSideBar } from '../components/sidebar.js';

// ══════════════════════════════════════════
//  CONFIG
// ══════════════════════════════════════════
const BASE_URL = 'https://abojuto.onrender.com'; // ← your backend URL

// ── Auth guard ──
const token   = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
const userRaw = sessionStorage.getItem('auth_user')  || localStorage.getItem('auth_user');
if (!token || !userRaw) window.location.href = '../index.html';

// ── Sidebar ──
const sideBar = document.querySelector('.side-bar');
if (sideBar) sideBar.innerHTML = renderSideBar('patients');

// ── Authorised fetch ──
async function apiFetch(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (res.status === 401) {
    localStorage.clear(); sessionStorage.clear();
    window.location.href = '../index.html';
  }
  return res.json();
}

// ══════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════
let allPatients   = [];   // full list from API
let filteredList  = [];   // after search/filter
let currentPage   = 1;
const CARDS_PER_PAGE = 6;

// ══════════════════════════════════════════
//  LOAD ALL PATIENTS
// ══════════════════════════════════════════
async function loadPatients() {
  setGridHTML('<div class="cards-loading">Loading patients...</div>');

  try {
    const data = await apiFetch('/api/patients');
    // API returns a plain array of patient objects
    // allPatients  = Array.isArray(data) ? data : [];
    allPatients = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
    filteredList = [...allPatients];

    // Stat cards — only totalPatients is real from this endpoint
    setText('stat-total',     allPatients.length.toLocaleString());
    setText('stat-active',    '—');   // not in this endpoint
    setText('stat-pending',   '—');
    setText('stat-inpatient', '—');

    currentPage = 1;
    renderPage();

  } catch (err) {
    console.error('Failed to load patients:', err);
    setGridHTML('<div class="cards-error">Failed to load patients. Check your connection.</div>');
  }
}

// ══════════════════════════════════════════
//  RENDER ONE PAGE OF CARDS
// ══════════════════════════════════════════
function renderPage() {
  const total = filteredList.length;
  const totalPages = Math.ceil(total / CARDS_PER_PAGE);
  const start = (currentPage - 1) * CARDS_PER_PAGE;
  const end   = Math.min(start + CARDS_PER_PAGE, total);
  const slice = filteredList.slice(start, end);

  // Update page info text
  const pageInfo = document.getElementById('page-info');
  if (pageInfo) {
    pageInfo.textContent = total === 0
      ? 'No patients found'
      : `Showing ${start + 1}–${end} of ${total} patient${total !== 1 ? 's' : ''}`;
  }

  // Render cards
  if (slice.length === 0) {
    setGridHTML('<div class="cards-empty">No patients match your search.</div>');
  } else {
    setGridHTML(slice.map(buildCard).join(''));
  }

  // Render pagination buttons
  renderPagination(totalPages);
}

// ══════════════════════════════════════════
//  BUILD A SINGLE PATIENT CARD
// ══════════════════════════════════════════
function buildCard(patient) {
  const name      = patient.fullName   ?? 'Unknown';
  const id        = patient.patientId  ?? '—';
  const gender    = patient.gender     ? capitalise(patient.gender) : '—';
  const blood     = patient.bloodGroup ?? '—';
  const phone     = patient.phone      ?? '—';
  const allergies = patient.allergies  ?? 'None';
  const age       = patient.dateOfBirth ? calcAge(patient.dateOfBirth) + ' years' : '—';
  const registered = patient.createdAt
    ? new Date(patient.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  // Initials avatar (no broken image)
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return `
    <div class="patient-card">
      <div class="card-header">
        <div class="avatar-initials">${initials}</div>
        <div class="patient-info">
          <div class="name-row">
            <h2 class="patientName">${name}</h2>
            <span class="patient-id">${id}</span>
          </div>
          <div class="details-row">
            <span class="patientGender">${gender}</span>
            <span class="patientAge">${age}</span>
            <span class="patientBlood">${blood}</span>
          </div>
        </div>
        <div class="visit-info">
          <p class="label">REGISTERED</p>
          <p class="lastVisit">${registered}</p>
        </div>
      </div>
      <div class="card-footer">
        <p class="chiefComplaint">Allergies: ${allergies} &nbsp;|&nbsp; Phone: ${phone}</p>
        <div class="actions">
          <button class="btn edit-btn" onclick="editPatient('${patient._id}')">
            <img src="../assets/icons/edit-icon.png" alt=""> Edit
          </button>
          <button class="btn view-btn" onclick="viewPatient('${patient._id}')">
            <img src="../assets/icons/eye-Icon.png" alt=""> View Profile
          </button>
        </div>
      </div>
    </div>
  `;
}

// ══════════════════════════════════════════
//  PAGINATION BUTTONS
// ══════════════════════════════════════════
function renderPagination(totalPages) {
  const container = document.getElementById('pagination-controls');
  if (!container) return;
  if (totalPages <= 1) { container.innerHTML = ''; return; }

  let html = `<button class="page-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>&lsaquo;</button>`;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += `<button class="page-btn" disabled>…</button>`;
    }
  }

  html += `<button class="page-btn" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>&rsaquo;</button>`;
  container.innerHTML = html;
}

// ══════════════════════════════════════════
//  SEARCH  (live, uses API search endpoint)
// ══════════════════════════════════════════
let searchTimer;
document.getElementById('search')?.addEventListener('input', (e) => {
  clearTimeout(searchTimer);
  const q = e.target.value.trim();

  searchTimer = setTimeout(async () => {
    if (!q) {
      // Empty search — show full list
      filteredList = [...allPatients];
      currentPage  = 1;
      renderPage();
      return;
    }
    try {
      setGridHTML('<div class="cards-loading">Searching...</div>');
      const results = await apiFetch(`/api/patients/search?q=${encodeURIComponent(q)}`);
      filteredList = Array.isArray(results.data) ? results.data : [];
      currentPage  = 1;
      renderPage();
    } catch {
      setGridHTML('<div class="cards-error">Search failed. Try again.</div>');
    }
  }, 350); // debounce — waits 350ms after user stops typing
});

// ══════════════════════════════════════════
//  FILTER TABS  (client-side for now)
// ══════════════════════════════════════════
window.setTab = function(btn) {
  document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  // All tabs currently show all patients — extend later per tab label
  filteredList = [...allPatients];
  currentPage  = 1;
  renderPage();
};

// ══════════════════════════════════════════
//  ACTIONS
// ══════════════════════════════════════════
window.viewPatient = function(id) {
  window.location.href = `patient-profile.html?id=${id}`;
};

window.editPatient = function(id) {
  window.location.href = `edit-patient.html?id=${id}`;
};

window.goToPage = function(page) {
  const totalPages = Math.ceil(filteredList.length / CARDS_PER_PAGE);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderPage();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ══════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════
function setGridHTML(html) {
  const grid = document.getElementById('patient-cards-grid');
  if (grid) grid.innerHTML = html;
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function calcAge(dob) {
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function capitalise(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ── Also add initials avatar style inline (one-time) ──
const style = document.createElement('style');
style.textContent = `
  .avatar-initials {
    width: 60px; height: 60px;
    border-radius: 50%;
    background: #2e6b5020;
    color: #2e6b50;
    font-weight: 700;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: 2px solid #2e6b5030;
  }
`;
document.head.appendChild(style);

// ── Kick off ──
loadPatients();