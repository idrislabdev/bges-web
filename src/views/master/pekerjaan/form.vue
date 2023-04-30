<script>
import Layout from "@/src/layouts/main.vue";
import PageHeader from "@components/page-header";
import appConfig from "../../../../app.config";

import "prismjs";
import "prismjs/themes/prism.css";
import { crudMethods, pageMethods } from "@/src/state/helpers";

import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

import { onlyNumber } from '@helpers/global-function'

export default {
    page: {
        title: "Pekerjaan",
        meta: [{ name: "description", content: appConfig.description }],
    },
    data() {
        return {
            title: "Data Pekerjaan",
            items: [
                {
                    text: "Master",
                    href: "/",
                },
                {
                    text: "Data Pekerjaan",
                    href: "/master/pekerjaan"
                },
                {
                    text : 'Tambah Data',
                    active: true
                }
            ],
            baseURL: process.env.VUE_APP_API_ENDPOINT,
            apiUrl: '/web/master/pekerjaan',
            parentRoutes: '/master/pekerjaan',
            typeCrud: 'postFormData',
            pkId: null,
            nama: "",
            pekerjaan: "",
            dinasId: "",
            deskripsi: "",
            download: 0,
            upload: 0,
            logoUrl : null,
            logo: null,
            errors: {
                nama: null,
                deskripsi: null
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
        if (this.$route.params.id) {
            this.pkId = this.$route.params.id
            this.typeCrud = 'putFormData'
            this.getDetail()
        }
    },
    methods: {
        ...crudMethods,
        ...pageMethods,
        onlyNumber,
        store() {
            let body = new FormData()


            body.append('nama', this.nama)
            body.append('deskripsi', this.deskripsi)
            if (this.logo !== null) body.append('logo', this.logo)

            let url = this.apiUrl
            if (this.typeCrud === 'putFormData') {
                url = this.apiUrl + `/${this.pkId}`
                body.append('_method', 'PUT')
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
                    this.$router.push({ name: 'ListDinas' })
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
                this.deskripsi = data.deskripsi;
                this.logoUrl = `${this.baseURL.replace('api', '')}storage/${data.logo_url}`;
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
                                        <span v-if="errors.name" class="text-required">
                                            {{ errors.nama.toString() }}
                                        </span>
                                    </div>
                                </b-col>
                            </b-row>
                            <b-row class="gy-4 mb-2">
                                <b-col xxl="6">
                                    <div>
                                        <label for="basiInput" class="form-label">Pekerjaan</label>
                                        <input v-model="pekerjaan" type="text" class="form-control" id="basiInput">
                                        <span v-if="errors.pekerjaan" class="text-required">
                                            {{ errors.pekerjaan.toString() }}
                                        </span>
                                    </div>
                                </b-col>
                            </b-row>
                            <b-row class="gy-4 mb-2">
                                <b-col xxl="6">
                                    <div>
                                        <label for="basiInput" class="form-label">Download</label>
                                        <input v-model="download" type="text" class="form-control" id="basiInput" @keypress="onlyNumber">
                                        <span v-if="errors.download" class="text-required">
                                            {{ errors.download.toString() }}
                                        </span>
                                    </div>
                                </b-col>
                            </b-row>
                            <b-row class="gy-4 mb-2">
                                <b-col xxl="6">
                                    <div>
                                        <label for="basiInput" class="form-label">Upload</label>
                                        <input v-model="upload" type="text" class="form-control" id="basiInput">
                                        <span v-if="errors.upload" class="text-required">
                                            {{ errors.upload.toString() }}
                                        </span>
                                    </div>
                                </b-col>
                            </b-row>
                            <b-row class="gy-4 mb-2">
                                <b-col xxl="6">
                                    <div>
                                        <label for="basiInput" class="form-label">Deskripsi</label>
                                        <input v-model="deskripsi" type="text" class="form-control" id="basiInput">
                                        <span v-if="errors.name" class="text-required">
                                            {{ errors.deskripsi.toString() }}
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
