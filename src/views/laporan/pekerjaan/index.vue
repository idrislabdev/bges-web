<script>
import Layout from "@/src/layouts/main.vue";
import appConfig from "../../../../app.config";

import "prismjs";
import "prismjs/themes/prism.css";
import { crudMethods, pageMethods } from "@/src/state/helpers";

import 'vue3-toastify/dist/index.css';
import { debounce } from 'lodash'
import moment from 'moment';

export default {
    page: {
        title: "Pekerjaan",
        meta: [{ name: "Data Pekerjaan MRTG", content: appConfig.description }],
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
            title: "Data Pekerjaan",
            items: [
                {
                    text: "Master",
                    href: "/",
                },
                {
                    text: "Data Pekerjaan",
                    active: true,
                },
            ],
            baseURL: process.env.VUE_APP_API_ENDPOINT,
            apiUrl: '/web/master/pekerjaan',
            routes: '/master/pekerjaan',
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
            pekerjaans: [],
            pekerjaan: {},
            modalLoading: false,
            downloadLoading: false,
            typeCrud: 'insertData',
            errors: {
                nama: null,
                deskripsi: null,
                no_urut: null,
            },
            folderActiveId: null,
            optionsComponent: {
              theme: "flat dark",
              zIndex: 3,
              minWidth: 230,
              x: 500,
              y: 200
            },
            fields: [
                { key: 'no', label: 'No', sortable: true },
                { key: 'nama', label: 'Nama', sortable: false },
                { key: 'deskripsi', label: 'Deskripsi', sortable: false },
                { key: 'dinas', label: 'Dinas', sortable: false,
                    formatter: (value, key, item) => {
                        return item.dinas.nama
                    }, 
                },
                { key: 'download', label: 'Download', sortable: false },
                { key: 'upload', label: 'Upload', sortable: false },
                { key: 'id', label: 'Aksi', sortable: false },
            ],
            month : ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"],
            totalMonths: 0,
            date: new Date(),
            dateNow: new Date(),
            year: moment().format('YYYY'),
            years: []
        };
    },
    components: {
        Layout,
    },
    computed: {},
    watch: {
        '$route.params.route_dinas_id': {
            handler: function (newVal) {
              console.log(newVal)
              this.getPekerjaans()
            }
        },
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
        year: {
            handler: function(newVal, oldVal) {
                console.log(newVal)
                if (newVal !== oldVal) {
                    if (moment(this.dateNow).format('YYYY') > this.year) {
                        this.date = new Date(`${this.year}-12-01`)
                    } else {
                        this.date = this.dateNow
                    }
                }
            }
        }
    },
    mounted() {
        // this.modalLoading = true
        let years = []
        let year = moment().format('YYYY')
        for (var i = year; i >= 2023; i--) {
            years.push(parseInt(i))
        }
        this.years = years

        this.getPekerjaans()    
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
        getPekerjaans() {
            this.listData({
                url: `/web/master/dinas/${this.$route.params.route_dinas_id}/pekerjaan?status=active`,
            }).then((response) => {
                const { data } = response.data
                this.pekerjaans  = data

                if (this.pekerjaans.length > 0)
                    this.setPekerjaan(this.pekerjaans[0])
                if (this.pekerjaan.parent_id !== undefined && this.pekerjaan.parent_id !== null) {
                  let id = this.pekerjaan.parent_id === null ? this.pekerjaan.id : this.pekerjaan.parent_id 
                  this.pekerjaan = data.find((x) => x.id === id)
                }
                  
            })
        },
        setPekerjaan(item) {
          if (item.parent_id === null) {
            this.folderActiveId = null
            this.pekerjaan = item
          } else {
            this.folderActiveId = item.id
            this.pekerjaan = this.pekerjaans.find((x) => x.id === item.parent_id)
          }
        },
        padWithLeadingZeros(num, totalLength) {
            return String(num).padStart(totalLength, '0');
        },
        downloadLaporan(month, year) {
            this.modalLoading = true
            let body = {
                "pekerjaan_id"  : this.pekerjaan.id,
                "periode"       : year+this.padWithLeadingZeros(month, 2)
            }
            this.downloadDataPost({
                url: '/web/laporan/bulanan',
                body: body,
            }).then((response) => {
                const url = window.URL.createObjectURL(new Blob([response.data]))
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', `Laporan pekerjaan ${this.pekerjaan.nama} bulan ${this.month[month-1]} tahun ${year}.pdf`)
                document.body.appendChild(link)
                link.click()
                this.modalLoading = false
            })
        },
    }
};
</script>

<template>
    <Layout>
        <div class="chat-wrapper d-lg-flex gap-1 mx-n4 mt-n4 p-1">
            <div class="file-manager-sidebar border">
                <div class="p-3 d-flex flex-column h-100">
                    <!-- <div class="mb-3">
                        <h5 class="mb-0 fw-semibold">Pekerjaan RWNet</h5>
                    </div>
                    <div class="search-box">
                        <input type="text" class="form-control bg-light border-light" placeholder="Search here..." />
                        <i class="ri-search-2-line search-icon"></i>
                    </div> -->
                    <div class="mt-3 mx-n4 px-4 file-menu-sidebar-scroll-2" data-simplebar>
                        <ul class="list-unstyled file-manager-menu">
                            <li v-for="(item, index) in pekerjaans" :key="index">
                                <b-link role="button" :class="item.id === pekerjaan.id ? 'active' : ''"
                                    @click="setPekerjaan(item)"  
                                  >
                                    <i class="ri-folder-2-line align-bottom me-2"></i>
                                    <span class="file-list-link">{{item.nama}}</span>
                                </b-link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
          <div class="file-manager-content w-100 p-3 py-0 border">
            <div class="mx-n3 pt-4 px-4 file-manager-content-scroll" data-simplebar>
              <div id="folder-list" class="mb-2">
                <b-row v-if="pekerjaan.nama" class="justify-content-beetwen g-2 mb-3 align-items-center">
                  <b-col>
                    <div class="d-flex align-items-center">
                      <div class="flex-shrink-0 me-2 d-block d-lg-none">
                        <b-button variant="soft-success" size="sm" type="button" class="btn-icon fs-16 file-menu-btn">
                          <i class="ri-menu-2-fill align-bottom"></i>
                        </b-button>
                      </div>
                      <div class="flex-grow-1 d-flex align-items-center justify-content-between">
                        <h5 class="fs-16 mb-0">Pekerjaan {{ pekerjaan.nama }}</h5>
                        <div class="year-action-flex">
                            <label>Pilih Tahun</label>
                            <b-form-select
                                v-model="year"
                                :options="years"
                            >
                            </b-form-select>
                        </div>
                      </div>
                    </div>
                  </b-col>
                </b-row>

                <b-row id="folderlist-data">
                    <b-col v-for="i in date.getMonth()" :key="i" cols="6" xxl="2" class=" folder-card">
                        <b-card no-body class="bg-light shadow-none" id="folder-1">
                        <b-card-body class="file-custom">
                            <div class="text-center">
                            <div class="mb-2">
                                <i class="ri-file-text-line align-bottom text-warning display-5"></i>
                            </div>
                            <a 
                                href="javascript:void(0);" 
                                class="fs-15 folder-name stretched-link d-flex flex-column text-dark" 
                                @click="downloadLaporan(i, date.getFullYear())"
                            >
                                <span>Laporan</span>
                                <span>{{ pekerjaan.nama }}</span>
                                <span>Bulan {{ month[i-1]  }} {{ date.getFullYear() }}</span>
                            </a>
                            </div>
                        </b-card-body>
                        </b-card>
                    </b-col>
                    <b-col v-if="dateNow.getFullYear() > year" cols="6" xxl="2" class=" folder-card">
                        <b-card no-body class="bg-light shadow-none" id="folder-1">
                        <b-card-body class="file-custom">
                            <div class="text-center">
                            <div class="mb-2">
                                <i class="ri-file-text-line align-bottom text-warning display-5"></i>
                            </div>
                            <a 
                                href="javascript:void(0);" 
                                class="fs-15 folder-name stretched-link d-flex flex-column text-dark" 
                                @click="downloadLaporan(12, date.getFullYear())"
                            >
                                <span>Laporan</span>
                                <span>{{ pekerjaan.nama }}</span>
                                <span>Bulan {{ month[11]  }} {{ date.getFullYear() }}</span>
                            </a>
                            </div>
                        </b-card-body>
                        </b-card>
                    </b-col>
                </b-row>
              </div>
            </div>
          </div>
        </div>
        <b-modal
            v-model="modalLoading"
            title-class="text-center"
            centered
            no-close-on-backdrop
            no-close-on-esc
            hide-header
            hide-footer
            class="v-modal-custom"
        >
           <div class="d-flex flex-column justify-content-center align-items-center gap-2">
                <div>
                    <b-spinner style="width: 3rem; height: 3rem;"></b-spinner>
                </div>
                <div class="d-flex flex-column justify-content-center align-items-center gap-1">
                    <h5 class="mb-0">Harap Tunggu</h5>
                    <h6 class="mb-0">Laporan sedang dalam proses download</h6>
                </div>
           </div>
        </b-modal>
    </Layout>
</template>
<style lang="scss">
  .file-custom {
    height: 185px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    a {
        span {
            font-size: 12px;
        }
    }
  }
  .year-action-flex {
    display: flex;
    align-items: center;
    justify-content: space-between;
    label {
        width: 100px;
        margin-bottom: 0px;
    }
    select {
        width: 100px;
    }
  }
</style>