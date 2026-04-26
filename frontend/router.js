import Home from "./pages/Home.js";
import admindash from "./pages/admindash.js";
import doctor from "./pages/doctor.js";
import patient  from "./pages/patient.js";
import appointments from "./pages/appointments.js";
import doctordash from "./pages/doctordash.js";
import doctorslot from "./pages/doctorslot.js";
import docapp from "./pages/doctorapp.js"; 
import docpat from "./pages/docpat.js";
import notes from "./pages/notes.js";
import patientdash from "./pages/patientdash.js";
import bookapp from "./pages/bookapp.js";
import pathis from "./pages/pathis.js";
import patnote from "./pages/patnote.js";
import docprofile from "./pages/profile.js"
import doclist from "./pages/doctorlist.js";
import patprof from "./pages/patprof.js";
import logout from "./pages/logout.js";  
import login from "./pages/login.js";
import register from "./pages/register.js";



const savedUserId = localStorage.getItem("userid");
const savedUserRole = localStorage.getItem("userrole");

window.initialAuth = {
    isAuth: !!savedUserId,
    userid: savedUserId,
    userrole: savedUserRole
};




const routes = [
    {path: '/', component: Home},
    {path: '/admin/dashboard', component: admindash ,meta : {requiresAuth: true, role: 'admin'}},
    {path: '/admin/doctors', component: doctor ,meta : {requiresAuth: true, role: 'admin'}},
    {path: '/admin/patients', component: patient,meta : {requiresAuth: true, role: 'admin'}},
    {path: '/admin/appointments', component: appointments, meta : {requiresAuth: true, role: 'admin'}},

    {path: '/doctor/dashboard', component: doctordash, meta: {requiresAuth: true, role: 'doctor'}},
    {path: '/doctor/slots', component: doctorslot , meta: {requiresAuth: true, role: 'doctor'}},
    {path: '/doctor/appointments', component: docapp , meta: {requiresAuth: true, role: 'doctor'}},
    {path: '/doctor/patients', component: docpat , meta: {requiresAuth: true, role: 'doctor'}},
    {path: '/notes/:id', component: notes , meta: {requiresAuth: true, role: 'doctor'}},
    {path : '/doctor/profile', component: docprofile , meta: {requiresAuth: true, role: 'doctor'}},




    {path: '/patient/book', component:  bookapp , meta: {requiresAuth: true, role: 'patient'}},
    {path: '/patient/dashboard', component:  patientdash , meta: {requiresAuth: true, role: 'patient'}},
    {path: '/patient/history', component:  pathis , meta: {requiresAuth: true, role: 'patient'}},
    {path: '/patient/notes/:id', component:  patnote, meta: {requiresAuth: true, role: 'patient'}},
    {path: '/patient/doctorlist', component:  doclist, meta: {requiresAuth: true, role: 'patient'}},
    {path: '/patient/profile', component:  patprof, meta: {requiresAuth: true, role: 'patient'}},
    {path: "/logout", component: logout},
    {path:'/login', component :  login},
    {path:'/register',component: register}

]

const router = new VueRouter({
    routes,
});

router.beforeEach((to, from, next) => {
    
  if (!window.app) return next();

  const isAuth = window.app?.isAuth ?? window.initialAuth.isAuth;
  const role   = window.app?.userrole ?? window.initialAuth.userrole;       // get role, e.g., "patient" or "doctor"
  
  if (to.meta.requiresAuth && !isAuth) {
    return next("/login"); 
  }

  if (to.meta.role && to.meta.role!== role){
    return next('/login');
  }

  next();
});

export default router;