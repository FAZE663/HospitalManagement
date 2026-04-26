export default {
  name: "MyAppointments",
  data() {
    return {
      searchQuery: "",
      appointments: [],
    };
  },
  computed: {
    filteredAppointments() {
      const q = this.searchQuery.toLowerCase();
      return this.appointments.filter(
        (a) =>
          a.patient.toLowerCase().includes(q) ||
          a.date.toLowerCase().includes(q) ||
          a.time.toLowerCase().includes(q) ||
          a.status.toLowerCase().includes(q)
      );
    },
  },
  methods: {
    fetchAppointments(userid) {
      fetch(`/api/appointments/doctors/${userid}`)
        .then((response) => response.json())
        .then((data) => {
          this.appointments = data.map((appt) => ({
            id: appt.id,
            patient: appt.patient,
            date: appt.date,
            time: appt.time,
            status: appt.status,
            pid: appt.pid,
          }));
        })
        .catch((error) =>
          console.error("Error fetching appointments:", error)
        );
    },
  },
  mounted() {
    const userid = this.$root.userid; 
    this.fetchAppointments(userid);
  },
  template: `
  <div class="container mt-4">
    <h3 class="text-primary mb-4">My Appointments</h3>

    <!-- Search Bar -->
    <div class="input-group mb-3 w-50">
      <input
        v-model="searchQuery"
        type="text"
        class="form-control"
        placeholder="Search appointments..."
      />
      <span class="input-group-text"><i class="bi bi-search"></i></span>
    </div>

    <!-- Appointments Table -->
    <div v-if="filteredAppointments.length === 0" class="text-center text-muted">
      No matching appointments found.
    </div>

    <table v-else class="table table-hover align-middle">
      <thead>
        <tr>
          <th>#</th>
          <th>Patient</th>
          <th>Date</th>
          <th>Time</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(appt, index) in filteredAppointments" :key="appt.id">
          <td>{{ index + 1 }}</td>
          <td>{{ appt.patient }}</td>
          <td>{{ appt.date }}</td>
          <td>{{ appt.time }}</td>
          <td>
            <span
              class="badge"
              :class="{
                'bg-success': appt.status === 'completed',
                'bg-warning text-dark': appt.status === 'upcoming',
                'bg-secondary': appt.status === 'cancelled'
              }"
            >
              {{ appt.status }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  `,
};
