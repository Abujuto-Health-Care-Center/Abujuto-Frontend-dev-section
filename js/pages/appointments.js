import { renderSideBar } from "../components/sidebar.js";

let sideBar = document.querySelector(".side-bar");
sideBar.innerHTML = renderSideBar("appointments");

  // ─── Data (replace with dynamic fetch) ──────────────────────────────────
  const data = {
    doctor: "Dr. Johnson Emma",
    date: "Today, 10 March 2026",
    morningSlots: [
      { time: "08:00", status: "selected" },
      { time: "08:30", status: "available" },
      { time: "09:00", status: "available" },
      { time: "09:30", status: "booked" },
      { time: "10:00", status: "available" },
      { time: "10:30", status: "booked" },
      { time: "11:00", status: "available" },
      { time: "11:30", status: "available" },
    ],
    afternoonSlots: [
      { time: "01:00", status: "booked" },
      { time: "01:30", status: "available" },
      { time: "02:00", status: "available" },
      { time: "02:30", status: "available" },
      { time: "03:00", status: "available" },
      { time: "03:30", status: "booked" },
      { time: "04:00", status: "available" },
      { time: "04:30", status: "booked" },
    ],
    schedule: [
      { time: "09:00", day: "Today", name: "Marcus John",    meta: "Dr. Johnson Emma • Check-up",  status: "confirmed"   },
      { time: "10:30", day: "Today", name: "Priscilla Daboh", meta: "Dr. Femi Olukoya • Follow-up", status: "in-progress" },
      { time: "02:00", day: "Today", name: "Chike Orgu",     meta: "Dr. Sofia Rahmat • Check-up", status: "confirmed"   },
    ]
  };
 
  // ─── Render ──────────────────────────────────────────────────────────────
  document.getElementById("doctorName").textContent = data.doctor;
  document.getElementById("slotDate").textContent   = data.date;
 
  function renderSlots(containerId, slots) {
    const grid = document.getElementById(containerId);
    grid.innerHTML = "";
    slots.forEach(slot => {
      const el = document.createElement("div");
      el.className = `slot ${slot.status}`;
      el.innerHTML = `
        <span class="slot-time">${slot.time}</span>
        ${slot.status === "booked"   ? '<span class="slot-status">Booked</span>'   : ""}
        ${slot.status === "selected" ? '<span class="slot-status">Selected</span>' : ""}
      `;
      if (slot.status === "available" || slot.status === "selected") {
        el.addEventListener("click", () => {
          if (el.classList.contains("selected")) {
            el.classList.replace("selected", "available");
            el.querySelector(".slot-status")?.remove();
          } else {
            el.classList.replace("available", "selected");
            if (!el.querySelector(".slot-status")) {
              const s = document.createElement("span");
              s.className = "slot-status";
              s.textContent = "Selected";
              el.appendChild(s);
            }
          }
        });
      }
      grid.appendChild(el);
    });
  }
 
  function renderSchedule(items) {
    const list = document.getElementById("scheduleList");
    list.innerHTML = "";
    items.forEach(item => {
      const el = document.createElement("div");
      el.className = "schedule-item";
      el.innerHTML = `
        <div class="schedule-time">
          <span class="time">${item.time}</span>
          <span class="day">${item.day}</span>
        </div>
        <div class="schedule-info">
          <div class="schedule-name">${item.name}</div>
          <div class="schedule-meta">${item.meta}</div>
        </div>
        <div class="schedule-actions">
          <span class="badge ${item.status}">${formatStatus(item.status)}</span>
          <button class="btn-remove" title="Remove" onclick="this.closest('.schedule-item').remove()">&#x2715;</button>
        </div>
      `;
      list.appendChild(el);
    });
  }
 
  function formatStatus(s) {
    return { confirmed: "Confirmed", "in-progress": "In Progress", cancelled: "Cancelled", pending: "Pending" }[s] || s;
  }
 
  renderSlots("morningSlots",   data.morningSlots);
  renderSlots("afternoonSlots", data.afternoonSlots);
  renderSchedule(data.schedule);
