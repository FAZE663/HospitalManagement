export default {
  name: "PatientProfile",

  data() {
    return {
      patientId: null,
      patient: {
        name: "",
        age: "",
        email: "",
        phone: "",
        address: "",
        
      },

      editMode: false,
      newImage: null,
      image: null,
    };
  },

  created() {
    this.patientId = this.$root.userid;   // same login system
    this.loadPatientProfile();
    this.loadProfileImage();
  },

  methods: {
    // Fetch patient details
    loadPatientProfile() {
      fetch(`/api/patients/${this.patientId}`)
        .then(res => res.json())
        .then(data => {
          delete data.profile_image;
          this.patient = data;
        })
        .catch(err => console.error("Error loading patient profile", err));
    },

    enableEdit() {
      this.editMode = true;
    },

    disableEdit() {
      this.editMode = false;
      this.loadPatientProfile();
    },

    // Save profile updates
    saveProfile() {
      fetch(`/api/patients/${this.patientId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(this.patient)
      })
      .then(res => {
        if (!res.ok) throw new Error("Failed to update profile");
        return res.json();
      })
      .then(() => {
        alert("Profile updated successfully!");
        this.editMode = false;
        this.loadPatientProfile();
      })
      .catch(err => console.error(err));
    },

    // Handle new image upload
    handleImageUpload(event) {
      this.newImage = event.target.files[0];
    },

    loadProfileImage() {
      const cacheKey = `patient_img_${this.patientId}`;

      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        this.image = cached;
        return;
      }

      fetch(`/api/patients/image/${this.patientId}`)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result;
            localStorage.setItem(cacheKey, base64);
            this.image = base64;
          };
          reader.readAsDataURL(blob);
        })
        .catch(err => console.error("Error loading image:", err));
    },

    uploadImage() {
      if (!this.newImage) {
        alert("No image selected!");
        return;
      }

      const formData = new FormData();
      formData.append("image", this.newImage);

      fetch(`/api/patients/image/${this.patientId}`, {
        method: "PUT",
        body: formData
      })
        .then(res => res.json())
        .then(() => {
          alert("Image updated!");
          localStorage.removeItem(`patient_img_${this.patientId}`);
          this.loadPatientProfile();
        })
        .catch(err => console.error("Error uploading image:", err));
    },
    datetoage(birthdate) {
      const birth = new Date(birthdate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    }
  },

  template: `
    <div class="container mt-4">
      <h2>My Profile</h2>

      <div class="row">
        <div class="col-md-4">
          <img :src="image" class="img-fluid rounded shadow" />

          <div v-if="editMode" class="mt-3">
            <input type="file" @change="handleImageUpload" />
            <button class="btn btn-primary btn-sm mt-2" @click="uploadImage">
              Upload New Image
            </button>
          </div>
        </div>

        <div class="col-md-8">
          <div v-if="!editMode">
            <p><strong>Name:</strong> {{ patient.name }}</p>
            <p><strong>Age:</strong> {{ datetoage(patient.age) }}</p>
            <p><strong>Gender:</strong> {{ patient.gender }}</p>
            <p><strong>Email:</strong> {{ patient.email }}</p>
            <p><strong>Phone:</strong> {{ patient.phone }}</p>

            <button class="btn btn-success" @click="enableEdit">Edit</button>
          </div>

          <div v-else>
            <div class="form-group">
              <label>Name</label>
              <input v-model="patient.name" class="form-control" />
            </div>

            <div class="form-group">
              <label>Date of Birth</label>
              <input v-model="patient.age" class="form-control" />
            </div>

            <div class="form-group">
              <label>Email</label>
              <input v-model="patient.email" class="form-control" />
            </div>

            <div class="form-group">
              <label>Phone</label>
              <input v-model="patient.phone" class="form-control" />
            </div>


            <button class="btn btn-primary" @click="saveProfile">Save</button>
            <button class="btn btn-secondary" @click="disableEdit">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `
};
