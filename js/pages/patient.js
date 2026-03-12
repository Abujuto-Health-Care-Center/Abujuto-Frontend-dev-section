const profile_pic_input = document.getElementById("profile_pic_input");
const uploadBtn = document.getElementById("uploadBtn");
const preview = document.getElementById("profile_image_preview");
const states_of_residence = document.getElementById("state_of_residence");
const state_of_origin = document.getElementById("state_of_origin");

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

// Update the state tag with all states available
states.forEach((state) => {
  states_of_residence.innerHTML += `<option value="${state}">${state}</option>`;
  state_of_origin.innerHTML += `<option value="${state}">${state}</option>`;
});

uploadBtn.addEventListener("click", () => {
  profile_pic_input.click();
});

profile_pic_input.addEventListener("change", function () {
  const file = this.files[0];

  if (file) {
    const imageURL = URL.createObjectURL(file);
    preview.src = imageURL;
  }
});
