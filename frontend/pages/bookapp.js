export default {
  name: "BookAppointment",

  data() {
    return {
      searchQuery: "",
      doctors: [],

      selectedDoctor: null,
      selectedDate: "",
      selectedTime: "",
      days: [],
      slots:[],
      slotstatus:[],
      isreshedule: false
    };
  },

  computed: {
    filteredDoctors() {
      const q = this.searchQuery.toLowerCase();
      return this.doctors.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.specialization.toLowerCase().includes(q)
      );
    },
    
  },

  watch: {
    selected() {
      if (!newVal) {
        this.slots = [];
        return;
      }

      this.fetchslots(newVal.id).then(result => {
        this.slots = result;
      });
    }
  },

  methods: {
    fetchDoctors() {
      return fetch("/api/doctors")
        .then(r => r.json())
        .then(d => {
          this.doctors = d;
        })
        .catch(err => console.error(err));
    },
    selectDoctor(doc) {
      this.selectedDoctor = doc;
      this.selectedTime = "";
      this.selectedDate = "";
      this.setslots();
    },

    setslots(){
      console.log("Setting slots for doctor:", this.selectedDoctor.name);
      if (!this.selectedDoctor){
        this.slots = [];
      }
      else{
        this.slots = this.fetchslots(this.selectedDoctor.id);
      }
    },

    selectSlot(day, time) {
      this.selectedDate = day;
      this.selectedTime = time;
    },

    isSelected(day, time) {
      return this.selectedDate === day && this.selectedTime === time;
    },

    dateLabel(d) {
      return new Date(d).toDateString();
    },

    bookAppointment() {

      if (this.isreshedule){
        fetch(`api/appointments/${this.$route.query.aid}`, {
          method: "DELETE"
        })
        .then(res => {
          if (!res.ok) throw new Error("Failed to cancel previous appointment");
          console.log("Previous appointment cancelled.");
        })
        .catch(err => {
          console.error(err);
          alert("Error cancelling previous appointment. Please check your appointments.");
        });
      }

      if (!this.selectedDoctor || !this.selectedDate || !this.selectedTime) {
        alert("Please choose doctor, date and time.");
        return;
      }

      fetch(`/api/appointments/${localStorage.getItem("userid")}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          did: this.selectedDoctor.id,
          date: this.selectedDate,
          time: this.selectedTime
        })
      })
      .then(res => {
        if (!res.ok) throw new Error("Failed to book appointment");
        return res.json();
      })
      .then(data => {
        console.log("Appointment booked:", data);
        alert(`Appointment booked with ${this.selectedDoctor.name}
        on ${this.selectedDate} at ${this.selectedTime}`);

        this.$router.push("/patient/dashboard");
      })
      .catch(err => {
        console.error(err);
        alert("Error booking appointment. Please try again.");
        return;
      });

      

      
    },

    generateDays(count) {
      const arr = [];
      const today = new Date();
      for (let i = 0; i < count; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        arr.push(d.toISOString().split("T")[0]); // YYYY-MM-DD
      }
      return arr;
    },

    generateTimeSlots(start, end, interval) {
      const slots = [];
      let [hour, minute] = start.split(":").map(Number);
      const [endHour, endMinute] = end.split(":").map(Number);

      while (hour < endHour || (hour === endHour && minute <= endMinute)) {
        
        if (hour === 12) {
         
          hour = 13;
          minute = 0;
          continue;
        }

        const formatted = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
        slots.push(formatted);

        minute += interval;
        if (minute >= 60) {
          minute -= 60;
          hour++;
        }
      }

      console.log("Generated Time Slots:", slots);
      return slots;
    },

    fetchslots(did) {
      return fetch(`/api/slotconfig/${did}`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch slot configuration");
          return res.json();
        })
        .then(slotconfig => {
          
          this.slots = this.generateTimeSlots(
            slotconfig.start_time,
            slotconfig.end_time,
            slotconfig.interval_minutes
          );

          
          return fetch(`/api/slots/${did}`);
        })
        .then(res => res.json())
        .then(data => {
          console.log("API booked/unavailable", data);
          this.slotstatus = [];
          
          this.days.forEach(day => {
            if (!this.slotstatus[day]) {
              this.$set(this.slotstatus, day, {});
            }

            this.slots.forEach(time => {
              if (!this.slotstatus[day][time]) {
                this.$set(this.slotstatus[day], time, "Available");
              }
            });
          });

          
          data.forEach(slot => {
            if (!this.slotstatus[slot.date]) {
              this.$set(this.slotstatus, slot.date, {});
            }

            
            this.$set(this.slotstatus[slot.date], slot.time, slot.status);
          });

          return this.slotstatus; 
        })
        .catch(err => console.error(err));
    },

    loadApp(aid){
      
      fetch(`/api/appointments/fetch/${aid}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch appointment details");
        return res.json();
      })
      .then(data => {
        console.log("Fetched appointment data:", data);
        console.log(data.did);
        this.isreshedule = true;
        const doc = this.doctors.find(d => d.id === data.did);
        if (doc){

          this.selectedDoctor=doc
          
          this.selectedDate = data.date;
          this.selectedTime = data.time;
          this.setslots();
        }
        else{
          alert("Doctor not found for the appointment.");
        }
      })
      .catch(err => {
        console.error(err);
        alert("Error loading appointment details.");
      });

    }

  },

  async created() {

    this.days=this.generateDays(3);


    await this.fetchDoctors();

    const aid= this.$route.query.aid;
    if (aid){
      console.log("Reshedule appointment id:", aid);
      this.loadApp(aid);
    }
    
    const did = this.$route.query.doctor;
    if (did) {
      console.log("Preselecting doctor id:", did);
      console.log(this.doctors);
      const doc = this.doctors.find(d => d.id === parseInt(did));
     
      if (doc) {
        this.selectedDoctor = doc;
        this.setslots();
      } else {
        console.warn("Doctor with id", did, "not found.");
      }
    }

    

  },


  template: `
    <div class="container mt-4">

      <div class="row">
        <!-- Doctor List -->
        <div class="col-md-4">
          <div class="card shadow-sm">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">Choose Doctor</h5>
            </div>
            <div class="card-body">

              <input
                v-model="searchQuery"
                type="text"
                class="form-control mb-3"
                placeholder="Search doctor..."
              />

              <ul class="list-group">
                <li
                  v-for="doc in filteredDoctors"
                  :key="doc.name"
                  @click="selectDoctor(doc)"
                  class="list-group-item list-group-item-action"
                  style="cursor:pointer;"
                  :class="{'active' : selectedDoctor && selectedDoctor.name === doc.name}"
                >
                  <strong>{{ doc.name }}</strong><br>
                  <small class="text-muted">{{ doc.specialization }}</small>
                </li>
              </ul>

            </div>
          </div>
        </div>

        <!-- Slot Selector -->
        <div class="col-md-8" v-if="selectedDoctor">
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-success text-white">
              <h5 class="mb-0">Available Slots (Next 3 Days)</h5>
            </div>

            <div class="card-body p-0">
              <div style="overflow-x:auto; white-space:nowrap;">
                <table class="table table-bordered text-center mb-0 align-middle">
                  <thead class="table-light">
                    <tr>
                      <th>Day</th>
                      <th v-for="time in slots" :key="time">
                        {{ time }}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr v-for="day in days" :key="day">
                      <td class="fw-bold">{{ dateLabel(day) }}</td>

                      <td v-for="time in slots" :key="time">

                        <!-- Slot exists in slotstatus -->
                        <button
                          v-if="slotstatus[day] && slotstatus[day][time] === 'Available'"
                          class="btn btn-sm"
                          :class="isSelected(day, time) ? 'btn-success' : 'btn-outline-success'"
                          @click="selectSlot(day, time)"
                        >
                          {{ time }}
                        </button>

                        <span v-else-if="isreshedule && selectedDate === day && selectedTime === time" class="text-info small">
                          {{ time }}
                        </span>

                        <!-- If booked/unavailable -->
                        <span v-else class="text-danger small">
                          {{ slotstatus[day] && slotstatus[day][time] ? slotstatus[day][time] : 'Unavailable' }}
                        </span>

                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Confirm -->
          <div class="text-end">
            <button class="btn btn-success" @click="bookAppointment">
              Book Appointment
            </button>
          </div>
        </div>
      </div>

    </div>
  `
};
