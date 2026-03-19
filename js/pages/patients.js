import { renderSideBar } from "../components/sidebar.js";

let sideBar = document.querySelector(".side-bar");
sideBar.innerHTML = renderSideBar("patients");

function updatePatientCard(data) {
  document.getElementById("patientName").textContent = data.name;
  document.getElementById("patientId").textContent = data.id;
  document.getElementById("patientAge").textContent = data.age + " years";
  document.getElementById("patientGender").textContent = data.gender;
  document.getElementById("patientBlood").textContent = data.bloodGroup;
  document.getElementById("lastVisit").textContent = data.lastVisit;
  document.getElementById("chiefComplaint").textContent =
    "Chief Complaint: " + data.complaint;

  document.getElementById("patientAvatar").src = data.avatar;
}