export default {
  name: "DoctorDashboard",

  data() {
    return {
      doctorName: localStorage.getItem("username") || "",
      availability: true,
      appointments: [],
      days: [],              // build in created()
      timeSlots: [],
      slotStatus: {},        // { "2025-11-25": { "09:00": "Available", ... } }
      unavailableSlots: [],  // [{ date, time, status }]
      originalSlotStatus: {}, 
    };
  },

  computed: {
    todayAppointments() {
      const today = new Date().toISOString().split("T")[0];
      return this.appointments.filter(a => a.date === today);
    },
  },

  methods: {
    toggleAvailability() {
      this.availability = !this.availability;
    },

    toggleSlot(day, time) {

      
      // Defensive access: ensure day/time exist
      if (!this.slotStatus[day]) {
        this.$set(this.slotStatus, day, {});
      }
      if (!this.slotStatus[day][time]) {
        // default to Available if missing
        this.$set(this.slotStatus[day], time, "Available");
      }

      const current = this.slotStatus[day][time];
      if (current === "Booked") {
        return;
      }

      const newstatus = current === "Available" ? "Unavailable" : "Available";

      // Keep unavailableSlots in sync. Use {date, time, status} keys consistently.
      const existingIndex = this.unavailableSlots.findIndex(
        s => s.date === day && s.time === time
      );

      if (newstatus !== (this.originalSlotStatus[day] && this.originalSlotStatus[day][time])) {
        // changed from original -> ensure it's in unavailableSlots (with current newstatus)
        if (existingIndex === -1) {
          this.unavailableSlots.push({ date: day, time, status: newstatus });
        } else {
          // update existing entry
          this.unavailableSlots[existingIndex].status = newstatus;
        }
      } else {
        // reverted to original -> remove from unavailableSlots if present
        if (existingIndex !== -1) {
          this.unavailableSlots.splice(existingIndex, 1);
        }
      }

      this.$set(this.slotStatus[day], time, newstatus);
    },

    getButtonClass(status) {
      if (status === "Available") return "btn btn-success btn-sm";
      if (status === "Unavailable") return "btn btn-danger btn-sm";
      return "btn btn-secondary btn-sm";
    },

    async saveAvailability() {
      const doctorId = this.$root.userid;
      try {
        const res = await fetch(`/api/slots/${doctorId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.unavailableSlots)
        });
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        console.log('Success:', data);
        alert("Availability saved!");
        // After saving, refresh originalSlotStatus so further changes compare correctly
        this.originalSlotStatus = JSON.parse(JSON.stringify(this.slotStatus));
        this.unavailableSlots = [];
      } catch (err) {
        console.error('Error saving availability:', err);
        alert("Failed to save availability. Check console.");
      }

      console.log("Doctor Slot Status:", this.slotStatus);
    },

    markComplete(id) {
      const appt = this.appointments.find(a => a.id === id);
      if (appt && appt.status !== "completed") {
        fetch(`/api/appointments/${id}`, {
          method: 'PUT',
          headers: {  'Content-Type': 'application/json' },
          body: JSON.stringify({ ...appt, status: "completed" })
        }).then(response => response.json())
        .then(data => {
          console.log('Success:', data);
          appt.status = "completed";
          this.appointments = [...this.appointments];
        })
        .catch((error) => {
          console.error('Error:', error);
        });
        
      }
    },

    viewNotes(id, pid) {
      sessionStorage.setItem("selected_pid", pid);
      this.$router.push(`/notes/${id}`);
    },

    async fetchAppointments() {
      const doctorId = this.$root.userid;
      try {
        const res = await fetch(`/api/appointments/doctors/${doctorId}`);
        if (!res.ok) throw new Error("Failed to fetch appointments");
        const data = await res.json();
        this.appointments = data;
      } catch (err) {
        console.error("Error fetching today's appointments:", err);
      }
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
        // ❌ Skip lunch break 12:00 - 13:00
        if (hour === 12) {
          // Jump directly to 13:00
          hour = 13;
          minute = 0;
          continue;
        }

        const formatted = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
        this.timeSlots.push(formatted);

        minute += interval;
        if (minute >= 60) {
          minute -= 60;
          hour++;
        }
      }
    },

    // fetchTimeSlots now ensures proper ordering: fetch slot config -> generate timeSlots -> initialize slotStatus -> fetch actual slot statuses
    async fetchTimeSlots() {
      const doctorId = this.$root.userid;
      try {
        
        const cfgRes = await fetch(`/api/slotconfig/${doctorId}`);
        if (!cfgRes.ok) throw new Error("Failed to fetch slot config");
        const cfg = await cfgRes.json();

        console.log("Slot Config:", cfg);

        this.generateTimeSlots(cfg.start_time, cfg.end_time, cfg.interval_minutes);

        
        
        this.days.forEach(day => {
          if (!this.slotStatus[day]) this.$set(this.slotStatus, day, {});
          this.timeSlots.forEach(time => {
            // default: Available
            if (!this.slotStatus[day][time]) {
              this.$set(this.slotStatus[day], time, "Available");
            }
          });
        });

       
        const slotsRes = await fetch(`/api/slots/${doctorId}`);
        if (!slotsRes.ok) throw new Error("Failed to fetch slots");
        const slotsData = await slotsRes.json();

        slotsData.forEach(slot => {
          // ensure day/time exists before assigning
          if (!this.slotStatus[slot.date]) {
            this.$set(this.slotStatus, slot.date, {});
            // also initialize default for needed times if timeSlots exist
            this.timeSlots.forEach(t => {
              if (!this.slotStatus[slot.date][t]) this.$set(this.slotStatus[slot.date], t, "Available");
            });
          }
          this.$set(this.slotStatus[slot.date], slot.time, slot.status);
        });

        // deep clone original for comparison
        this.originalSlotStatus = JSON.parse(JSON.stringify(this.slotStatus));
      } catch (err) {
        console.error("Error fetching time slots or slot data:", err);
      }
    },
  },

  created() {
    
    this.days = this.generateDays(3);
  },

  mounted() {
    // call the fetchers after created/mount
    this.fetchAppointments();
    this.fetchTimeSlots();

  },

  template: `
  <div class="container mt-4">
    <h2 class="text-primary mb-3">Doctor Dashboard</h2>
    <h5 class="text-muted mb-4">Welcome, {{ this.doctorName }}</h5>

    <!-- Time Slots Section -->
    <div class="card shadow-sm mb-4">
      <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Time Slots</h5>
        <button class="btn btn-light btn-sm" @click="saveAvailability">Save</button>
      </div>

      <div class="card-body p-0">
        <div style="overflow-x: auto; white-space: nowrap;">
          <table class="table table-bordered text-center mb-0 align-middle">
            <thead class="table-light">
              <tr>
                <th>Day</th>
                <th v-for="slot in timeSlots" :key="slot">{{ slot }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="day in days" :key="day">
                <td class="fw-bold">{{ new Date(day).toDateString() }}</td>
                <td v-for="slot in timeSlots" :key="slot">
                  <button
                    :class="getButtonClass(slotStatus[day] ? slotStatus[day][slot] : 'Unavailable')"
                    @click="toggleSlot(day, slot)"
                  >
                    {{ slotStatus[day] ? (slotStatus[day][slot] || 'Unavailable') : 'Unavailable' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Today's Appointments -->
    <div class="card shadow-sm mb-4">
      <div class="card-header bg-primary text-white d-flex justify-content-between">
        <h5 class="mb-0">Today's Appointments</h5>
      </div>
      <div class="card-body">
        <table v-if="todayAppointments.length" class="table table-hover align-middle">
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
                  :class="appt.status === 'completed' ? 'bg-success' : 'bg-warning text-dark'"
                >
                  {{ appt.status }}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-info" @click="viewNotes(appt.id, appt.pid)">
                  View Notes
                </button>
                <button
                  class="btn btn-sm"
                  :class="appt.status === 'completed' ? 'btn-secondary' : 'btn-success'"
                  @click="markComplete(appt.id)"
                >
                  {{ appt.status === 'completed' ? 'completed' : 'Mark Completed' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <p v-else class="text-muted text-center mb-0">
          No appointments scheduled for today.
        </p>
      </div>
    </div>
  </div>
  `
};
