export default{
  name: "AdminDash",
    template: `
    <template>
  <div class="container mt-4">
    <h2 class="mb-4">Admin Dashboard</h2>


   
  <div class="container mt-4">
    
    


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
