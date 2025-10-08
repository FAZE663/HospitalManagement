export default {
  name: 'AdminAppointments',
  data() {
    return {
      appointments: [
        { id: 1, doctor: "Dr. John Doe", patient: "Jane Smith", dept: "Cardiology", date: "2025-10-04", time: "10:00 AM" },
        { id: 2, doctor: "Dr. Emily Clark", patient: "Michael Brown", dept: "Neurology", date: "2025-10-05", time: "02:30 PM" },
        { id: 3, doctor: "Dr. Sarah Lee", patient: "Robert Davis", dept: "Orthopedics", date: "2025-10-06", time: "09:30 AM" },
      ],
      searchQuery: "",
      showHistory: false,
      selectedPatient: null,
      patientHistory: {
        "Jane Smith": [
          { date: "2025-07-01", diagnosis: "Hypertension", treatment: "Medication" },
          { date: "2025-08-10", diagnosis: "High Cholesterol", treatment: "Diet Control" },
        ],
        "Michael Brown": [
          { date: "2025-06-12", diagnosis: "Migraine", treatment: "Pain Relief Therapy" },
        ],
        "Robert Davis": [
          { date: "2025-05-10", diagnosis: "Fractured Arm", treatment: "Cast and Physiotherapy" },
        ]
      }
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
    viewHistory(patientName) {
      this.selectedPatient = patientName;
      this.showHistory = true;
      document.body.classList.add("modal-open"); // prevent scrolling
    },
    closeHistory() {
      this.showHistory = false;
      this.selectedPatient = null;
      document.body.classList.remove("modal-open"); // allow scrolling again
    }
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
              <button class="btn btn-sm btn-info" @click="viewHistory(appointment.patient)">View History</button>
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
              <h5 class="modal-title text-primary">Patient History - {{ selectedPatient }}</h5>
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
