const Home = {
  template: `
    <div class="container mt-5">
      <div class="text-center mb-4">
        <h1 class="display-5">Hospital Management System</h1>
        <p class="lead">Efficiently manage patients, doctors, and appointments</p>
      </div>

      <div class="container mt-5">
        <div class="row justify-content-center">
          <div class="col-md-4">
            <div class="card shadow-sm text-center p-4">
              <h3 class="mb-3">Welcome</h3>
              <p class="text-muted mb-4">Login to manage or book appointments</p>
              <router-link to="/login" class="btn btn-primary btn-lg w-100">
                Login
              </router-link>
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
