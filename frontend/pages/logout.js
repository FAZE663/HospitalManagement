export default {
  created() {
    this.$root.isAuth = false;
    this.$root.userrole = "";
    this.$root.userid = null;

    localStorage.removeItem("userid");

    this.$router.replace("/");
  }
};
