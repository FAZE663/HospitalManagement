const Navbar = {
  props: ["userrole"],
  computed: {
    isAdmin() {
      return this.userrole === "admin";
    },
    isDoctor() {
      return this.userrole === "doctor";
    },
    isPatient() {
      return this.userrole === "patient";
    },
  },
  template: `
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container-fluid">
      <router-link class="navbar-brand" to="/">Hospital System</router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">

          
          

          <!-- Admin Menu -->

          <template v-if="isAdmin">

            <li class="nav-item">
            <router-link class="nav-link" to="/admin/dashboard">Dashboard</router-link>
          </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/doctors">Doctors</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/patients">Patients</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/appointments">Appointments</router-link>
            </li>
          </template>

          <!-- Doctor Menu -->
          <template v-if="isDoctor">
          <li class="nav-item">
            <router-link class="nav-link" to="/doctor/dashboard">Dashboard</router-link>
          </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/doctor/patients">My Patients</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/doctor/appointments">My Appointments</router-link>
            </li>

            <li class="nav-item">
              <router-link class="nav-link" to="/doctor/profile">My Profile</router-link>
            </li>
          </template>

          <!-- Patient Menu -->
          <template v-if="isPatient">
          <li class="nav-item">
            <router-link class="nav-link" to="/patient/dashboard">Dashboard</router-link>
          </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/patient/book">Book Appointment</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/patient/history">My History</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/patient/profile">My Profile</router-link>
            </li>
          </template>

          <!-- Logout always shown -->
          <li class="nav-item">
            <router-link class="nav-link text-warning" to="/logout">Logout</router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  `,
};

export default Navbar;
