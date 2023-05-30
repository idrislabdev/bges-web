<script>
import Layout from "@/src/layouts/main.vue";
import PageHeader from "@components/page-header";
import appConfig from "../../../../app.config";

import "prismjs";
import "prismjs/themes/prism.css";
import { crudMethods, pageMethods } from "@/src/state/helpers";

import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { debounce } from 'lodash'


export default {
    page: {
        title: "Dinas",
        meta: [{ name: "description", content: appConfig.description }],
    },
    props: {
        user: {
            type: Object,
            required: false,
            default: () => ({}),
        },
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
                    active: true,
                },
            ],
            baseURL: process.env.VUE_APP_API_ENDPOINT,
            apiUrl: '/web/setting/dinas',
            routes: '/setting/dinas',
            rows: 1,
            perPage: 10,
            currentPage: 1,
            total: 1,
            from: 1,
            to: 1,
            search: '',
            isTypingSearch: true,
            modalDelete: false,
            dataTable: [],
            nama: '',
            fields: [
                { key: 'no', label: 'No', sortable: true },
                { key: 'nama', label: 'Nama', sortable: false,
                    formatter: (value, key, item) => {
                        return item
                    }, 
                },
                { key: 'deskripsi', label: 'Deskripsi', sortable: false },
                { key: 'id', label: 'Aksi', sortable: false },
            ],
        };
    },
    components: {
        Layout,
        PageHeader,
    },
    computed: {},
    watch: {
        dataTable: {
            handler: function (newVal) {
                for (var i = 0; i < newVal.length; i++) {
                    this.dataTable[i]['no'] = i + this.from
                }
            },
            deep: true,
        },
        search: debounce(function () {
            this.isTypingSearch = false
        }, 500),
        isTypingSearch: function (value) {
            if (!value && (this.search.length > 3 || this.search.length === 0)) {
                this.items = []
                this.currentPage = 1
                this.getList()
                this.isTypingSearch = true
            }
        },
    },
    mounted() {
        this.getList()
    },
    methods: {
        ...crudMethods,
        ...pageMethods,
        getList() {
            this.listData({
                url: `${this.apiUrl}?page=${this.currentPage}&q=${this.search}`,
            }).then((response) => {
                const { data, meta} = response.data
                this.dataTable = []
                this.rows = meta.total
                this.perPage = meta.per_page
                this.currentPage = meta.current_page
                this.from = meta.from
                this.to = meta.to
                this.total = meta.total

                this.dataTable = data
            })
        },
        destroy() {
            let url = `${this.apiUrl}/${this.pkId}`;
            this.deleteData({
                url: url,
            })
            .then((response) => {
                console.log(response)
                this.modalDelete = false
                this.getList()
                
                toast.info(this.title + ' berhasil dihapus', {
                    position: toast.POSITION.TOP_CENTER,
                    closeButton : false,
                    hideProgressBar: true
                });
            })
            .catch((err) => {
                console.log(err)
                this.modalDelete = false
                let message = JSON.parse(err.response.request.response)
                this.textAllert = message.message
                this.modalAllert = true
            })
        },
        showDestroy(data) {
            this.pkId = data.id
            this.nama = data.nama
            this.modalDelete = true
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
                        <b-card-title class="mb-0 flex-grow-1">Table {{title}}</b-card-title>
                        <div class="flex-shrink-0">
                            <router-link
                                v-if="
                                user.nama === 'root' ||
                                checkPermission
                                "
                                :to="`${routes}/add`"
                                class="btn btn-sm btn-outline-primary rounded-0"
                            >
                                Tambah {{ title }}
                            </router-link>
                        </div>
                    </b-card-header>
                    <b-card-body>
                        <div class="row">
                            <div class="col-sm-12">
                                <div class="search-box">
                                    <input v-model="search" type="text" class="form-control" :placeholder="`Cari ${title} ...`" autocomplete="off">
                                    <i class="ri-search-line search-icon"></i>
                                </div>
                            </div>
                        </div>
                        <div class="table-responsive">
                            <b-table
                                :items="dataTable"
                                :fields="fields"
                            >          

                                <template v-slot:cell(nama)="data">
                                    <div class="d-flex gap-2 align-items-center">
                                        <div class="flex-shrink-0">
                                            <img v-if="data.item.logo_url !== null" :src="`${baseURL.replace('api', '')}storage/${data.item.logo_url}`" alt=""
                                                class="avatar-xs contain rounded-circle" />
                                            <img v-if="data.item.logo_url === null" src="@assets/images/users/no-image-available.png" alt=""
                                                class="avatar-xs contain rounded-circle" />
                                        </div>
                                        <div class="flex-grow-1">
                                            {{data.item.nama}}
                                        </div>
                                    </div>
                                </template>
                                <template v-slot:cell(id)="data">
                                    <router-link
                                        :to="`${routes}/${data.value}/update`"
                                        class="
                                        btn btn-sm btn-outline-primary
                                        rounded-0
                                        me-1
                                        ps-2 pe-2 pb-1 pt-2
                                        "
                                    >
                                        <vue-feather type="edit" size="13"></vue-feather>
                                    </router-link>
                                    <button
                                        class="
                                        btn btn-sm btn-outline-danger
                                        rounded-0
                                        ps-2 pe-2 pb-1 pt-2
                                        "
                                        @click="showDestroy(data.item)"
                                    >
                                        <vue-feather type="trash" size="13"></vue-feather>
                                    </button>
                                </template>                     
                            </b-table>
                        </div>
                        <div class="row mt-4">
                            <div class="col-sm-6">
                                <p class="mb-0">Data {{ from }} ke {{ to }} dari {{ total }} data</p>
                            </div>
                            <div class="col-sm-6">
                                <div class="text-end">
                                    <b-pagination
                                        v-model="currentPage"
                                        :total-rows="rows"
                                        :per-page="perPage"
                                        first-text="Awal"
                                        prev-text="Sebelumnya"
                                        next-text="Selanjutnya"
                                        last-text="Akhir"
                                        class="d-inline-flex"
                                        @input="getList"
                                    >
                                    </b-pagination>
                                </div>
                            </div>
                        </div>
                    </b-card-body>
                </b-card>
            </b-col>
        </b-row>
        <b-modal
            v-model="modalDelete"
            title-class="text-center"
            centered
            no-close-on-backdrop
            hide-header
            hide-footer
            class="v-modal-custom"
        >
            <div class="modal-icon">
                <i class="uil uil-trash-alt"></i>
            </div>
            <h5>
                Hapus {{ title }}
            </h5>
            <p>
                Anda Yakin ingin menghapus <span>”{{ nama }}”</span>?
            </p>
            <div class="modal-footer v-modal-footer">
                <button class="btn btn-outline-dark rounded-0" @click="modalDelete = false">
                    Batal
                </button>
                <button class="btn btn-outline-danger rounded-0" @click="destroy">
                    Hapus
                </button>
            </div>
        </b-modal>
    </Layout>
</template>
