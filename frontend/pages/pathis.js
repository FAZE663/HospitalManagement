export default {
  name: "PatientHistory",

  data() {
    return {
      datas:[],
      
      history: [],
      pastAppointments: [], 

    };
  },

  methods:{
    fetchHistory() {
      fetch(`/api/patients/${localStorage.getItem("userid")}`)
        .then(response => response.json())
        .then(data => {
          console.log(data);
          this.datas = data;
          this.pastAppointments = this.datas.appointments.filter(a=> a.status !== "upcoming");
          this.history = this.pastAppointments.sort((a, b) => new Date(b.date) - new Date(a.date));
        })
        .catch(error => {
          console.error("Error fetching appointment history:", error);
        });
    },
    datecon(str){
      return new Date(str).toDateString();
    },
    viewhistory(id) {
      this.$router.push(`/patient/notes/${id}`);
    },
    downloadRecord() {
  if (!this.datas || !this.datas.appointments) {
    alert("No history found");
    return;
  }

  // CSV header
  let csv = "Date,Time,Doctor,Status,Diagnosis,Treatment,Notes\n";


  for(const appt of this.datas.histories){
    const appointment = this.pastAppointments?.find(h => h.id === appt.appointment_id) ;

    if (!appointment) {
      console.warn("No appointment found for history:", appt);
      continue;
    }


    const row = [
      new Date(appt.date).toDateString(),
      appointment.time || "",
      appt.doctor_name || "",
      appointment.status || "",
      appt.diagnosis || "",
      appt.treatment || "",
      (appt.notes || "").replace(/[\r\n,]/g, " ")   // clean commas/newlines
      
    ];

    csv += row.join(",") + "\n";
  };

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `patient_history_${this.datas.name}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}

  },

  mounted() {
    this.fetchHistory();

    
    

    
  },

  template: `
    <div class="container mt-4">
      <div class="card shadow-sm">
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h4 class="mb-0">Appointment History</h4>
          <div>
            <span class="badge bg-light text-primary">{{ history.length }} Past Appointments</span>
            <button class="btn btn-light btn-sm ms-3" @click="downloadRecord">
              Download Full History
            </button>
          </div>
        </div>

        <div class="card-body">

          <!-- No History Message -->
          <div v-if="history.length === 0" class="text-center p-4 text-muted">
            <p>No past appointments found.</p>
            <router-link to="/patient/book" class="btn btn-primary">
              Book Your First Appointment
            </router-link>
          </div>

          <!-- History Table -->
          <div v-else class="table-responsive">
            <table class="table table-striped table-hover">
              <thead class="table-dark">
                <tr>
                  <th>#</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(item, index) in history" :key="item.id">
                  <td>{{ index + 1 }}</td>
                  <td>
                    <strong>{{ item.doctor }}</strong>
                    <div class="text-muted small">{{ item.specialization }}</div>
                  </td>
                  <td>{{ datecon(item.date) }}</td>
                  <td>{{ item.time }}</td>

                  <td>
                    <span
                      class="badge"
                      :class="{
                        'bg-success': item.status === 'completed',
                        'bg-danger': item.status === 'cancelled'
                      }"
                    >
                      {{ item.status }}
                    </span>
                  </td>

                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary me-2" @click="viewhistory(item.id)">
                      View more details
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

        <div class="card-footer text-end">
          <router-link to="/patient/dashboard" class="btn btn-secondary">
            Back to Dashboard
          </router-link>
        </div>

      </div>
    </div>
  `
};
