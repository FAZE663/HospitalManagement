import router from "./router.js";
import Navbar  from "./components/navbar.js";



const app = new Vue({
  el : '#app',
    template : `
        <div> 
            <Navbar v-if="isAuth" :userrole="userrole"></Navbar>
            <router-view></router-view>
        </div>
    `,
  components: { Navbar },
    router,
    data() {
      return {
        isAuth: true,
        userrole: "doctor" ,
      };
    }
});