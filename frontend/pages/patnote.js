export default {
  name: "PatientReport",
  data() {
    return {
      patientId: null,
      patientName: "",
      record: {},
    };
  },

  methods: {
    fetchHistory() {
      fetch(`/api/patienthistory/fetch/${this.$route.params.id}`)
        .then(res => res.json())
        .then(data => {
          this.record = data;
          this.patientName = this.record.patient_name;
        })
        .catch(err => console.error("Error fetching history:", err));
    },

    downloadRecord(record) {
      const reportContent = `
        Medical Report - ${record.patient_name}

        Date: ${record.date}
        Doctor: ${record.doctor_name}

        Diagnosis:
        ${record.diagnosis}

        Treatment:
        ${record.treatment}

        Notes:
        ${record.notes}
      `;

      const blob = new Blob([reportContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `medical_report_${record.date}.txt`;
      a.click();

      URL.revokeObjectURL(url);
    },
    datecon(str){
      return new Date(str).toDateString();
    }
  },

  created() {
    this.patientId = this.$root.userid;  
    this.fetchHistory();


  },

  template: `
  <div class="container mt-4">
  <h3 class="mb-3 text-primary">My Medical Record</h3>

  <!-- Patient Info -->
  <div class="card mb-3 shadow-sm">
    <div class="card-body">
      <p><strong>Patient ID:</strong> {{ patientId }}</p>
      <p><strong>Name:</strong> {{ patientName || 'Loading...' }}</p>
    </div>
  </div>

  <!-- Single Appointment Record -->
  <div class="card shadow-sm">
    <div class="card-header bg-info text-white d-flex justify-content-between">
      <h5 class="mb-0">Appointment Details</h5>
      <span class="badge bg-dark" v-if="record">1 Record</span>
    </div>

    <div class="card-body" v-if="record">
      <div class="p-3 mb-3 border rounded bg-white shadow-sm">

        <div class="d-flex justify-content-between">
          <h6 class="fw-bold">{{ datecon(record.date) }}</h6>
          <span class="badge bg-secondary">Doctor: {{ record.doctor_name }}</span>
        </div>

        <p class="mt-2"><strong>Diagnosis:</strong> {{ record.diagnosis }}</p>
        <p><strong>Treatment:</strong> {{ record.treatment }}</p>

        <div class="alert alert-info">
          <small><strong>Notes:</strong></small><br>
          {{ record.notes }}
        </div>

        <button 
          class="btn btn-sm btn-success mt-2" 
          @click="downloadRecord(record)">
          Download Report
        </button>
      </div>
    </div>

    <div class="card-body text-center text-muted" v-else>
      No medical record found.
    </div>
  </div>
</div>

  `
};
