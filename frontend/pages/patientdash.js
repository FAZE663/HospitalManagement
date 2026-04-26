export default {
  name: "PatientDashboard",

  data() {
    return {
      patientName: "",
      appointments: [],
      departments: [],   // 👈 NEW
    };
  },

  computed: {
    upcomingAppointments() {
      return this.appointments.filter(a => a.status === "upcoming");
    },
  },

  methods: {
    fetchPatientData() {
      const uid = localStorage.getItem("userid");

      fetch(`/api/patients/${uid}`)
        .then(res => res.json())
        .then(data => {
          this.patientName = data.name;
          this.appointments = data.appointments || [];
        })
        .catch(err => console.error("Patient fetch error:", err));
    },

    fetchDepartments() {
      fetch("/api/departments")
        .then(res => res.json())
        .then(data => {
          this.departments = data;   
          console.log(this.departments);// [{dept_id, dept_name}]
        })
        .catch(err => console.error("Department fetch error:", err));
    },

    bookDept(dept_id) {
      this.$router.push(`/patient/doctorlist?dept=${dept_id}`);
    },

    cancelAppt(id) {
      const appt = this.appointments.find(a => a.id === id);

      if (!appt) return;

      fetch(`/api/appointments/${id}`, { method: "DELETE" })
        .then(res => {
          if (!res.ok) throw new Error("Server error cancelling appointment");
          appt.status = "cancelled";
          alert("Appointment cancelled.");
        })
        .catch(err => {
          console.error(err);
          alert("Error cancelling appointment.");
        });
    },
    reshedAppt(id) {
      this.$router.push(`/patient/book?aid=${id}`);
    },
    datecon(str){
      return new Date(str).toDateString();
    }
  },

  mounted() {
    this.fetchPatientData();
    this.fetchDepartments();   // 👈 Load departments on page load
  },

  template: `
    <div class="container mt-4">

      <h2 class="text-primary mb-2">Patient Dashboard</h2>
      <h5 class="text-muted mb-4">Welcome, {{ patientName }}</h5>

      <!-- UPCOMING APPOINTMENTS -->
      <div class="card shadow-sm mb-4">
        <div class="card-header bg-success text-white">
          <h5 class="mb-0">Upcoming Appointments</h5>
        </div>

        <div class="card-body" v-if="upcomingAppointments.length">
          <table class="table table-hover align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(a, i) in upcomingAppointments" :key="a.id">
                <td>{{ i + 1 }}</td>
                <td>{{ a.doctor }}</td>
                <td>{{ datecon(a.date) }}</td>
                <td>{{ a.time }}</td>
                <td><span class="badge bg-warning text-dark">{{ a.status }}</span></td>

                <td>
                  <button class="btn btn-sm btn-danger" @click="cancelAppt(a.id)">
                    Cancel
                  </button>
                  <button class="btn btn-sm btn-success" @click="reshedAppt(a.id)">
                    Reshedule
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card-body text-center text-muted" v-else>
          No upcoming appointments.
        </div>
      </div>

      <!-- DEPARTMENTS -->
      <h4 class="mb-3">Consult a Doctor by Department</h4>

      <div class="row g-3">
        <div 
          class="col-md-3" 
          v-for="dept in departments" 
          :key="dept.id"
        >
          <div 
            class="card shadow-sm text-center p-3 dept-tile"
            style="cursor: pointer;"
            @click="bookDept(dept.id)"
          >
            <h5 class="text-primary">{{ dept.name }}</h5>
          </div>
        </div>
      </div>

    </div>
  `
};
