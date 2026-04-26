

export default {
    name: "PatientDoctorList",

    data() {
        return {
            deptId: null,
            deptName: "",
            doctors: [{
                image_data: null, 
            } // will hold converted image URL
            ],
        };
    },

    async created() {
        // get department id from query param
        this.deptId = this.$route.query.dept;
        if (this.deptId) {
            await this.fetchDoctors();
            await this.fetchimages();
        }
    },

    methods: {
        fetchDoctors() {
            fetch(`/api/doctorlist/${this.deptId}`)
                .then(res => res.json())
                .then(data => {
                    this.doctors = data;
                    // optional: set dept name from first doctor
                    if (data.length) this.deptName = data[0].specialization;
                })
                .catch(err => console.error("Error fetching doctors:", err));
        },

        fetchimages() {
            fetch(`/api/doctors/image/dept/${this.deptId}`)
                .then(res => res.json())
                .then(data => {
                    this.images = data;  // [{doctor_id, image_data}]

                    for (let entry of this.images) {
                        const doc = this.doctors.find(d => d.id === entry.id);
                        if (doc) {
                            Vue.set(doc, "image_data", this.convertImage(entry));
                        }
                    }
                    console.log("Final doctor list:", this.doctors);
                })
                .catch(err => console.error("Error fetching doctor images:", err));
        },

        bookDoctor(doctorId) {
            this.$router.push(`/patient/book?doctor=${doctorId}`);
        },
       convertImage(doc) {
            const binary = doc.profile_image; // latin-1 string from API

            // Convert latin-1 → Uint8Array
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i) & 0xFF;
            }

            // Convert Uint8Array → Base64
            let base64 = "";
            bytes.forEach(b => base64 += String.fromCharCode(b));
            base64 = btoa(base64);

            // Final image URL
            return `data:${doc.image_mimetype};base64,${base64}`;
        }

    },

    template: `
    <div class="container mt-4">
        <h2 class="text-primary mb-3">Doctors in {{ deptName || "Department" }}</h2>
        <div v-if="doctors.length > 0" class="row g-4">
            <div class="col-md-4" v-for="doc in doctors" :key="doc.id">
                <div class="card shadow-sm p-3">

                    <!-- Doctor Image -->
                    <img
                    class="img-fluid rounded mb-3"
                    :src="doc.image_data"
                    alt="Doctor Image"
                    style="height:180px; object-fit:cover;"
                    />

                    <div class="card-body text-center">
                        <h5 class="card-title">{{ doc.name }}</h5>
                        <p class="card-text">Department: {{ doc.specialization }}</p>
                        <p class="card-text">Qualifications: {{ doc.qualification ?? 'N/A' }}</p>
                        <p class="card-text">Profile: {{ doc.profile_note ?? 'No profile available' }}</p>
                        <p class="card-text">Rating: {{ doc.rating ?? '—' }}</p>
                        <button class="btn btn-primary" @click="bookDoctor(doc.id)">Book</button>
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="text-center text-muted mt-4">
            No doctors found in this department.
        </div>
    </div>


  `
};
