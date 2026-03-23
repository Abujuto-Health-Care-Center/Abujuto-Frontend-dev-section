import { renderSideBar } from '../components/sidebar.js';

// ── Sidebar ──
const sideBar = document.querySelector('.side-bar');
if (sideBar) sideBar.innerHTML = renderSideBar('patients');

// ══════════════════════════════════════════
//  CONFIG
// ══════════════════════════════════════════
const BASE_URL = 'https://abojuto.onrender.com';

// ── Auth guard ──
const token   = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
const userRaw = sessionStorage.getItem('auth_user')  || localStorage.getItem('auth_user');
if (!token || !userRaw) window.location.href = '../index.html';

// ── DOM refs ──
const profile_pic_input = document.getElementById('profile_pic_input');
const uploadBtn         = document.getElementById('uploadBtn');
const submitBtn         = document.getElementById('submitBtn');
const preview           = document.getElementById('profile_image_preview');
const form              = document.querySelector('.patient-registration-form');
const formError         = document.getElementById('formError');
const formErrorText     = document.getElementById('formErrorText');
const formSuccess       = document.getElementById('formSuccess');
const formSuccessText   = document.getElementById('formSuccessText');
const statesSelect      = document.getElementById('state_of_residence');

// ── Nigerian states ──
const states = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
  'Yobe','Zamfara'
];

states.forEach(state => {
  statesSelect.innerHTML += `<option value="${state}">${state}</option>`;
});

// ── Profile photo upload ──
uploadBtn.addEventListener('click', () => profile_pic_input.click());

profile_pic_input.addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    showError('Photo must be less than 2MB.');
    profile_pic_input.value = '';
    return;
  }

  if (!file.type.startsWith('image/')) {
    showError('Only image files are allowed.');
    profile_pic_input.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    preview.src = e.target.result;
    preview.classList.add('adjust-pics-size');
  };
  reader.readAsDataURL(file);
});

// ══════════════════════════════════════════
//  FORM SUBMIT
// ══════════════════════════════════════════
form.addEventListener('submit', async function (e) {
  e.preventDefault();
  clearMessages();

  // 1. Read raw form values
  const fName          = document.getElementById('fName').value.trim();
  const sName          = document.getElementById('sName').value.trim();
  const dateOfBirth    = document.getElementById('DOB').value;
  const gender         = document.querySelector('input[name="gender"]:checked')?.value;
  const maritalStatus  = document.getElementById('maritalStatus').value;
  const allergies      = document.getElementById('allergies').value.trim();
  const bloodGroup     = document.getElementById('bloodGroup').value;
  // const occupation     = document.getElementById('occupation').value.trim();
  const nationalId     = document.getElementById('nationalId').value.trim();
  const insuranceNumber = document.getElementById('insuranceNumber').value.trim();
  const phone          = document.getElementById('PNumber').value.trim();
  const email          = document.getElementById('email').value.trim();
  const address        = document.getElementById('Address').value.trim();

  // Emergency contact
  const kinName         = document.getElementById('fName_kin').value.trim();
  const kinRelationship = document.getElementById('kin_relationship').value;
  const kinPhone        = document.getElementById('PNumber_kin').value.trim();

  // 2. Validate required fields
  // The API requires: fullName, dateOfBirth, gender, phone, address,
  // maritalStatus, bloodGroup, emergencyContact
  const missing = [];
  if (!fName)         missing.push('First Name');
  if (!sName)         missing.push('Surname');
  if (!dateOfBirth)   missing.push('Date of Birth');
  if (!gender)        missing.push('Gender');
  if (!phone)         missing.push('Phone Number');
  if (!address)       missing.push('Home Address');
  if (!maritalStatus) missing.push('Marital Status');
  if (!bloodGroup)    missing.push('Blood Group');
  if (!kinName)       missing.push('Next of Kin Name');
  if (!kinPhone)      missing.push('Next of Kin Phone');

  if (missing.length > 0) {
    showError(`Please fill in: ${missing.join(', ')}`);
    return;
  }

  // 3. Reshape data to match the API's expected structure
  //    Most importantly: fName + sName → fullName
  //    and emergencyContact is a nested object
  const payload = {
    fullName:        `${fName} ${sName}`,
    dateOfBirth,
    gender,
    maritalStatus,
    phone,
    address,
    bloodGroup,
    allergies:       allergies || 'None',
    occupation: "",
    nationalId,
    insuranceNumber,
    emergencyContact: {
      name:         kinName,
      phone:        kinPhone,
      relationship: kinRelationship,
    },
  };

  // Only include email if provided (it's optional)
  if (email) payload.email = email;

  // 4. Send to API as JSON
  setLoading(true);
  try {
    const response = await fetch(`${BASE_URL}/api/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    // 5. Handle response
    if (!response.ok) {
      // API returned an error — show its message
      showError(data.message || 'Registration failed. Please try again.');
      setLoading(false);
      return;
    }

    // 6. Success
    const patientId = data.data?.patientId ?? '';
    showSuccess(`Patient registered successfully! ID: ${patientId}`);
    form.reset();
    preview.src = '../assets/icons/upload-icon.png';
    preview.classList.remove('adjust-pics-size');

    // Redirect back to patients list after 2 seconds
    setTimeout(() => {
      window.location.href = 'patients.html';
    }, 2000);

  } catch (err) {
    console.error('Registration error:', err);
    showError('Cannot reach the server. Check your connection and try again.');
  } finally {
    setLoading(false);
  }
});

// ══════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════
function showError(msg) {
  formErrorText.textContent = msg;
  formError.classList.add('visible');
  formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showSuccess(msg) {
  formSuccessText.textContent = msg;
  formSuccess.classList.add('visible');
  formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function clearMessages() {
  formError.classList.remove('visible');
  formSuccess.classList.remove('visible');
}

function setLoading(on) {
  submitBtn.classList.toggle('loading', on);
  submitBtn.textContent = on ? 'Registering...' : 'Complete Registration';
}