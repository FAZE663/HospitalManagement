import Home from "./pages/Home.js";
import admindash from "./pages/admindash.js";
import doctor from "./pages/doctor.js";
import patient  from "./pages/patient.js";
import appointments from "./pages/appointments.js";
import doctordash from "./pages/doctordash.js";
import doctorslot from "./pages/doctorslot.js";







const routes = [
    {path: '/', component: Home},
    {path: '/admin/dashboard', component: admindash},
    {path: '/admin/doctors', component: doctor},
    {path: '/admin/patients', component: patient},
    {path: '/admin/appointments', component: appointments},

    {path: '/doctor/dashboard', component: doctordash},
    {path: '/doctor/slots', component: doctorslot},
    
]

const router = new VueRouter({
    routes
});

export default router;