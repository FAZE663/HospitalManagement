export default {
  name: "DoctorDashboard",
  data() {
    return {
      doctorName: "Dr. John Doe",
      days: ["2025-10-04", "2025-10-05", "2025-10-06"],
      timeSlots: [
        "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
        "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
      ],
      slotStatus: {},
    };
  },
  created() {
    this.days.forEach(day => {
      this.$set(this.slotStatus, day, {});
      this.timeSlots.forEach(time => {
        this.$set(this.slotStatus[day], time, "Available");
      });
    });
  },
  methods: {
    toggleSlot(day, time) {
      const current = this.slotStatus[day][time];
      this.$set(
        this.slotStatus[day],
        time,
        current === "Available" ? "Unavailable" : "Available"
      );
    },
    getButtonClass(status) {
      return status === "Available"
        ? "btn btn-success btn-sm"
        : "btn btn-danger btn-sm";
    },
    saveAvailability() {
      alert("Availability saved!");
      console.log("Doctor Slot Status:", this.slotStatus);
    }
  },
  template: `
  <div class="container mt-4">
    <h2 class="text-primary mb-3">Doctor Dashboard</h2>
    <h5 class="text-muted mb-4">Welcome, {{ doctorName }}</h5>

    <div class="card shadow-sm">
      <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Set Unavailable Time Slots</h5>
        <button class="btn btn-light btn-sm" @click="saveAvailability">Save</button>
      </div>

      <div class="card-body p-0">
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
                  :class="getButtonClass(slotStatus[day][slot])"
                  @click="toggleSlot(day, slot)"
                >
                  {{ slotStatus[day][slot] }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  `
};
