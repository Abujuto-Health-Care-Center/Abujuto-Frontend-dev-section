export function renderSideBar(activePage) {

return `<div class="logo">
          <img src="../HTML.img/Abujuto Logo.png" alt="abujto">
          <div class="logo-text">
           <h2>Àbójútó</h2>
           <p>ADMIN CENTER</p>
        </div>
        </div>
         <nav class="nav-items">
          <ul class="nav-list">
            <li class="nav-item ${activePage === "dashboard" ? "active" : ""} ">
              <a href="dashboard.html" class="nav-link-list">
                <img src="../assets/icons/dashboard-Icon.png" alt="">
                <span>Dashboard</span>
              </a>
            </li>

            <li class="nav-item ${activePage === "patients" ? 'active' : ''} ">
               <a href="patients.html" class="nav-link-list">
                <img src="../assets/icons/patients-icon.png" alt="">
                <span>Patients</span>
               </a>
            </li>

            <li class="nav-item ${activePage === "appointments" ? "active" : ""} ">
               <a href="appointments.html" class="nav-link-list">
                <img src="../assets/icons/appointment-Icon.png" alt="">
                <span>Appointments</span>
               </a>
            </li>

            <li class="nav-item ${activePage === "consultations" ? "active" : ""} ">
               <a href="consultations.html" class="nav-link-list">
                <img src="../assets/icons/assets/icons/consultation.png" alt="">
                <span>Consultations</span>
               </a>
            </li>

            <li class="nav-item ${activePage === "billings" ? "active" : ""} ">
               <a href="billing.html" class="nav-link-list">
                <img src="../assets/icons/assets/icons/Money-icon.png" alt="">
                <span>Billing</span>
               </a>
            </li>

            <li class="nav-item  ${activePage === "Messages" ? "active" : ""} ">
               <a href="messages.html" class="nav-link-list">
                <img src="../assets/icons/assets/icons/Messages.png" alt="">
                <span>Messages</span>
               </a>
            </li>

            <li class="nav-item  ${activePage === "settings" ? "active" : ""} ">
               <a href="settings.html" class="nav-link-list">
                <img src="../assets/icons/assets/icons/settings.png" alt="">
                <span>Settings</span>
               </a>
            </li>

            <li class="nav-item  ${activePage === "logout" ? "active" : ""} ">
               <a href="../../index.html" class="nav-link-list">
                <img src="../assets/icons/assets/icons/Logout.png" alt="">
                <span>Logout</span>
               </a>
            </li>
          </ul>
         </nav>`;
}
