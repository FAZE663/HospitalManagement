const Home = {
  template: `
    <div class="container mt-5">
      <div class="text-center mb-4">
        <h1 class="display-5">Welcome to Hospital Management System</h1>
        <p class="lead">Efficiently manage patients, doctors, and appointments</p>
      </div>

      <div class="row justify-content-center">
        <div class="col-md-3 mb-3">
          <div class="card shadow-sm">
            <div class="card-body text-center">
              <h5 class="card-title">Admin</h5>
              <p class="card-text">Manage doctors, patients, and appointments</p>
              <router-link to="/admin-login" class="btn btn-primary">Login</router-link>
            </div>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="card shadow-sm">
            <div class="card-body text-center">
              <h5 class="card-title">Doctor</h5>
              <p class="card-text">View your appointments and update patient history</p>
              <router-link to="/doctor-login" class="btn btn-success">Login</router-link>
            </div>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="card shadow-sm">
            <div class="card-body text-center">
              <h5 class="card-title">Patient</h5>
              <p class="card-text">Register, book appointments, and view history</p>
              <router-link to="/patient-login" class="btn btn-warning text-white">Login / Register</router-link>
            </div>
          </div>
        </div>
      </div>

      <footer class="mt-5 text-center text-muted">
        &copy; 2025 Hospital Management System
      </footer>
    </div>
  `
};


export default Home;
