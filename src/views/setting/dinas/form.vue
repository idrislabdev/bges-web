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
        title: "Dinas",
        meta: [{ name: "description", content: appConfig.description }],
    },
    data() {
        return {
            title: "Data Dinas",
            items: [
                {
                    text: "Setting",
                    href: "/",
                },
                {
                    text: "Data Dinas",
                    href: "/setting/dinas"
                },
                {
                    text : 'Tambah Data',
                    active: true
                }
            ],
            baseURL: process.env.VUE_APP_API_ENDPOINT,
            apiUrl: '/web/setting/dinas',
            parentRoutes: '/setting/dinas',
            typeCrud: 'postFormData',
            pkId: null,
            nama: "",
            deskripsi: "",
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
        setImage() {
            var src = this.$el.querySelector('#file-image')
            this.logo = src.files[0]
            this.logoUrl = URL.createObjectURL(src.files[0])
            if (this.logo.size > 2000000) {
                alert(
                'File yang anda upload Terlalu Besar (Maksimal 500kb) ' +
                    'Ukuran File yang anda kirim ' +
                    this.formatBytes(this.logo.size)
                )
                this.logo = null
                this.$refs.logo = ''
            }
        },
        formatBytes(bytes, decimals = 0) {
            if (bytes === 0) return '0 GB'
            if (isNaN(parseInt(bytes))) return bytes
            if (typeof bytes === 'string') bytes = parseInt(bytes)
            if (bytes === 0) return '0'
            const k = 1000
            const dm = decimals + 1 || 3
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
            const i = Math.floor(Math.log(bytes) / Math.log(k))
            return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`
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
                                <b-col xxl="12" class="upload-image-logo">
                                    <b-row class="h-100">
                                        <div
                                            v-if="logoUrl === null"
                                            class="col-sm-12 upload-area"
                                        >
                                            <label class="upload-logo" for="file-image">
                                            <div class="text-upload">
                                                <vue-feather type="upload-cloud" size="25"></vue-feather>
                                                <h5>Upload Logo</h5>
                                            </div>
                                            <div class="text-ukuran">
                                                <label>Ukuran file maks:</label>
                                                <p>2MB, format jpg,png</p>
                                            </div>
                                            </label>
                                        </div>
                                        <div v-if="logoUrl !== null" class="col-sm-12 img-area">
                                            <label class="change-logo" for="file-image">
                                            <vue-feather type="camera-off" size="13"></vue-feather>
                                            </label>
                                            <img :src="logoUrl" />
                                        </div>
                                        <input
                                            id="file-image"
                                            type="file"
                                            accept="image/png, image/jpeg, image/jpg"
                                            @change="setImage"
                                        />
                                    </b-row>
                                </b-col>
                            </b-row>
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
                                        <label for="basiInput" class="form-label">Deskripsi</label>
                                        <input v-model="deskripsi" type="text" class="form-control" id="basiInput">
                                        <span v-if="errors.deskripsi" class="text-required">
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
