<script>
import router from "@router";
import {
  SimpleBar
} from "simplebar-vue3";
import {
authComputed,
  layoutComputed
} from "@state/helpers";


import NavBar from "@components/nav-bar";
import RightBar from "@components/right-bar";
import Footer from "@components/footer";
import { exit } from "process";

/**
 * Vertical layout
 */
export default {
  components: {
    NavBar,
    RightBar,
    Footer,
    SimpleBar,
  },
  props: {
    dinases: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  data() {
    return {
      isMenuCondensed: false,
      rmenu: localStorage.getItem('rmenu') ? localStorage.getItem('rmenu') : 'twocolumn',
    };
  },
  computed: {
    ...layoutComputed,
    ...authComputed,
  },
  watch: {
        '$route.params.route_dinas_id': {
            handler: function (newVal, oldVal) {
                if (newVal !== oldVal) {
                  this.initPage()
                }
            },
            deep: true,
        }
    },
  created: () => {
    // document.body.removeAttribute("data-layout", "horizontal");
    // document.body.removeAttribute("data-topbar", "dark");
    // document.body.removeAttribute("data-layout-size", "boxed");
  },
  methods: {
    initPage() {
      this.initActiveMenu();
      if (this.rmenu == 'vertical' && this.layoutType == 'twocolumn') {
        document.documentElement.setAttribute("data-layout", "vertical");
      }
      document.getElementById('overlay').addEventListener('click', () => {
        document.body.classList.remove('vertical-sidebar-enable');
      });

      window.addEventListener("resize", () => {
        if (this.layoutType == 'twocolumn') {
          var windowSize = document.documentElement.clientWidth;
          if (windowSize < 767) {
            document.documentElement.setAttribute("data-layout", "vertical");
            this.rmenu = 'vertical';
            localStorage.setItem('rmenu', 'vertical');
          } else {
            document.documentElement.setAttribute("data-layout", "twocolumn");
            this.rmenu = 'twocolumn';
            localStorage.setItem('rmenu', 'twocolumn');
            setTimeout(() => {
              this.initActiveMenu();
            }, 50);

          }
        }
      });
    },
    initActiveMenu() {
      const pathName = window.location.pathname;
      const ul = document.getElementById("navbar-nav");
      if (ul) {
        const items = Array.from(ul.querySelectorAll("a.nav-link"));
        let activeItems = items.filter((x) => x.classList.contains("active"));
        this.removeActivation(activeItems);
        let matchingMenuItem = items.find((x) => {
          return x.getAttribute("href") === pathName;
        });
   
        if (matchingMenuItem === undefined) {
          var pathname = window.location.pathname.split('/')

          items.forEach(x => {
            var links = x.getAttribute("href").split('/')
    
            if (links[1] === pathname[1] && links[2] === pathname [2]) {
              matchingMenuItem = x
              exit;
            }
          });
        }
        
        if (matchingMenuItem) {
          this.activateParentDropdown(matchingMenuItem);
        } else {
          var id = pathName.replace("/", "");
          if (id) document.body.classList.add("twocolumn-panel");
          this.activateIconSidebarActive(pathName);
        }
      }
    },

    updateMenu(e) {
      document.body.classList.remove("twocolumn-panel");
      const ul = document.getElementById("navbar-nav");
      if (ul) {
        const items = Array.from(ul.querySelectorAll(".show"));
        items.forEach((item) => {
          item.classList.remove("show");
        });
      }
      const icons = document.getElementById("two-column-menu");
      if (icons) {
        const activeIcons = Array.from(
          icons.querySelectorAll(".nav-icon.active")
        );
        activeIcons.forEach((item) => {
          item.classList.remove("active");
        });
      }
      document.getElementById(e).classList.add("show");
      this.activateIconSidebarActive("#" + e);
    },

    removeActivation(items) {
      items.forEach((item) => {
        if (item.classList.contains("menu-link")) {
          if (!item.classList.contains("active")) {
            item.setAttribute("aria-expanded", false);
          }
          item.nextElementSibling.classList.remove("show");
        }
        if (item.classList.contains("nav-link")) {
          if (item.nextElementSibling) {
            item.nextElementSibling.classList.remove("show");
          }
          item.setAttribute("aria-expanded", false);
        }
        item.classList.remove("active");
      });
    },

    activateIconSidebarActive(id) {
      var menu = document.querySelector(
        "#two-column-menu .simplebar-content-wrapper a[href='" +
        id +
        "'].nav-icon"
      );
      if (menu !== null) {
        menu.classList.add("active");
      }
    },

    activateParentDropdown(item) {
      // navbar-nav menu add active
      item.classList.add("active");
      let parentCollapseDiv = item.closest(".collapse.menu-dropdown");
      if (parentCollapseDiv) {
        // to set aria expand true remaining
        parentCollapseDiv.classList.add("show");
        parentCollapseDiv.parentElement.children[0].classList.add("active");
        parentCollapseDiv.parentElement.children[0].setAttribute("aria-expanded", "true");
        if (parentCollapseDiv.parentElement.closest(".collapse.menu-dropdown")) {
          if (parentCollapseDiv.parentElement.closest(".collapse.menu-dropdown").previousElementSibling) {
            if (parentCollapseDiv.parentElement.closest(".collapse.menu-dropdown").previousElementSibling.parentElement.closest(".collapse.menu-dropdown")) {
              const grandparent = parentCollapseDiv.parentElement.closest(".collapse.menu-dropdown").previousElementSibling.parentElement.closest(".collapse.menu-dropdown");
              this.activateIconSidebarActive("#" + grandparent.getAttribute("id"));
              grandparent.classList.add("show");
            }
          }
          this.activateIconSidebarActive("#" + parentCollapseDiv.parentElement.closest(".collapse.menu-dropdown")
            .getAttribute("id"));

          parentCollapseDiv.parentElement.closest(".collapse").classList.add("show");
          if (parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling)
            parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.classList.add("active");
          return false;
        }
        this.activateIconSidebarActive("#" + parentCollapseDiv.getAttribute("id"));
        return false;
      }
      return false;
    },

    toggleMenu() {

      if (window.screen.width >= 992) {
        // eslint-disable-next-line no-unused-vars
        router.afterEach((routeTo, routeFrom) => {
          document.body.classList.remove("sidebar-enable");
          document.body.classList.remove("vertical-collpsed");
        });
        document.body.classList.toggle("vertical-collpsed");
      } else {
        // eslint-disable-next-line no-unused-vars
        router.afterEach((routeTo, routeFrom) => {
          document.body.classList.remove("sidebar-enable");
        });
        document.body.classList.remove("vertical-collpsed");
      }
      this.isMenuCondensed = !this.isMenuCondensed;
    },

    toggleRightSidebar() {
      document.body.classList.toggle("right-bar-enabled");
    },

    hideRightSidebar() {
      document.body.classList.remove("right-bar-enabled");
    },

  },

  mounted() {
    this.initPage();
  },
};
</script>

<template>
  <div id="layout-wrapper">
    <NavBar />
    <div>
      <!-- ========== Left Sidebar Start ========== -->
      <!-- ========== App Menu ========== -->
      <div class="app-menu navbar-menu">
        <!-- LOGO -->
        <div class="navbar-brand-box">
          <!-- Dark Logo-->
          <router-link to="/" class="logo logo-dark">
            <span class="logo-sm">
              <img src="@assets/images/logo-sm.png" alt="" height="22" />
            </span>
            <span class="logo-lg">
              Monitoring
            </span>
          </router-link>
          <!-- Light Logo-->
          <router-link to="/" class="logo logo-light">
            <span class="logo-sm">
              <img src="@assets/images/logo-sm.png" alt="" height="22" />
            </span>
            <span class="logo-lg logo-text">
              <h2>ReportTool</h2>
            </span>
          </router-link>
          <button type="button" class=" btn btn-sm p-0 fs-20 header-item float-end btn-vertical-sm-hover"
            id="vertical-hover">
            <i class="ri-record-circle-line"></i>
          </button>
        </div>

        <div id="scrollbar" v-if="rmenu == 'twocolumn'">
          <b-container fluid>
            <div id="two-column-menu">
              <SimpleBar class="twocolumn-iconview list-unstyled">
                <b-link href="#" class="logo"><img src="@assets/images/logo-tool.png" alt="Logo" height="35" /></b-link>
                <!-- <li>
                  <b-link class="nav-icon" href="#sidebarDashboards" role="button"
                    @click.prevent="updateMenu('sidebarDashboards')">
                    <vue-feather type="home" size="17"></vue-feather>
                  </b-link>
                </li> -->
                <li>
                  <b-link class="nav-icon" href="#sidebarLaporan" role="button" @click.prevent="updateMenu('sidebarLaporan')">
                    <vue-feather type="printer" size="17"></vue-feather>
                  </b-link>
                </li>
                <li>
                  <b-link class="nav-icon" href="#sideBarSetting" tool role="button" @click.prevent="updateMenu('sideBarSetting')">
                    <vue-feather type="tool" size="17"></vue-feather>
                  </b-link>
                </li>
                <li>
                  <b-link class="nav-icon" href="#sidebarMaster" role="button" @click.prevent="updateMenu('sidebarMaster')">
                    <vue-feather type="grid" size="17"></vue-feather>
                  </b-link>
                </li>
                <!-- <li>
                  <b-link class="nav-icon" href="#sidebarMaster" role="button" @click.prevent="updateMenu('sidebarTest')">
                    <vue-feather type="calendar" size="17"></vue-feather>
                  </b-link>
                </li> -->
               
                <!-- <li>
                  <b-link class="nav-icon" href="#sidebarPages" role="button" @click.prevent="updateMenu('sidebarPages')">
                    <vue-feather type="settings" size="17"></vue-feather>
                  </b-link>
                </li> -->
              </SimpleBar>
            </div>
            <template v-if="layoutType === 'twocolumn'">
              <SimpleBar class="navbar-nav" id="navbar-nav">
                <li class="menu-title">
                  <span data-key="t-menu"> {{ $t("t-menu") }}</span>
                </li>
                <li class="nav-item">
                  <div class="collapse menu-dropdown" id="sidebarDashboards">
                    <ul class="nav nav-sm flex-column">
                      
                    </ul>
                  </div>
                </li>
                <!-- end Dashboard Menu -->
                <li class="nav-item">
                  <div class="collapse menu-dropdown" id="sideBarSetting">
                    <ul class="nav nav-sm flex-column">
                      <li class="nav-item">
                        <router-link to="/setting/dinas" class="nav-link" data-key="data-dinas">
                          Setting Dinas
                        </router-link>
                      </li>
                      <li class="nav-item">
                        <router-link to="/setting/peran" class="nav-link" data-key="data-dinas">
                          Setting Peran
                        </router-link>
                      </li>
                      <li class="nav-item">
                        <router-link to="/setting/pengguna" class="nav-link" data-key="data-dinas">
                          Setting Pengguna
                        </router-link>
                      </li>
                    </ul>
                  </div>
                </li>
                <li class="nav-item">
                  <div class="collapse menu-dropdown" id="sidebarMaster">
                    <ul class="nav nav-sm flex-column">                     
                      <li v-for="(item, index) in dinases" class="nav-item" :key="index">
                        <router-link :to="`/master/pekerjaan/${item.id}`" class="nav-link" 
                          :class="$route.fullPath === `/master/pekerjaan/${item.id}` ? 'active' : ''" data-key="data-pekerjaan">
                          {{item.nama}}
                        </router-link>
                      </li>    
                    </ul>
                  </div>
                </li>
                <li class="nav-item">
                  <div class="collapse menu-dropdown" id="sidebarLaporan">
                    <ul class="nav nav-sm flex-column">                     
                      <li v-for="(item, index) in dinases" class="nav-item" :key="index">
                        <router-link :to="`/laporan/pekerjaan/${item.id}`" class="nav-link" 
                          :class="$route.fullPath === `/laporan/pekerjaan/${item.id}` ? 'active' : ''" data-key="data-pekerjaan">
                          {{item.nama}}
                        </router-link>
                      </li>    
                    </ul>
                  </div>
                </li>
                <li class="nav-item">
                  <div class="collapse menu-dropdown" id="sidebarTest">
                    <ul class="nav nav-sm flex-column">
                      <li class="nav-item">
                        <router-link to="/file-manager" class="nav-link" data-key="file-manager">
                          File Manager
                        </router-link>
                      </li>
                    </ul>
                  </div>
                </li>
              </SimpleBar>
            </template>
          </b-container>
        </div>

        <div class="sidebar-background"></div>
      </div>
      <!-- Left Sidebar End -->
      <!-- Vertical Overlay-->
      <div class="vertical-overlay" id="overlay"></div>
    </div>
    <!-- ============================================================== -->
    <!-- Start Page Content here -->
    <!-- ============================================================== -->

    <div class="main-content">
      <div class="page-content">
        <!-- Start Content-->
        <b-container fluid>
          <slot />
        </b-container>
      </div>
      <Footer />
    </div>
    <RightBar />
  </div>
</template>
<style lang="scss">
  .logo-lg {
    &.logo-text {
      h2 {
        margin: 15px 0px 0px 0px;
        padding: 5px 0px;
        border: 1px solid;
      }
    }
  }
</style>