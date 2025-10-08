export default{
  name: "AdminDash",
  data() {
    return {
      searchQuery: "",
      searchResults: []
    };
  },
  methods: {
    handleSearch() {
      // Simulate search logic
      const allData = [
        "Dr. John Doe",
        "Patient: Jane Smith",
        "Appointment: Dr. John Doe with Jane Smith on 2024-07-01",
        "Dr. Emily Davis",
        "Patient: Michael Brown",
        "Appointment: Dr. Emily Davis with Michael Brown on 2024-07-02"
      ];

      this.searchResults = allData.filter(item =>
        item.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  },
    template: `
    <template>
  <div class="container mt-4">
    <h2 class="mb-4">Admin Dashboard</h2>


   
  <div class="container mt-4">
    
    
    <div class="input-group mb-3 w-100">
      <input
        type="text"
        class="form-control"
        v-model="searchQuery"
        placeholder="Search doctors, patients, or appointments..."
      />
      <button class="btn btn-primary" @click="handleSearch">
        <i class="bi bi-search"></i> Search
      </button>
    </div>

    
    <div v-if="searchResults.length > 0">
      <h5 class="mt-3">Search Results</h5>
      <ul class="list-group">
        <li
          v-for="(item, index) in searchResults"
          :key="index"
          class="list-group-item"
        >
          {{ item }}
        </li>
      </ul>
    </div>

   
    <div v-else class="mt-4 text-muted">
      <p>Use the search bar above to find doctors, patients, or appointments.</p>
    </div>
  </div>


    <div class="row">
      <div class="col-md-4 mb-3">
        <div class="card shadow-sm text-center">
          <div class="card-body">
            <h5 class="card-title">Manage Doctors</h5>
            <router-link to="/admin/doctors" class="btn btn-primary">View</router-link>
          </div>
        </div>
      </div>

      <div class="col-md-4 mb-3">
        <div class="card shadow-sm text-center">
          <div class="card-body">
            <h5 class="card-title">Manage Patients</h5>
            <router-link to="/admin/patients" class="btn btn-success">View</router-link>
          </div>
        </div>
      </div>

      <div class="col-md-4 mb-3">
        <div class="card shadow-sm text-center">
          <div class="card-body">
            <h5 class="card-title">Manage Appointments</h5>
            <router-link to="/admin/appointments" class="btn btn-warning text-white">View</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
`
}
