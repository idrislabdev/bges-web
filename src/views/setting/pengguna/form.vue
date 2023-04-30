<script>
import Layout from "@/src/layouts/main.vue";
import PageHeader from "@components/page-header";
import appConfig from "../../../../app.config";

import "prismjs";
import "prismjs/themes/prism.css";
import { crudMethods, pageMethods } from "@/src/state/helpers";

import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';


export default {
    page: {
        title: "Pengguna",
        meta: [{ name: "description", content: appConfig.description }],
    },
    data() {
        return {
            title: "Data Pengguna",
            items: [
                {
                    text: "Setting",
                    href: "/",
                },
                {
                    text: "Data Pengguna",
                    href: "/setting/pengguna"
                },
                {
                    text : 'Tambah Data',
                    active: true
                }
            ],
            baseURL: process.env.VUE_APP_API_ENDPOINT,
            apiUrl: '/web/setting/pengguna',
            parentRoutes: '/setting/pengguna',
            typeCrud: 'insertData',
            pkId: null,
            nama: "",
            username: "",
            peranId : "",
            dinases: [],
            perans: [],
            listDinas: [],
            errors: {
                nama: null,
                username: null
            }
        };
    },
    components: {
        Layout,
        PageHeader,
    },
    computed: {},
    watch: {
    },
    mounted() {
        this.getPerans();
        this.getDinases();
        if (this.$route.params.id) {
            this.pkId = this.$route.params.id
            this.typeCrud = 'updateData'
            this.getDetail()
        }
    },
    methods: {
        ...crudMethods,
        ...pageMethods,
        store() {
            let body = {
                nama : this.nama,
                username : this.username,
                peran : this.peranId,
                dinases : this.dinases
            }


            let url = this.apiUrl
            if (this.typeCrud === 'updateData') {
                url = this.apiUrl + `/${this.pkId}`
            }
            this[this.typeCrud]({ url: url, body: body })
            .then((response) => {
                const { data } = response
                if (data) {
                    let content = ''
                    if (this.typeCrud === 'insertData') {
                        content = this.title + ' berhasil disimpan'
                    } else {
                        content = this.title + ' berhasil diperbaharui'
                    }
                    this.$router.push({ name: 'ListPengguna' })
                    toast.info(content, {
                        position: toast.POSITION.TOP_CENTER,
                        theme: toast.auto,
                        closeButton : false,
                        hideProgressBar: true
                    });
                }
            })
            .catch((err) => {
                if (err.response.status === 403) {
                    // this.errorMessage = JSON.parse(
                    //   err.response.request.response
                    // ).message;
                } else if (err.response.status === 422) {
                    this.errors = err.response.data.errors
                }
            })
        },
        getDetail() {
            this.listData({
                url: `${this.apiUrl}/${this.$route.params.id}`,
            }).then((response) => {
                const { data } = response.data
                this.nama = data.nama;
                this.username = data.username;
                this.peranId = data.peran;
            
                data.dinases.forEach(item => {
                    this.dinases.push(item.dinas_id)
                });
            })
        },
        getPerans() {
            this.listData({
                url: `web/setting/peran`,
            }).then((response) => {
                const { data } = response.data
                this.perans = data
            })
        },
        getDinases() {
            this.listData({
                url: `web/setting/dinas`,
            }).then((response) => {
                const { data } = response.data
                this.listDinas = data
            })
        },
    }
};
</script>

<template>
    <Layout>
        <PageHeader :title="title" :items="items" />
        <b-row>
            <b-col xl="12">
                <b-card no-body>
                    <b-card-header class="align-items-center d-flex">
                        <b-card-title class="mb-0 flex-grow-1">Tambah {{title}}</b-card-title>
                        <div class="flex-shrink-0">
                            <router-link
                                :to="parentRoutes"
                                class="btn btn-sm btn-outline-warning rounded-0 d-flex align-items-center gap-1"
                            >
                                <vue-feather type="arrow-left-circle" size="13"></vue-feather> Kembali
                            </router-link>
                        </div>
                    </b-card-header>
                    <b-card-body>
                        <div class="live-preview">                           
                            <b-row class="gy-4 mb-2">
                                <b-col xxl="6">
                                    <div>
                                        <label for="nama" class="form-label">Nama</label>
                                        <input v-model="nama" type="text" class="form-control" id="nama">
                                        <span v-if="errors.nama" class="text-required">
                                            {{ errors.nama.toString() }}
                                        </span>
                                    </div>
                                </b-col>
                            </b-row>
                            <b-row class="gy-4 mb-2">
                                <b-col xxl="6">
                                    <div>
                                        <label for="username" class="form-label">Username</label>
                                        <input v-model="username" type="text" class="form-control" id="username" :disabled="pkId !== null">
                                        <span v-if="errors.username" class="text-required">
                                            {{ errors.username.toString() }}
                                        </span>
                                    </div>
                                </b-col>
                            </b-row>
                            <b-row class="gy-4 mb-2">
                                <b-col xxl="6">
                                    <div>
                                        <label for="basiInput" class="form-label">Peran</label>
                                        <b-form-select
                                            v-model="peranId"
                                            value-field="id"
                                            text-field="nama"
                                            :options="perans"
                                        >
                                        </b-form-select>
                                        <span v-if="errors.peran_id" class="text-required">
                                            {{ errors.peran_id.toString() }}
                                        </span>
                                    </div>
                                </b-col>
                            </b-row>
                            <b-row class="gy-4 mb-2">
                                <b-col xxl="6">
                                    <div>
                                        <label for="basiInput" class="form-label">Dinas</label>
                                        <b-form-select
                                            v-model="dinases"
                                            value-field="id"
                                            text-field="nama"
                                            :options="listDinas"
                                            multiple
                                        >
                                        </b-form-select>
                                        <span v-if="errors.peran_id" class="text-required">
                                            {{ errors.peran_id.toString() }}
                                        </span>
                                    </div>
                                </b-col>
                            </b-row>
                            <hr />
                            <b-row>
                                <div class="col-sm-12 d-flex justify-content-end gap-2">
                                    <router-link :to="`${parentRoutes}`" class="btn btn-outline-danger rounded-0 d-flex align-items-center gap-1">
                                       <vue-feather type="x-circle" size="13"></vue-feather> Batal
                                    </router-link>
                                    <button class="btn btn-outline-primary rounded-0 d-flex align-items-center gap-1" @click="store">
                                        <vue-feather type="save" size="13"></vue-feather> Simpan
                                    </button>
                                </div>
                            </b-row>
                        </div>
                    </b-card-body>
                </b-card>
            </b-col>
        </b-row>
    </Layout>
</template>
