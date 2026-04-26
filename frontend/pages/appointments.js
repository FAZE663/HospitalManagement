export default {
  name: 'AdminAppointments',
  data() {
    return {
      appointments: [],
      searchQuery: "",
      showHistory: false,
      selectedPatient: null,
      patname: null,
      patientHistory: {}
    };
  },
  computed: {
    filteredAppointments() {
      return this.appointments.filter(a =>
        a.doctor.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        a.patient.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        a.dept.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  },
  methods: {
    viewHistory(pid,name) {
      this.fetchPatientHistory(pid);
      this.selectedPatient = pid;
      this.patname = name;
      this.showHistory = true;
      document.body.classList.add("modal-open"); 
    },
    closeHistory() {
      this.showHistory = false;
      this.selectedPatient = null;
      document.body.classList.remove("modal-open"); 
    },

    fetchAppointments() {
      fetch('/api/appointments')
        .then(response => response.json())
        .then(data => {
          
          this.appointments = data.map(app => ({
            id: app.id,
            doctor: app.doctor,
            patient: app.patient,
            pid: app.pid,
            dept: app.dept,
            date: app.date,
            time: app.time
          }));
        } )
        .catch(error => console.error('Error fetching appointments:', error));
    },
    fetchPatientHistory(pid) {
      fetch(`/api/patienthistory/${pid}`)
        .then(response => response.json())
        .then(data => {
          console.log('Fetched patient history:', data);
          this.$set(this.patientHistory, pid, data);
        })
        .catch(error => console.error('Error fetching patient history:', error));
    }
  },
  mounted() {
    this.fetchAppointments();
  },


  template: `
  <div class="container mt-4">
    <h2 class="text-primary mb-4">Appointments Overview</h2>

    <!-- Search Bar -->
    <div class="input-group mb-3 w-50">
      <input v-model="searchQuery" type="text" class="form-control" placeholder="Search by doctor, patient, or department">
      <span class="input-group-text"><i class="bi bi-search"></i></span>
    </div>

    <!-- Appointments Table -->
    <div class="table-responsive">
      <table class="table table-bordered align-middle shadow-sm">
        <thead class="table-primary">
          <tr>
            <th>#</th>
            <th>Doctor</th>
            <th>Patient</th>
            <th>Department</th>
            <th>Date</th>
            <th>Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="appointment in filteredAppointments" :key="appointment.id">
            <td>{{ appointment.id }}</td>
            <td>{{ appointment.doctor }}</td>
            <td>{{ appointment.patient }}</td>
            <td>{{ appointment.dept }}</td>
            <td>{{ appointment.date }}</td>
            <td>{{ appointment.time }}</td>
            <td>
              <button class="btn btn-sm btn-info" @click="viewHistory(appointment.pid , appointment.patient)">View History</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Patient History Modal -->
    <div v-if="showHistory">
      <div class="modal fade show d-block" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-lg" role="document">
          <div class="modal-content shadow-lg">
            <div class="modal-header">
              <h5 class="modal-title text-primary">Patient History - {{ this.patname }}</h5>
              <button type="button" class="btn-close" @click="closeHistory"></button>
            </div>
            <div class="modal-body">
              <div v-if="patientHistory[selectedPatient] && patientHistory[selectedPatient].length">
                <ul class="list-group">
                  <li v-for="(record, index) in patientHistory[selectedPatient]" :key="index" class="list-group-item">
                    <strong>Date:</strong> {{ record.date }} |
                    <strong>Diagnosis:</strong> {{ record.diagnosis }} |
                    <strong>Treatment:</strong> {{ record.treatment }}
                  </li>
                </ul>
              </div>
              <div v-else>
                <p class="text-muted">No previous history found for this patient.</p>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeHistory">Close</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Backdrop (only appears when modal is open) -->
      <div class="modal-backdrop fade show" @click="closeHistory"></div>
    </div>

  </div>
  `,
};
