// ══════════════════════════════════════════
//  CONFIG
// ══════════════════════════════════════════
const BASE_URL = "https://abojuto.onrender.com"; // ← your backend URL

// ── Auth guard: redirect to login if no token ──
const token =
  sessionStorage.getItem("auth_token") || localStorage.getItem("auth_token");
const userRaw =
  sessionStorage.getItem("auth_user") || localStorage.getItem("auth_user");

if (!token || !userRaw) {
  window.location.href = "../index.html";
}

const user = JSON.parse(userRaw);

// ── Helper: authorised fetch (attaches Bearer token) ──
async function apiFetch(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    // Token expired — send back to login
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_user");
    window.location.href = "../index.html";
  }
  return res.json();
}

// ── Sidebar ──
import { renderSideBar } from "../components/sidebar.js";
const sideBar = document.querySelector(".side-bar");
if (sideBar) sideBar.innerHTML = renderSideBar("dashboard");

// ── Greet with real user name ──
const headerTitle = document.querySelector(".header h1");
if (headerTitle && user?.name) {
  headerTitle.textContent = `Welcome, ${user.name}`;
}

// ── Show today's date ──
const todayDateEl = document.getElementById("today-date");
if (todayDateEl) {
  todayDateEl.textContent = new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ══════════════════════════════════════════
//  LOAD DASHBOARD DATA
// ══════════════════════════════════════════
async function loadDashboard() {
  try {
    const data = await apiFetch("/api/dashboard");
    // data = { role: "Receptionist", data: { totalPatients, todayNewPatients, todayAppointments } }
    const d = data.data;

    // ── Stat cards ──
    setText("stat-total-patients", d.totalPatients ?? "—");
    setText("stat-today-appointments", d.todayAppointments?.count ?? "—");
    setText("stat-new-patients", d.todayNewPatients ?? "—");

   console.log(`the today appointment: ${d.todayAppointments}`);

    // Count scheduled appointments from the list
    const scheduledCount = (d.todayAppointments?.list ?? []).filter(
      (a) => a.status === "scheduled",
    ).length;
    setText("stat-scheduled", scheduledCount);

    // ── Appointments table ──
    renderAppointments(d.todayAppointments?.list ?? []);
  } catch (err) {
    console.error("Dashboard load error:", err);
    const tbody = document.getElementById("appointments-tbody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="6" class="table-empty">Failed to load data. Check your connection.</td></tr>`;
    }
  }
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function renderAppointments(list) {
  const tbody = document.getElementById("appointments-tbody");
  if (!tbody) return;

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="table-empty">No appointments scheduled for today.</td></tr>`;
    return;
  }

  tbody.innerHTML = list
    .map((appt) => {
      const patient = appt.patient?.fullName ?? "Unknown";
      const patientId = appt.patient?.patientId ?? "—";
      const doctor = appt.doctor?.name ?? "—";
      const time = appt.timeSlot ?? "—";
      const reason = appt.reason ?? "—";
      const status = appt.status ?? "unknown";

      return `
      <tr>
        <td>${patient}</td>
        <td>${patientId}</td>
        <td>${doctor}</td>
        <td>${time}</td>
        <td>${reason}</td>
        <td><span class="status-badge status-${status}">${status}</span></td>
      </tr>
    `;
    })
    .join("");
}

// ── Kick it off ──
loadDashboard();
