export default {
  name: "NotesPage",
  data() {
    return {
      appointmentId: null,
      patient: "",
      notes: "",
      previousRecords: [],
      newRecord: {
        pid: null,
        did: null,
        aid:null,
        date: new Date().toISOString().split("T")[0], // auto-fill today
        diagnosis: "",
        treatment: "",
        notes: "",

        
      }
    };
  },
  methods: {
    saveNotes() {

      

      fetch('/api/patienthistory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.newRecord)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        alert('New record saved successfully!');
        this.fetchPatientHistory(this.patientId); // Refresh history
        // Clear form
        this.newRecord.diagnosis = "";
        this.newRecord.treatment = "";
        this.newRecord.notes = "";
      })
      .catch(error => {
        console.error('Error saving new record:', error);
        alert('Failed to save the new record. Please try again.');
      });
    },
    fetchPatientHistory(pid) {
      fetch(`/api/patienthistory/${pid}`)
        .then(response => response.json())
        .then(data => {
          console.log('Fetched patient history:', data);
          this.previousRecords=data;
        })
        .catch(error => console.error('Error fetching patient history:', error));
    },
    fetchappdets(){
      fetch(`/api/appointments/fetch/${this.appointmentId}`)
      .then(response => response.json())
      .then(data => {
        this.patient=data.patient;
      })
    },
  },
  created() {
    
    this.appointmentId = this.$route.params.id;
    this.patientId = sessionStorage.getItem("selected_pid");
    this.previousRecords = [];

    this.newRecord.pid = this.patientId;
    this.newRecord.did = this.$root.userid;
    this.newRecord.aid = this.appointmentId;

    
    this.notes = "";

    


    this.fetchPatientHistory(this.patientId);
    this.fetchappdets();
  },
  template: `
    <div class="container mt-4">
      <h3 class="mb-3">Appointment Notes</h3>

      <!-- Appointment Info -->
      <div class="card mb-4 shadow-sm">
        <div class="card-body">
          <p><strong>Appointment ID:</strong> {{ appointmentId }}</p>
          <p><strong>Patient:</strong> {{ this.patient }}</p>
        </div>
      </div>

      <!-- Previous Notes and Prescriptions -->
      <div class="card mb-4 shadow-sm">
      <div class="card-header bg-light d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Medical History</h5>
        <span class="badge bg-primary">{{ previousRecords.length }} Records</span>
      </div>

      <div class="card-body" v-if="previousRecords.length">
        <div 
          v-for="(record, index) in previousRecords" 
          :key="index" 
          class="p-3 mb-3 border rounded shadow-sm bg-white"
        >
          <div class="d-flex justify-content-between">
            <h6 class="fw-bold mb-2"> {{ record.date }}</h6>
            <span class="badge bg-secondary">Doctor: {{ record.doctor_name }}</span>
          </div>

          <div class="mt-2">
            <p class="mb-1"><strong>Diagnosis:</strong> {{ record.diagnosis }}</p>
            <p class="mb-1"><strong>Treatment:</strong> {{ record.treatment }}</p>
            
            <div class="mt-2 alert alert-info mb-0">
              <small><strong>Notes:</strong></small><br />
              {{ record.notes }}
            </div>
          </div>
        </div>
      </div>

      <div class="card-body text-muted text-center" v-else>
        No medical history available yet.
      </div>
    </div>


     <!-- New Notes Section -->
  <div class="card shadow-sm mt-4">
    <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
      <h5 class="mb-0">Add New Record</h5>
      <span class="badge bg-warning text-dark">Editing</span>
    </div>

    <div class="card-body">

    <!-- Date (auto generated or editable) -->
    <div class="mb-3">
      <label class="form-label fw-semibold">Date</label>
      <input 
        type="date" 
        class="form-control" 
        v-model="newRecord.date"
        :disabled="true"
      />
    </div>

    <!-- Diagnosis -->
    <div class="mb-3">
      <label class="form-label fw-semibold">Diagnosis</label>
      <input 
        type="text" 
        class="form-control" 
        placeholder="Enter diagnosis..."
        v-model="newRecord.diagnosis"
      />
    </div>

    <!-- Treatment -->
    <div class="mb-3">
      <label class="form-label fw-semibold">Treatment / Prescription</label>
      <textarea 
        class="form-control" 
        rows="3"
        placeholder="Enter prescribed medicine or treatment..."
        v-model="newRecord.treatment"
      ></textarea>
    </div>

    <!-- Notes -->
    <div class="mb-3">
      <label class="form-label fw-semibold">Notes</label>
      <textarea 
        class="form-control" 
        rows="4"
        placeholder="Doctor's observations or follow-up instructions..."
        v-model="newRecord.notes"
      ></textarea>
    </div>

    <!-- Buttons -->
    <div class="d-flex justify-content-end">
      <router-link to="/dashboard" class="btn btn-secondary me-2">
        Cancel
      </router-link>
      <button class="btn btn-success" @click="saveNotes">
        Save Record
      </button>
    </div>

    </div>
  </div>

  </div>
  `
};
