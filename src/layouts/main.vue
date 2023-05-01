<script>
import { authComputed, authMethods, layoutComputed } from "@state/helpers";

import TwoColumns from "./twocolumn";
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

export default {
  components: {
    TwoColumns
  },
  data() {
    return {
      dinases: null,
      isValid : false,
      passwordMin : false,
      password : '',
      confirmPassword : '',
    };
  },
  computed: {
    ...layoutComputed,
    ...authComputed,
  },
  watch : {
      password: {
          handler: function () {
            this.checkValid();
            if (this.password.length < 3) {
              this.passwordMin = true;
            } else {
              this.passwordMin = false;
            }
          },
      },
      confirmPassword: {
          handler: function () {
              this.checkValid();
          },
      },
  },
  mounted() {
    // document.querySelector("html").setAttribute('dir', 'rtl');
    this.dinases = this.currentUser.dinases
  },
  methods: {
    ...authMethods,
    checkValid(){
      if (this.password !== this.confirmPassword) {
        this.isValid = false
      } else {
        this.isValid = true
      }
    },
    gantiPassword(){
      this.changePassword({password: this.password, confirmPassword : this.confirmPassword})
      .then((response) => {
        if (response.data) {
          toast.info("Password Berhasil Diupdate", {
              position: toast.POSITION.TOP_CENTER,
              closeButton : false,
              hideProgressBar: true
          });
        } else {
          toast.error("Password Gagal Diupdate", {
              position: toast.POSITION.TOP_CENTER,
              closeButton : false,
              hideProgressBar: true
          });
        }
        this.awal()
      })
    },
    awal(){
      this.isValid = false;
      this.passwordMin = false;
      this.password = '';
      this.confirmPassword = '';
      this.showModalPassword({modalPassword : false})
    }
  }
};
</script>

<template>
   <TwoColumns v-if="dinases !== null" :layout="layoutType" :dinases="dinases">
      <slot />
  </TwoColumns>
    <b-modal 
      v-model="modalPassword"
      title-class="text-center"
      centered
      no-close-on-backdrop
      no-close-on-esc
      hide-header
      hide-footer
      class="v-modal-custom"
    >
      <div>
        <b-form-group
          id="input-group-1"
          label="Password Baru"
          label-for="password"
        >
          <b-form-input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="Masukkan Password"
          ></b-form-input>
          <span v-if="passwordMin && password !== ''" class="text-danger font-size-11">password minimal 3 karakter</span>
        </b-form-group>
        <b-form-group
          id="input-group-2"
          label="Konfirmasi Password"
          label-for="confirmPassword"
        >
          <b-form-input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            placeholder="Konfirmasi Password"
            :disabled="passwordMin"
          ></b-form-input>
        </b-form-group>
      </div>
      <p v-if="!isValid && password !== '' && confirmPassword !== ''" class="text-danger font-size-13">konfirmasi password tidak sama</p>
       <div class="d-flex justify-content-end gap-1">
          <b-button class="mr-2" type="button" variant="outline-primary" @click="awal">Batal / Keluar</b-button>
          <b-button type="button" variant="primary" :disabled="!isValid" @click="gantiPassword">Simpan Perubahan</b-button>
       </div>
    </b-modal>
</template>
