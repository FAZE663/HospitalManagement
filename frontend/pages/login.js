
export default {
  name: "LoginSelection",
  data() {
    return {
      selectedRole: null,
      email: "",
      password: "",
      loading: false,
      error: ""
    };
  },
  methods: {
    selectRole(role) {
      this.selectedRole = role;
    },
    login() {
      if (!this.email || !this.password) {
        if (this.selectedRole=='admin' && this.password){
            
        }
        else{
            this.error = "Please enter email and password.";
            return;
        }
      }

      this.loading = true;
      this.error = "";

      fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: this.email,
          password: this.password,
          role: this.selectedRole
        })
      })
      .then(res => res.json())
      .then(data => {
        this.loading = false;
        if (data.success) {
          this.$root.isAuth = true;
          this.$root.userid = data.userid;
          this.$root.userrole = this.selectedRole;

          localStorage.setItem('isAuth',true);
          localStorage.setItem("userid", data.userid);
          localStorage.setItem("userrole", this.selectedRole);
          localStorage.setItem('username' , data.username);

          // redirect based on role
          if (this.selectedRole === "doctor") this.$router.push("/doctor/dashboard");
          else if (this.selectedRole === "patient") this.$router.push("/patient/dashboard");
          else if (this.selectedRole === "admin") this.$router.push("/admin/dashboard");
        } else {
          this.error = data.message || "Invalid credentials.";
        }
      })
      .catch(err => {
        console.error(err);
        this.loading = false;
        this.error = "Server error. Try again later.";
      });
    }
  },
  template: `
    <div class="container mt-5" style="max-width:400px;">
    <div class="card shadow-sm p-4 text-center">
      <h3 class="mb-4">Select User Type</h3>

      <div class="d-grid gap-3">
        <button class="btn btn-primary" @click="selectRole('patient')">Patient</button>
        <button class="btn btn-success" @click="selectRole('doctor')">Doctor</button>
        <button class="btn btn-warning" @click="selectRole('admin')">Admin</button>
      </div>

      <div v-if="selectedRole" class="mt-4">
        <p>Logging in as: <strong>{{ selectedRole }}</strong></p>

        <div v-if='selectedRole!=="admin"' class="form-group mb-2">
          <input v-model="email" type="email" class="form-control" placeholder="Email">
        </div>
        <div class="form-group mb-3">
          <input v-model="password" type="password" class="form-control" placeholder="Password">
        </div>

        <button class="btn btn-primary w-100" @click="login" :disabled="loading">
          {{ loading ? "Logging in..." : "Login" }}
        </button>

        <p class="text-danger mt-3" v-if="error">{{ error }}</p>
        <div v-if="selectedRole === 'patient'">
            <router-link to="/register"><em>New User?</em></router-link>
        </div>


    </div>
  </div>
  `
};

