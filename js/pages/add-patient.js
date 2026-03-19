const profile_pic_input = document.getElementById("profile_pic_input");
const uploadBtn = document.getElementById("uploadBtn");
const submitBtn = document.getElementById("submitBtn");
const preview = document.getElementById("profile_image_preview");
const states_of_residence = document.getElementById("state_of_residence");
const state_of_origin = document.getElementById("state_of_origin");
const form = document.querySelector(".patient-registration-form");

const states = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

// Update the Select tag with all states available
states.forEach((state) => {
  states_of_residence.innerHTML += `<option value="${state}">${state}</option>`;
});

// To open the input file when the Select Image btn is pressed.
uploadBtn.addEventListener("click", () => {
  profile_pic_input.click();
});

//To Handle displaying the profile pics when it is selected
profile_pic_input.addEventListener("change", function () {
  preview.classList.add("adjust-pics-size");
  const file = this.files[0];

  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    alert("File must be less than 2MB");
    profile_pic_input.value = "";
    return;
  }

  if (!file.type.startsWith("image/")) {
    alert("Only image files allowed");
    profile_pic_input.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    preview.src = e.target.result;
    preview.style.display = "block";
    // cameraIcon.style.display="none";
  };

  reader.readAsDataURL(file);
});

//To handle form submission
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = new FormData(form);
  const patientData = Object.fromEntries(formData.entries());

  console.log(formData);
  console.log(patientData);

  validateInputs(patientData);

  submitBtn.textContent = "Submitting...";
  submitBtn.disabled = true;

  //Submit the Form now
  try {
    const response = await fetch("https://api.yourserver.com/patients", {
      method: "POST",
      body: formData,
    });

    //Response is back here
    console.log(response);
    if (!response.ok) {
      throw new Error(`Couldn't fetch`);
    }

    const data = await response.json();
    console.log(data);

    submitBtn.textContent = "Complete Registration";
    submitBtn.disabled = false;
    alert("Patient registered successfully!");
  } catch {
    console.error(Error);
  }

  form.reset();
});

function validateInputs(object) {}


//Import the sidebar

import { renderSideBar } from "../components/sidebar.js";

let sideBar = document.querySelector(".side-bar");
sideBar.innerHTML = renderSideBar("patients");
