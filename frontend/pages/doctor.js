export default {
  name: "AdminDoctors",
  data() {
    return {
      doctors: [
        { id: 1, name: "Dr. John Doe", specialization: "Cardiology", email: "john@example.com" },
        { id: 2, name: "Dr. Sarah Lee", specialization: "Pediatrics", email: "sarah@example.com" },
      ],
      newDoctor: { name: "", specialization: "", email: "" , qualification: "" },
      editingDoctor: null,
      searchQuery: "",
    };
  },
  computed: {
    filteredDoctors() {
      return this.doctors.filter((d) =>
        d.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  methods: {
    addDoctor() {
      if (!this.newDoctor.name || !this.newDoctor.specialization || !this.newDoctor.email || !this.newDoctor.qualification) {
        alert("Please fill all fields!");
        return;
      }
      const newId = this.doctors.length + 1;
      this.doctors.push({ id: newId, ...this.newDoctor });
      this.newDoctor = { name: "", specialization: "", email: "" };
    },

    editDoctor(doctor) {
      this.editingDoctor = { ...doctor };
    },

    saveDoctor() {
      const index = this.doctors.findIndex((d) => d.id === this.editingDoctor.id);
      if (index !== -1) {
        this.doctors.splice(index, 1, this.editingDoctor);
      }
      this.editingDoctor = null;
    },

    deleteDoctor(id) {
      if (confirm("Are you sure you want to delete this doctor?")) {
        this.doctors = this.doctors.filter((d) => d.id !== id);
      }
    },
  },
  template: `
  <div class="container mt-4">
    <h2 class="text-primary mb-4">Manage Doctors</h2>

    
    <div class="input-group mb-3 w-50">
      <input
        v-model="searchQuery"
        type="text"
        class="form-control"
        placeholder="Search doctors..."
      />
      <span class="input-group-text"><i class="bi bi-search"></i></span>
    </div>

    
    <div class="card p-3 mb-4 shadow-sm">
      <h5>Add New Doctor</h5>
      <div class="row g-2">
        <div class="col-md-3">
          <input v-model="newDoctor.name" class="form-control" placeholder="Name" />
        </div>
        <div class="col-md-3">
          <input v-model="newDoctor.specialization" class="form-control" placeholder="Specialization" />
        </div>
        <div class="col-md-3">
          <input v-model="newDoctor.email" class="form-control" placeholder="Email" />
        </div>
        <div class="col-md-3">
          <input v-model="newDoctor.qualification" class="form-control" placeholder="Qualification" />
        </div>
      </div>
      <div class="row g-2 mt-3">

        <div class="col-md-3">
          <button class="btn btn-success w-100" @click="addDoctor">Add Doctor</button>
        </div>
        </div>


    </div>

    <div class="table-responsive">
      <table class="table table-bordered align-middle">
        <thead class="table-primary">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Specialization</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="doctor in filteredDoctors" :key="doctor.id">
            <td>{{ doctor.id }}</td>
            <td v-if="editingDoctor && editingDoctor.id === doctor.id">
              <input v-model="editingDoctor.name" class="form-control" />
            </td>
            <td v-else>{{ doctor.name }}</td>

            <td v-if="editingDoctor && editingDoctor.id === doctor.id">
              <input v-model="editingDoctor.specialization" class="form-control" />
            </td>
            <td v-else>{{ doctor.specialization }}</td>

            <td v-if="editingDoctor && editingDoctor.id === doctor.id">
              <input v-model="editingDoctor.email" class="form-control" />
            </td>
            <td v-else>{{ doctor.email }}</td>

            <td>
              <div v-if="editingDoctor && editingDoctor.id === doctor.id">
                <button class="btn btn-sm btn-success me-2" @click="saveDoctor">Save</button>
                <button class="btn btn-sm btn-secondary" @click="editingDoctor = null">Cancel</button>
              </div>
              <div v-else>
                <button class="btn btn-sm btn-primary me-2" @click="editDoctor(doctor)">Edit</button>
                <button class="btn btn-sm btn-danger" @click="deleteDoctor(doctor.id)">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  `,
};
