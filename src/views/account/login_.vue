<script>
import { required, helpers } from "@vuelidate/validators";
import appConfig from "../../../app.config";

import { authMethods } from "@state/helpers";

export default {
  page: {
    title: "Login",
    meta: [
      {
        name: "description",
        content: appConfig.description,
      },
    ],
  },
  data() {
    return {
      username: null,
      password: null,
      submitted: false,
      authError: null,
      tryingToLogIn: false,
      isAuthError: false,
    };
  },
  validations: {
    username: {
      required: helpers.withMessage("Username is required", required),
    },
    password: {
      required: helpers.withMessage("Password is required", required),
    },
  },
  computed: {},
  methods: {
    ...authMethods,
    // and password they provided.
    tryToLogIn() {
      this.tryingToLogIn = true;
      this.authError = null;
      return this.logIn({
        username: this.username,
        password: this.password,
      })
        .then((response) => {
          console.log(response.dinases[0].pekerjaans[0].id)
          this.tryingToLogIn = false;
          this.isAuthError = false;
          this.$router.push({
            path: "/home/pekerjaan/"+response.dinases[0].id,
          });
        })
        .catch((error) => {
          this.tryingToLogIn = false;
          this.authError = error.response ? error.response.data.message : "";
          this.isAuthError = true;
        });
    },
  },
};
</script>

<template>
  <div class="auth-page-wrapper pt-5">
    <div class="auth-page-content">
      <b-container>
        <b-row>
          <b-col lg="12">
            <div class="text-center mt-sm-5 mb-4 text-white-50">
              <div>
                <router-link to="/" class="d-inline-block auth-logo">
                  <img
                    src="@assets/images/logo-light.png"
                    alt=""
                    height="20"
                  />
                </router-link>
              </div>
              <p class="mt-3 fs-15 fw-medium">
                Premium Admin & Dashboard Template
              </p>
            </div>
          </b-col>
        </b-row>

        <b-row class="justify-content-center">
          <b-col md="8" lg="6" xl="5">
            <b-card no-body class="mt-4">
              <b-card-body class="p-4">
                <div class="text-center mt-2">
                  <h5 class="text-primary">Welcome Back !</h5>
                  <p class="text-muted">Sign in to continue to Velzon.</p>
                </div>
                <div class="p-2 mt-4">
                  <b-alert
                    v-model="authError"
                    variant="danger"
                    class="mt-3"
                    dismissible
                    >{{ authError }}</b-alert
                  >

                  <div></div>

                  <form @submit.prevent="tryToLogIn" autocomplete="off">
                    <div class="mb-3">
                      <label for="username" class="form-label">Username</label>
                      <input
                        type="text"
                        class="form-control"
                        id="username"
                        placeholder="Enter username"
                        v-model="username"
                      />
                      <div class="invalid-feedback">
                        <span></span>
                      </div>
                    </div>

                    <div class="mb-3">
                      <label class="form-label" for="password-input"
                        >Password</label
                      >
                      <div class="position-relative auth-pass-inputgroup mb-3">
                        <input
                          type="password"
                          v-model="password"
                          class="form-control pe-5"
                          placeholder="Enter password"
                          id="password-input"
                        />
                        <b-button
                          variant="link"
                          class="
                            position-absolute
                            end-0
                            top-0
                            text-decoration-none text-muted
                          "
                          type="button"
                          id="password-addon"
                        >
                          <i class="ri-eye-fill align-middle"></i>
                        </b-button>
                        <div class="invalid-feedback">
                          <span></span>
                        </div>
                      </div>
                    </div>

                    <div class="mt-4">
                      <b-button
                        variant="success"
                        class="w-100"
                        type="submit"
                        @click="tryingToLogIn"
                      >
                        Sign In
                      </b-button>
                    </div>
                  </form>
                </div>
              </b-card-body>
            </b-card>
          </b-col>
        </b-row>
      </b-container>
    </div>
  </div>
</template>