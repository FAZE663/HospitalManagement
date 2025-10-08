export default {
    name: 'AdminPatients',
    data(){
        return {
            patients: [
                { id: 1, name: "Jane Smith", age: 30, gender: "Female", email: "123@gmail.com" , phone : "1234567890"},
                { id: 2, name: "Michael Brown", age: 45, gender: "Male", email: "adf@gmail.com" , phone : "0987654321"},
            ],
        newPatient: {
            name: "",
            age: "",
            gender: "",
            email: "",
            phone: ""
        },
        editingPatient: null,
        searchQuery: ""
        }
    },
    computed: {
        filteredPatients() {
            return this.patients.filter((p) =>
                p.name.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        }
    },
    methods:{
        addPatient() {
            if (!this.newPatient.name || !this.newPatient.age || !this.newPatient.gender || !this.newPatient.email || !this.newPatient.phone) {
                alert("Please fill all the fields");
                return;
            }
            const newPID = this.patients.length + 1;
            this.patients.push({ id: newPID, ...this.newPatient });
            this.newPatient = { name: "", age: "", gender: "", email: "", phone: "" };  

        },

        editPatient(){
            this.editingPatient = {...this.editingPatient}
        },

        savePatient(){
            const index = this.patients.findIndex((p) => p.id === this.editingPatient.id);
            if (index !== -1) {
                this.patients.splice(index, 1, this.editingPatient);
            }
            this.editingPatient = null;
        },
        
        deletePatient(id) {
            if (confirm("Are you sure you want to delete this patient?")) {
                this.patients = this.patients.filter((p) => p.id !== id);
            }
        }
    },
    template: `
    <div class="container mt-4">
    <h2 class="text-primary mb-4">Manage Patients</h2>

    <div class="input-group mb-3 w-50">
      <input
        v-model="searchQuery"
        type="text"
        class="form-control"
        placeholder="Search patients..."
      />
      <span class="input-group-text"><i class="bi bi-search"></i></span>
    </div>

    <div class="card p-3 mb-4 shadow-sm">
      <h5>Add New Patient</h5>
      <div class="row g-2">
        <div class="col-md-2">
          <input v-model="newPatient.name" class="form-control" placeholder="Name" />
        </div>
        <div class="col-md-2">
          <input v-model="newPatient.age" class="form-control" placeholder="Age" type="number" />
        </div>
        <div class="col-md-2">
          <input v-model="newPatient.gender" class="form-control" placeholder="Gender" />
        </div>
        <div class="col-md-3">
          <input v-model="newPatient.email" class="form-control" placeholder="Email" />
        </div>
        <div class="col-md-3">
          <input v-model="newPatient.phone" class="form-control" placeholder="Phone" />
        </div>
      </div>
      <div class="row g-2 mt-3">
        <div class="col-md-3">
          <button class="btn btn-success w-100" @click="addPatient">Add Patient</button>
        </div>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-bordered align-middle">
        <thead class="table-primary">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="patient in filteredPatients" :key="patient.id">
            <td>{{ patient.id }}</td>
            <td v-if="editingPatient && editingPatient.id === patient.id">
              <input v-model="editingPatient.name" class="form-control" />
            </td>
            <td v-else>{{ patient.name }}</td>

            <td v-if="editingPatient && editingPatient.id === patient.id">
              <input v-model="editingPatient.age" class="form-control" type="number" />
            </td>
            <td v-else>{{ patient.age }}</td>

            <td v-if="editingPatient && editingPatient.id === patient.id">
              <input v-model="editingPatient.gender" class="form-control" />
            </td>
            <td v-else>{{ patient.gender }}</td>

            <td v-if="editingPatient && editingPatient.id === patient.id">
              <input v-model="editingPatient.email" class="form-control" />
            </td>
            <td v-else>{{ patient.email }}</td>

            <td v-if="editingPatient && editingPatient.id === patient.id">
              <input v-model="editingPatient.phone" class="form-control" />
            </td>
            <td v-else>{{ patient.phone }}</td>

            <td>
              <div v-if="editingPatient && editingPatient.id === patient.id">
                <button class="btn btn-sm btn-success me-2" @click="savePatient">Save</button>
                <button class="btn btn-sm btn-secondary" @click="editingPatient = null">Cancel</button>
              </div>
              <div v-else>
                <button class="btn btn-sm btn-primary me-2" @click="editingPatient = {...patient}">Edit</button>
                <button class="btn btn-sm btn-danger" @click="deletePatient(patient.id)">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  `,
}

