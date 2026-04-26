

export default {
  name: "PatientRegister",
  data() {
    return {
      form: {
        name: "",
        age: "",
        phone: "",
        email: "",
        gender: "",
        password: ""
      }
    };
  },
  methods: {
    async registerPatient() {
      try {
        const res = await fetch("/api/patients", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(this.form)
        });

        if (!res.ok) throw new Error("Registration failed");

        alert("Registration successful!");
        this.$router.push("/login"); // redirect to login after registration
      } catch (err) {
        console.error(err);
        alert("Error during registration. Please try again.");
      }
    }
  },
  template: `
      <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow-sm p-4">
          <h3 class="text-center mb-4">Patient Registration</h3>

          <form @submit.prevent="registerPatient">

            <div class="mb-3">
              <label class="form-label">Full Name</label>
              <input v-model="form.name" type="text" class="form-control" required />
            </div>

            <div class="mb-3">
              <label class="form-label">Date of Birth</label>
              <input v-model="form.age" type="date" class="form-control" required />
            </div>

            <div class="mb-3">
              <label class="form-label">Phone Number</label>
              <input v-model="form.phone" type="tel" class="form-control" required />
            </div>

            <div class="mb-3">
              <label class="form-label">Email</label>
              <input v-model="form.email" type="email" class="form-control" required />
            </div>

            <div class="mb-3">
              <label class="form-label">Gender</label>
              <select v-model="form.gender" class="form-select" required>
                <option value="" disabled>Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label">Password</label>
              <input v-model="form.password" type="password" class="form-control" required />
            </div>

            <button type="submit" class="btn btn-primary w-100">Register</button>

          </form>
          
        </div>
      </div>
    </div>
  </div>
  `
};

