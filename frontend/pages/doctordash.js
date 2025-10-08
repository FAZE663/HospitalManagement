export default {
  name: "DoctorDashboard",
  data() {
    return {
      doctorName: "Dr. John Doe",
      todayAppointments: [
        { id: 1, patient: "Alice Johnson", time: "10:00 AM", status: "Upcoming" },
        { id: 2, patient: "Bob Smith", time: "11:30 AM", status: "Completed" },
      ],
      upcomingAppointments: [
        { id: 3, patient: "Eve Adams", date: "2025-10-06", time: "2:00 PM" },
      ],
      availability: true, // Doctor's availability toggle
    };
  },
  methods: {
    toggleAvailability() {
      this.availability = !this.availability;
    },
    viewPatientHistory(patientName) {
      alert(`Viewing history for ${patientName}`);
      // Later → router push or API call
    },
  },
  template: `
  <div class="container mt-4">
    <h2 class="text-primary mb-3">Doctor Dashboard</h2>
    <h5 class="text-muted mb-4">Welcome, {{ doctorName }}</h5>

    <!-- Availability Toggle -->
    <div class="d-flex align-items-center mb-4">
      <label class="form-check-label me-2 fw-bold">Availability:</label>
      <div class="form-check form-switch">
        <input class="form-check-input" type="checkbox" id="availabilitySwitch" v-model="availability" @change="toggleAvailability">
        <label class="form-check-label" for="availabilitySwitch">{{ availability ? "Available" : "Unavailable" }}</label>
      </div>
    </div>

    <!-- Today's Appointments -->
    <div class="card shadow-sm mb-4">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0">Today's Appointments</h5>
      </div>
      <div class="card-body">
        <table class="table table-hover align-middle">
          <thead>
            <tr>
              <th>#</th>
              <th>Patient</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(appt, index) in todayAppointments" :key="appt.id">
              <td>{{ index + 1 }}</td>
              <td>{{ appt.patient }}</td>
              <td>{{ appt.time }}</td>
              <td>
                <span
                  class="badge"
                  :class="appt.status === 'Completed' ? 'bg-success' : 'bg-warning text-dark'"
                >
                  {{ appt.status }}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-info" @click="viewPatientHistory(appt.patient)">
                  View Notes
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Upcoming Appointments -->
    <div class="card shadow-sm mb-4">
      <div class="card-header bg-success text-white">
        <h5 class="mb-0">Upcoming Appointments</h5>
      </div>
      <div class="card-body">
        <table class="table table-hover align-middle">
          <thead>
            <tr>
              <th>#</th>
              <th>Patient</th>
              <th>Date</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(appt, index) in upcomingAppointments" :key="appt.id">
              <td>{{ index + 1 }}</td>
              <td>{{ appt.patient }}</td>
              <td>{{ appt.date }}</td>
              <td>{{ appt.time }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Manage Patients -->
    <div class="card shadow-sm">
      <div class="card-body text-center">
        <h5 class="card-title mb-3">View All Patients</h5>
        <router-link to="/doctor/patients" class="btn btn-primary">Go to Patient List</router-link>
      </div>
    </div>
  </div>
  `,
};
