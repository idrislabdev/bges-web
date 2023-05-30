import store from "@state/store";

export default [
  {
    path: "/login",
    name: "login",
    component: () => import("../views/account/login.vue"),
    meta: {
      title: "Login",
      beforeResolve(routeTo, routeFrom, next) {
        // If the user is already logged in
        if (store.getters["auth/loggedIn"]) {
          // Redirect to the home page instead
          next({ name: "default" });
        } else {
          // Continue to the login page
          next();
        }
      },
    },
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("../views/account/register.vue"),
    meta: {
      title: "Register",
      beforeResolve(routeTo, routeFrom, next) {
        // If the user is already logged in
        if (store.getters["auth/loggedIn"]) {
          // Redirect to the home page instead
          next({ name: "default" });
        } else {
          // Continue to the login page
          next();
        }
      },
    },
  },
  {
    path: "/forgot-password",
    name: "Forgot password",
    component: () => import("../views/account/forgot-password.vue"),
    meta: {
      title: "Forgot Password",
      beforeResolve(routeTo, routeFrom, next) {
        // If the user is already logged in
        if (store.getters["auth/loggedIn"]) {
          // Redirect to the home page instead
          next({ name: "default" });
        } else {
          // Continue to the login page
          next();
        }
      },
    },
  },
  {
    path: "/",
    name: "default",
    meta: {
      title: "Dashboard",
      authRequired: true,
    },
    component: () => import("../views/dashboard"),
  },


  /*
  * start of setting page routes
  */

  //dinas
  {
    path: "/setting/dinas",
    name: "ListDinas",
    meta: {
      title: "Setting Dinas",
      authRequired: true,
    },
    component: () => import("../views/setting/dinas"),
    props: () => ({
      user: store.state.auth.currentUser || {}
    }),
    
  },
  {
    path: "/setting/dinas/add",
    name: "AddDinas",
    meta: {
      title: "Tambah Setting Dinas",
      authRequired: true,
    },
    component: () => import("../views/setting/dinas/form"),
  },
  {
    path: "/setting/dinas/:id/update",
    name: "UpdateDinas",
    meta: {
      title: "Update Setting Dinas",
      authRequired: true,
    },
    component: () => import("../views/setting/dinas/form"),
  }, 

  //peran

  {
    path: "/setting/peran",
    name: "ListPeran",
    meta: {
      title: "Setting Peran",
      authRequired: true,
    },
    component: () => import("../views/setting/peran"),
    props: () => ({
      user: store.state.auth.currentUser || {}
    }),
    
  },
  {
    path: "/setting/peran/add",
    name: "AddPeran",
    meta: {
      title: "Tambah Setting Peran",
      authRequired: true,
    },
    component: () => import("../views/setting/peran/form"),
  },
  {
    path: "/setting/peran/:id/update",
    name: "UpdatePeran",
    meta: {
      title: "Update Setting Peran",
      authRequired: true,
    },
    component: () => import("../views/setting/peran/form"),
  }, 

  //pengguna

  {
    path: "/setting/pengguna",
    name: "ListPengguna",
    meta: {
      title: "Setting Pengguna",
      authRequired: true,
    },
    component: () => import("../views/setting/pengguna"),
    props: () => ({
      user: store.state.auth.currentUser || {}
    }),
    
  },
  {
    path: "/setting/pengguna/add",
    name: "AddPengguna",
    meta: {
      title: "Tambah Setting Pengguna",
      authRequired: true,
    },
    component: () => import("../views/setting/pengguna/form"),
  },
  {
    path: "/setting/pengguna/:id/update",
    name: "UpdatePengguna",
    meta: {
      title: "Update Setting Pengguna",
      authRequired: true,
    },
    component: () => import("../views/setting/pengguna/form"),
  }, 


  //----------------end of setting page routes-------------------------//



  /*
  * master dinas
  */  
 
  
  //pekerjaan
  {
    path: "/master/pekerjaan/:route_dinas_id",
    name: "ListPekerjaan",
    meta: {
      title: "Data Pekerjaan",
      authRequired: true,
    },
    component: () => import("../views/master/pekerjaan"),
    props: () => ({
      user: store.state.auth.currentUser || {}
    }),
    
  },

  //laporan
  {
    path: "/laporan/pekerjaan/:route_dinas_id",
    name: "LaporanPekerjaan",
    meta: {
      title: "Data Pekerjaan",
      authRequired: true,
    },
    component: () => import("../views/laporan/pekerjaan"),
    props: () => ({
      user: store.state.auth.currentUser || {}
    }),
    
  },

  //view
  {
    path: "/view/:route_dinas_id",
    name: "ViewPekerjaan",
    meta: {
      title: "View Pekerjaan",
      authRequired: true,
    },
    component: () => import("../views/view"),
    props: () => ({
      user: store.state.auth.currentUser || {}
    }),
    
  },

  {
    path: "/file-manager",
    name: "FileManager",
    meta: {
      title: "Data Pekerjaan",
      authRequired: true,
    },
    component: () => import("../views/file-manager"),
    props: () => ({
      user: store.state.auth.currentUser || {}
    }),
    
  },
];