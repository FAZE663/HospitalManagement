export default {
  name: "DoctorPatients",
  data() {
    return {
      loading: false,
      searchQuery: "",
      patients: [],

      // Modal + History
      showHistory: false,
      selectedPatient: null,
      selectedPatientName: "",
      patientHistory: {}
    };
  },

  computed: {
    filteredPatients() {
      const q = this.searchQuery.toLowerCase();
      return this.patients.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.phone.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q)
      );
    },
  },

  methods: {

    fetchPatients() {
      this.loading = true;
      fetch("/api/patientselect/" + this.$root.userid)
        .then(res => res.json())
        .then(data => {
          this.patients = data;
          this.loading = false;
        })
        .catch(err => {
          console.error("Error fetching patients:", err);
          this.loading = false;
        });
    },

    viewHistory(pid, name) {
      this.selectedPatient = pid;
      this.selectedPatientName = name;
      this.fetchPatientHistory(pid);

      this.showHistory = true;
      document.body.classList.add("modal-open");
    },
    fetchPatientHistory(pid) {
      fetch(`/api/patienthistory/${pid}`)
        .then(res => res.json())
        .then(data => {
          this.$set(this.patientHistory, pid, data);
        })
        .catch(err => console.error("Error fetching patient history:", err));
    },
    closeHistory() {
      this.showHistory = false;
      this.selectedPatient = null;
      document.body.classList.remove("modal-open");
    }
  },

  mounted() {
    this.fetchPatients();
  },

  template: `
  <div class="container mt-4">
    <h3 class="text-primary mb-4">My Patients</h3>

    <!-- Search Bar -->
    <div class="input-group mb-3 w-50">
      <input v-model="searchQuery" type="text" class="form-control" placeholder="Search patients..." />
      <span class="input-group-text"><i class="bi bi-search"></i></span>
    </div>

    <div v-if="loading" class="text-center text-muted">Loading patients...</div>
    <div v-else-if="filteredPatients.length === 0" class="text-center text-muted">No matching patients found.</div>

    <table v-else class="table table-hover align-middle">
      <thead class="table-light">
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Date of Birth</th>
          <th>Phone</th>
          <th>Email</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(patient, index) in filteredPatients" :key="patient.pid">
          <td>{{ index + 1 }}</td>
          <td>{{ patient.name }}</td>
          <td>{{ patient.age }}</td>
          <td>{{ patient.phone }}</td>
          <td>{{ patient.email }}</td>
          <td>
            <button class="btn btn-sm btn-info" @click="viewHistory(patient.id, patient.name)">View History</button>
          </td>
        </tr>
      </tbody>
    </table>


    <div v-if="showHistory">
      <div class="modal fade show d-block">
        <div class="modal-dialog modal-lg">
          <div class="modal-content shadow-lg">
            <div class="modal-header">
              <h5 class="modal-title">Patient History - {{ selectedPatientName }}</h5>
              <button class="btn-close" @click="closeHistory"></button>
            </div>
            <div class="modal-body">

              <div v-if="patientHistory[selectedPatient] && patientHistory[selectedPatient].length">
                <ul class="list-group">
                  <li class="list-group-item" v-for="(record, i) in patientHistory[selectedPatient]" :key="i">
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
              <button class="btn btn-secondary" @click="closeHistory">Close</button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-backdrop fade show" @click="closeHistory"></div>
    </div>

  </div>
  `
};
