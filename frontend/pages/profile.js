export default {
  name: "DoctorProfile",

  data() {
    return {
      doctorId: null,
      doctor: {
        name: "",
        department: "",
        qualifications: "",
        rating: null,
        email: "",
        profile_note: "",
        profile_image_url: "",
      },

      editMode: false,
      newImage: null,
      image: null,  
    };
  },

  created() {
    this.doctorId = this.$root.userid;   // Adjust based on your login system
    this.loadDoctorProfile();

    this.loadProfileImage();
  },

  methods: {
    // Fetch doctor details
    loadDoctorProfile() {
      fetch(`/api/doctors/${this.doctorId}`)
        .then(res => res.json())
        .then(data => {
          delete data.profile_image;
          this.doctor = data;
          
        })
        .catch(err => console.error("Error loading profile", err));
    },

    enableEdit() {
      this.editMode = true;
    },

    disableEdit() {
      this.editMode = false;
      this.loadDoctorProfile();
    },

    // Save profile updates
    saveProfile() {
      fetch(`/api/doctors/${this.doctorId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(this.doctor)
      })
      .then(res => {
        if (!res.ok) throw new Error("Failed to update profile");
        return res.json();
      })
      .then(() => {
        alert("Profile updated successfully!");
        this.editMode = false;
        this.loadDoctorProfile();
      })
      .catch(err => console.error(err));
    },

    // Handle image input
    handleImageUpload(event) {
      this.newImage = event.target.files[0];
    },

    loadProfileImage() {
      const cacheKey = `doctor_img_${this.doctorId}`;

      

      // Check localStorage cache
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        console.log("Loading profile image...");
         this.image = localStorage.getItem(cacheKey);

        return;
      }

      // Fetch fresh binary image
      fetch(`/api/doctors/image/${this.doctorId}`)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result;
            localStorage.setItem(cacheKey, base64);
            this.image = localStorage.getItem(cacheKey);   // Cache base64
          };
          reader.readAsDataURL(blob);
          this.image = localStorage.getItem(cacheKey);
        }).catch(err => console.error("Error loading image:", err));

      
    },

    uploadImage() {
      if (!this.newImage) {
        alert("No image selected!");
        return;
      }

      const formData = new FormData();
      formData.append("image", this.newImage);

      fetch(`/api/doctors/image/${this.doctorId}`, {
        method: "PUT",
        body: formData
      })
        .then(res => res.json())
        .then(() => {
          alert("Image updated!");
          localStorage.removeItem(`doctor_img_${this.doctorId}`); // Clear cache
          this.loadDoctorProfile();
        })
        .catch(err => console.error("Error uploading image:", err));
    }
  },
  template:`
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
          <p><strong>Name:</strong> {{ doctor.name }}</p>
          <p><strong>Department:</strong> {{ doctor.specialization }}</p>
          <p><strong>Qualifications:</strong> {{ doctor.qualification }}</p>
          <p><strong>Email:</strong> {{ doctor.email }}</p>
          <p><strong>Rating:</strong> {{ doctor.rating }}</p>
          <p><strong>Profile Note:</strong> {{ doctor.profile_note }}</p>

          <button class="btn btn-success" @click="enableEdit">Edit</button>
        </div>

        <div v-else>
          <div class="form-group">
            <label>Name</label>
            <input v-model="doctor.name" class="form-control" />
          </div>

          <div class="form-group">
            <label>Department</label>
            <input v-model="doctor.specialization" class="form-control" />
          </div>

          <div class="form-group">
            <label>Qualifications</label>
            <input v-model="doctor.qualification" class="form-control" />
          </div>

          <div class="form-group">
            <label>Email</label>
            <input v-model="doctor.email" class="form-control" />
          </div>

          <div class="form-group">
            <label>Rating</label>
            <input v-model="doctor.rating" type="number" step="0.1" class="form-control" disabled/>
          </div>

          <div class="form-group">
            <label>Profile Note</label>
            <textarea v-model="doctor.profile_note" class="form-control"></textarea>
          </div>

          <button class="btn btn-primary" @click="saveProfile">Save</button>
          <button class="btn btn-secondary" @click="disableEdit">Cancel</button>
        </div>
      </div>
    </div>
  </div>
  `
};
