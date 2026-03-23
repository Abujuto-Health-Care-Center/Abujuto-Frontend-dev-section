import { renderSideBar } from "../components/sidebar.js";

// ══════════════════════════════════════════
//  CONFIG
// ══════════════════════════════════════════
const BASE_URL = "http://localhost:5000";

// ── Auth guard ──
const token =
  sessionStorage.getItem("auth_token") || localStorage.getItem("auth_token");
const userRaw =
  sessionStorage.getItem("auth_user") || localStorage.getItem("auth_user");
if (!token || !userRaw) window.location.href = "../index.html";

const user = JSON.parse(userRaw);

// ── Sidebar ──
const sideBar = document.querySelector(".side-bar");
if (sideBar) sideBar.innerHTML = renderSideBar("appointments");

// ── Populate profile name/role in header ──
const profileName = document.querySelector(".profile-name");
const profileRole = document.querySelector(".profile-role");
if (profileName) profileName.textContent = user.name ?? "User";
if (profileRole) profileRole.textContent = user.role ?? "";

// ── Authorised fetch ──
async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  if (res.status === 401) {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "../index.html";
  }
  return res.json();
}

// ══════════════════════════════════════════
//  HAMBURGER MENU (mobile/tablet)
// ══════════════════════════════════════════
const hamburgerBtn = document.getElementById("hamburgerBtn");
const sidebarOverlay = document.getElementById("sidebarOverlay");

function openSidebar() {
  sideBar.classList.add("open");
  sidebarOverlay.classList.add("visible");
  hamburgerBtn.classList.add("open");
}

function closeSidebar() {
  sideBar.classList.remove("open");
  sidebarOverlay.classList.remove("visible");
  hamburgerBtn.classList.remove("open");
}

hamburgerBtn?.addEventListener("click", () => {
  sideBar.classList.contains("open") ? closeSidebar() : openSidebar();
});

sidebarOverlay?.addEventListener("click", closeSidebar);

// Close sidebar when window resizes back to desktop
window.addEventListener("resize", () => {
  if (window.innerWidth > 900) closeSidebar();
});

// ══════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════
let selectedDoctorId = null;
let selectedDoctorName = null;
let selectedTimeSlot = null;
let selectedPatientId = null;

// Doctor list — static since API has no GET /api/doctors endpoint
// Update _id values once your backend shares them
// const DOCTORS = [
//   { _id: '69b9d47c5c341bab8e85eece', name: 'Dr. Emeka',          initials: 'DE', specialty: 'General Practice' },
//   { _id: 'doctor-id-2',             name: 'Dr. Johnson Emma',    initials: 'JE', specialty: 'General Medicine' },
//   { _id: 'doctor-id-3',             name: 'Dr. David Ige',       initials: 'DI', specialty: 'Pediatrics'       },
//   { _id: 'doctor-id-4',             name: 'Dr. James Sunday',    initials: 'JS', specialty: 'Cardiology'       },
//   { _id: 'doctor-id-5',             name: 'Dr. Sandra Johnson',  initials: 'SJ', specialty: 'Dermatology'      },
// ];

// Time slots — generated, booked ones come from the dashboard API
const MORNING_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
];
const AFTERNOON_SLOTS = [
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
];

// ══════════════════════════════════════════
//  LOAD DASHBOARD DATA (stats + booked slots)
// ══════════════════════════════════════════
async function loadDashboardData() {
  try {
    const data = await apiFetch("/api/dashboard");
    const d = data.data;

    // Stat counters
    setText("stat-today", d.todayAppointments?.count ?? 0);

    // Count active (scheduled) appointments
    const activeCount = (d.todayAppointments?.list ?? []).filter(
      (a) => a.status === "scheduled",
    ).length;
    setText("stat-active", activeCount);

    // Mark booked slots from today's appointments
    const bookedTimes = (d.todayAppointments?.list ?? []).map(
      (a) => a.timeSlot,
    );
    renderSlots("morningSlots", MORNING_SLOTS, bookedTimes);
    renderSlots("afternoonSlots", AFTERNOON_SLOTS, bookedTimes);

    // Today's schedule list
    renderSchedule(d.todayAppointments?.list ?? []);
    renderSchedule(d.todayAppointments?.list ?? []);
    extractAndRenderDoctors(d.todayAppointments?.list ?? []); // ← add this

    // Set today's date as default in date picker
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("appt-date").value = today;
  } catch (err) {
    console.error("Failed to load dashboard data:", err);
  }
}

// ══════════════════════════════════════════
//  DOCTOR LIST
// ══════════════════════════════════════════
// Remove the entire static DOCTORS array and renderDoctors() function.
// Replace with this:

function extractAndRenderDoctors(appointmentsList) {
  const seen = new Map();

  // Extract unique doctors from today's appointments
  appointmentsList.forEach((appt) => {
    if (appt.doctor?._id && !seen.has(appt.doctor._id)) {
      seen.set(appt.doctor._id, {
        _id: appt.doctor._id,
        name: appt.doctor.name,
        specialty: appt.doctor.specialization ?? "General Practice",
        initials: appt.doctor.name
          .split(" ")
          .filter((w) => w.match(/[A-Z]/))
          .map((w) => w[0])
          .slice(0, 2)
          .join(""),
      });
    }
  });

  const doctors = [...seen.values()];

  // If no appointments yet, fall back to the one known doctor
  if (!doctors.length) {
    doctors.push({
      _id: "69b9d47c5c341bab8e85eece",
      name: "Dr. Emeka",
      specialty: "General Practice",
      initials: "DE",
    });
  }

  // Render the list
  const list = document.querySelector(".doctors-list");
  if (!list) return;

  list.innerHTML = doctors
    .map(
      (doc, i) => `
    <div class="list-doctor ${i === 0 ? "selected-doctor" : ""}"
         data-id="${doc._id}"
         data-name="${doc.name}"
         onclick="selectDoctor(this, '${doc._id}', '${doc.name}')">
      <div class="doctor-initials">${doc.initials}</div>
      <div>
        <p class="doctor-name">${doc.name}</p>
        <p class="doctor-specialty">${doc.specialty}</p>
      </div>
    </div>
  `,
    )
    .join("");

  // Auto-select first doctor
  if (doctors.length > 0) {
    selectDoctor(list.firstElementChild, doctors[0]._id, doctors[0].name);
  }
}

window.selectDoctor = function (el, id, name) {
  document
    .querySelectorAll(".list-doctor")
    .forEach((d) => d.classList.remove("selected-doctor"));
  el.classList.add("selected-doctor");
  selectedDoctorId = id;
  selectedDoctorName = name;
  document.getElementById("doctorName").textContent = name;
  // Reset selected time slot when doctor changes
  selectedTimeSlot = null;
  loadDashboardData(); // refresh slots for newly selected doctor
};

// ══════════════════════════════════════════
//  TIME SLOTS
// ══════════════════════════════════════════
function renderSlots(containerId, times, bookedTimes = []) {
  const grid = document.getElementById(containerId);
  if (!grid) return;
  grid.innerHTML = "";

  times.forEach((time) => {
    const isBooked = bookedTimes.includes(time);
    const status = isBooked ? "booked" : "available";
    const el = document.createElement("div");
    el.className = `slot ${status}`;
    el.dataset.time = time;

    el.innerHTML = `
      <span class="slot-time">${time}</span>
      ${isBooked ? '<span class="slot-status">Booked</span>' : ""}
    `;

    if (!isBooked) {
      el.addEventListener("click", () => handleSlotClick(el, time));
    }

    grid.appendChild(el);
  });
}

function handleSlotClick(el, time) {
  // Deselect previous
  document.querySelectorAll(".slot.selected").forEach((s) => {
    s.classList.replace("selected", "available");
    s.querySelector(".slot-status")?.remove();
  });

  // Select this one
  el.classList.replace("available", "selected");
  const statusSpan = document.createElement("span");
  statusSpan.className = "slot-status";
  statusSpan.textContent = "Selected";
  el.appendChild(statusSpan);
  selectedTimeSlot = time;
}

// ══════════════════════════════════════════
//  TODAY'S SCHEDULE LIST
// ══════════════════════════════════════════
function renderSchedule(appointments) {
  const list = document.getElementById("scheduleList");
  if (!list) return;

  if (!appointments.length) {
    list.innerHTML =
      '<p style="font-size:13px;color:#94a3b8;padding:10px 0">No appointments scheduled today.</p>';
    return;
  }

  list.innerHTML = appointments
    .map((appt) => {
      const patientName = appt.patient?.fullName ?? "Unknown";
      const doctorName = appt.doctor?.name ?? "—";
      const time = appt.timeSlot ?? "—";
      const reason = appt.reason ?? "";
      const status = appt.status ?? "pending";

      // Map API status values to badge classes
      const badgeClass =
        {
          scheduled: "confirmed",
          completed: "confirmed",
          cancelled: "cancelled",
          pending: "pending",
          "in-progress": "in-progress",
        }[status] ?? "pending";

      const badgeLabel =
        {
          scheduled: "Scheduled",
          completed: "Completed",
          cancelled: "Cancelled",
          pending: "Pending",
          "in-progress": "In Progress",
        }[status] ?? status;

      return `
      <div class="schedule-item">
        <div class="schedule-time">
          <span class="time">${time}</span>
          <span class="day">Today</span>
        </div>
        <div class="schedule-info">
          <div class="schedule-name">${patientName}</div>
          <div class="schedule-meta">${doctorName} • ${reason}</div>
        </div>
        <div class="schedule-actions">
          <span class="badge ${badgeClass}">${badgeLabel}</span>
        </div>
      </div>
    `;
    })
    .join("");
}

// ══════════════════════════════════════════
//  PATIENT SEARCH (live suggestions)
// ══════════════════════════════════════════
const patientSearchInput = document.getElementById("patient-search");
const patientSuggestions = document.getElementById("patientSuggestions");
const selectedPatientTag = document.getElementById("selectedPatientTag");
const selectedPatientIdEl = document.getElementById("selected-patient-id");

let searchTimer;

patientSearchInput?.addEventListener("input", (e) => {
  clearTimeout(searchTimer);
  const q = e.target.value.trim();

  if (!q) {
    hideSuggestions();
    return;
  }

  searchTimer = setTimeout(async () => {
    try {
      const results = await apiFetch(
        `/api/patients/search?q=${encodeURIComponent(q)}`,
      );
      const patients = Array.isArray(results.data)
        ? results.data
        : Array.isArray(results)
          ? results
          : [];
      showSuggestions(patients);
    } catch {
      hideSuggestions();
    }
  }, 350);
});

function showSuggestions(patients) {
  if (!patients.length) {
    patientSuggestions.innerHTML =
      '<div class="suggestion-item"><span class="suggestion-name">No patients found</span></div>';
    patientSuggestions.classList.add("visible");
    return;
  }

  patientSuggestions.innerHTML = patients
    .map(
      (p) => `
    <div class="suggestion-item" onclick="selectPatient('${p._id}', '${p.fullName}', '${p.patientId}')">
      <span class="suggestion-name">${p.fullName}</span>
      <span class="suggestion-id">${p.patientId} • ${p.phone ?? ""}</span>
    </div>
  `,
    )
    .join("");

  patientSuggestions.classList.add("visible");
}

function hideSuggestions() {
  patientSuggestions.classList.remove("visible");
}

window.selectPatient = function (id, name, patientId) {
  selectedPatientId = id;
  selectedPatientIdEl.value = id;
  patientSearchInput.value = "";
  hideSuggestions();

  // Show the green tag
  selectedPatientTag.style.display = "inline-flex";
  selectedPatientTag.innerHTML = `
    ${name} <span style="color:#94a3b8;font-weight:400">(${patientId})</span>
    <button onclick="clearPatient()" title="Remove">×</button>
  `;
};

window.clearPatient = function () {
  selectedPatientId = null;
  selectedPatientIdEl.value = "";
  selectedPatientTag.style.display = "none";
  patientSearchInput.value = "";
};

// Close suggestions when clicking outside
document.addEventListener("click", (e) => {
  if (!e.target.closest(".select-patient")) hideSuggestions();
});

// ══════════════════════════════════════════
//  BOOK APPOINTMENT (form submit)
// ══════════════════════════════════════════
document
  .getElementById("appointmentForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFeedback();

    // Validate
    if (!selectedDoctorId) {
      showError("Please select a doctor.");
      return;
    }
    if (!selectedPatientId) {
      showError("Please search and select a patient.");
      return;
    }
    if (!selectedTimeSlot) {
      showError("Please select a time slot.");
      return;
    }

    const date = document.getElementById("appt-date").value;
    const reason =
      document.getElementById("appt-reason").value.trim() || "General visit";
    const type = document.getElementById("visit-type").value;
    const duration = parseInt(document.getElementById("appt-duration").value);

    if (!date) {
      showError("Please select a date.");
      return;
    }

    // Build payload — exactly what the API expects
    const payload = {
      patient: selectedPatientId,
      doctor: selectedDoctorId,
      date,
      timeSlot: selectedTimeSlot,
      reason,
      type,
      duration,
      priority: "normal",
      notes: "",
    };

    setLoading(true);
    try {
      const data = await apiFetch("/api/appointments", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (data.message === "Appointment booked successfully") {
        showSuccess(
          `Appointment booked! ${data.data?.patient?.fullName ?? ""} at ${selectedTimeSlot}`,
        );

        // Mark slot as booked in the UI
        const bookedSlot = document.querySelector(
          `.slot[data-time="${selectedTimeSlot}"]`,
        );
        if (bookedSlot) {
          bookedSlot.classList.replace("selected", "booked");
          bookedSlot.querySelector(".slot-status").textContent = "Booked";
          bookedSlot.onclick = null;
        }

        // Reset form state
        selectedTimeSlot = null;
        clearPatient();
        document.getElementById("appt-reason").value = "";

        // Refresh schedule list
        loadDashboardData();
      } else {
        showError(data.message || "Booking failed. Please try again.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      showError("Cannot reach the server. Check your connection.");
    } finally {
      setLoading(false);
    }
  });

// ══════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function showError(msg) {
  const el = document.getElementById("apptError");
  el.textContent = msg;
  el.style.display = "block";
}

function showSuccess(msg) {
  const el = document.getElementById("apptSuccess");
  el.textContent = msg;
  el.style.display = "block";
}

function clearFeedback() {
  document.getElementById("apptError").style.display = "none";
  document.getElementById("apptSuccess").style.display = "none";
}

function setLoading(on) {
  const btn = document.getElementById("scheduleBtn");
  btn.textContent = on ? "Booking..." : "Schedule Appointment";
  btn.style.opacity = on ? "0.7" : "1";
  btn.style.pointerEvents = on ? "none" : "auto";
}

// ── Also add selected-doctor highlight style ──
const style = document.createElement("style");
style.textContent = `
  .list-doctor.selected-doctor {
    background: #2E6B50;
    border-color: #2E6B50;
  }
  .list-doctor.selected-doctor .doctor-name,
  .list-doctor.selected-doctor .doctor-specialty,
  .list-doctor.selected-doctor .doctor-initials {
    color: #fff;
  }
`;
document.head.appendChild(style);

// Set today's date display
const todayLabel = document.getElementById("slotDate");
if (todayLabel) {
  todayLabel.textContent = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ── Kick off ──
loadDashboardData();
