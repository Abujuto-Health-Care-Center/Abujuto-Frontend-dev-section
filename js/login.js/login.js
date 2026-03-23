// ══════════════════════════════════════════
//  CONFIG — set this to your backend URL
// ══════════════════════════════════════════
const BASE_URL = 'https://abojuto.onrender.com'; // ← change to your real server address

// Detect if we're on GitHub Pages and build the correct base path
function getBasePath() {
  const path = window.location.pathname;
  const isGitHubPages = path.includes('.github.io') || 
                        (path.match(/\//g) || []).length > 1; // Multiple slashes indicate repo folder
  
  if (isGitHubPages) {
    // Extract repo name from path: /repo-name/html/login.html → /repo-name/
    const parts = path.split('/');
    const repoName = parts[1];
    return repoName ? `/${repoName}/` : '/';
  }
  return '/'; // Local development
}

const BASE_PATH = getBasePath();

// Where to send each role after login — using absolute paths
const ROLE_REDIRECTS = {
  'doctor':       BASE_PATH + 'html/dashboard.html',
  'nurse':        BASE_PATH + 'html/dashboard.html',
  'accountant':   BASE_PATH + 'html/dashboard.html',
  'admin':        BASE_PATH + 'html/dashboard.html',
  'receptionist': BASE_PATH + 'html/dashboard.html',
};

// ── DOM refs ──
const toggleBtn    = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const eyeIcon      = document.getElementById('eyeIcon');
const loginBtn     = document.getElementById('loginBtn');
const errorMessage = document.getElementById('errorMessage');
const errorText    = document.getElementById('errorText');

// ── Eye icon SVG paths ──
const eyeOpen   = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
const eyeClosed = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`;

// ── Password toggle ──
toggleBtn.addEventListener('click', () => {
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';
  eyeIcon.innerHTML  = isPassword ? eyeClosed : eyeOpen;
});

// ── Helpers ──
function showError(msg) {
  errorText.textContent = msg;
  errorMessage.classList.add('visible');
}

function clearError() {
  errorMessage.classList.remove('visible');
}

function setLoading(on) {
  loginBtn.classList.toggle('loading', on);
}

// Clear error as soon as the user starts typing again
document.getElementById('loginForm').addEventListener('input', clearError);

// ── Form submit ──
document.getElementById('loginForm').addEventListener('submit', handleLogin);

async function handleLogin(e) {
  e.preventDefault();
  clearError();

  // 1. Role must be selected
  const selectedRole = document.querySelector('input[name="role"]:checked')?.value;
  if (!selectedRole) {
    showError('Please select your role before logging in.');
    return;
  }

  // 2. "Staff ID" field maps to email in the API
  const email  = document.getElementById('staff-id').value.trim();
  const password     = document.getElementById('password').value;
  const keepLoggedIn = document.getElementById('keep-logged-in').checked;

  if (!email || !password) {
    showError('Please enter your Staff ID and password.');
    return;
  }

  // 3. Hit the API
  setLoading(true);
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    // 4. API returned an error (wrong password, user not found, etc.)
    if (!response.ok) {
      showError(data.message || data.error || 'Invalid credentials. Please try again.');
      setLoading(false);
      return;
    }

    // 5. Success — API returns { status, data: { token, user: { id, name, role } } }
    if (data.status === 'success') {
      const { token, user } = data.data;
      const returnedRole = user.role.toLowerCase(); // "Doctor" → "doctor"

      // 6. Save token — localStorage if "keep me logged in", sessionStorage if not
      const storage = keepLoggedIn ? localStorage : sessionStorage;
      storage.setItem('auth_token', token);
      storage.setItem('auth_user', JSON.stringify(user));

      // 7. Redirect to the correct dashboard based on server-confirmed role
      const destination = ROLE_REDIRECTS[returnedRole] || '../dashboard/index.html';
      window.location.href = destination;

    } else {
      showError(data.message || 'Login failed. Please try again.');
      setLoading(false);
    }

  } catch (err) {
    // Network failure / server is down
    console.error('Login error:', err);
    showError('Cannot reach the server. Check your connection and try again.');
    setLoading(false);
  }
}