<script>
import Layout from "@/src/layouts/main.vue";
import appConfig from "../../../../app.config";

import "prismjs";
import "prismjs/themes/prism.css";
import { crudMethods, pageMethods } from "@/src/state/helpers";

import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { debounce } from 'lodash'
import moment from 'moment';
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";
import Chart from './chart.vue'

import { onlyNumber } from '@helpers/global-function'

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
            apiUrl: '/web/lokasi/pekerjaan',
            routes: '/lokasi/pekerjaan',
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
            nama: '',
            deskripsi: '',
            noUrut: null,
            parentId: null,
            namaLokasi: '',
            noUrutLokasi: '',
            download: 0,
            upload: 0,
            minDownload: 0,
            minUpload: 0,
            alamatIp: '',
            nomorPemasangan: '',
            alamatPemasangan: '',
            keterangan: '',
            latitude: '',
            longitude: '',
            modalAddPekerjaan: false,
            modalAddTitikLokasi: false,
            typeCrud: 'insertData',
            errors: {
                nama: null,
                deskripsi: null,
                no_urut: null,
            },
            pkIdPekerjaan: null,
            pkIdLokasi: null,
            menuAddPekerjaan: false,
            menuPekerjaan: false,
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
            month: '01',
            months: [
                { id: '01', name: 'JANUARI' },
                { id: '02', name: 'FEBRUARI' },
                { id: '03', name: 'MARET' },
                { id: '04', name: 'APRIL' },
                { id: '05', name: 'MEI' },
                { id: '06', name: 'JUNI' },
                { id: '07', name: 'JULI' },
                { id: '08', name: 'AGUSTUS' },
                { id: '09', name: 'SEPTEMBER' },
                { id: '10', name: 'OKTOBER' },
                { id: '11', name: 'NOVEMBER' },
                { id: '12', name: 'DESEMBER' },
                
            ],
            totalMonths: 0,
            date: new Date(),
            infiniteId: +new Date(),
            page: 1,
            year: moment().format('YYYY'),
            years: [],
            modalUpdateLokasi: false,
            config: {
                wrap: true, // set wrap to true only when using 'input-group'
                altFormat: "M j, Y",
                altInput: true,
                dateFormat: "d M, Y",
            },
            datePicker: new Date(),
            dataLokasi: {},
            dataLokasiTanggal: [],
            tab: 'table'
        };
    },
    components: {
        Layout,
        flatPickr,
        Chart,
    },
    computed: {},
    watch: {
        '$route.params.route_dinas_id': {
            handler: function () {
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
                this.listPekerjaanLokasi()
                this.isTypingSearch = true
            }
        },
        currentPage: {
            handler: function () {
                  this.listPekerjaanLokasi()
            },
            deep: true,
        },
    },
    mounted() {
      for (var i = this.year; i >= 2023; i--) {
          this.years.push(i)
      }
      const d = new Date()
      this.month = String(d.getMonth() + 1).padStart(2, '0');
      this.year = d.getFullYear();

      this.getPekerjaans()
    },
    methods: {
        ...crudMethods,
        ...pageMethods,
        onlyNumber,
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
                url: `/web/master/dinas/${this.$route.params.route_dinas_id}/pekerjaan`,
            }).then((response) => {
                const { data } = response.data
                this.pekerjaans  = data

                if (this.pekerjaan.parent_id !== undefined && this.pekerjaan.parent_id !== null) {
                  let id = this.pekerjaan.parent_id === null ? this.pekerjaan.id : this.pekerjaan.parent_id 
                  this.pekerjaan = data.find((x) => x.id === id)
                }
                  
            })
        },
        setPekerjaan(item) {
          if (item.parent_id === null) {
            this.folderActiveId = null
          } else {
            this.folderActiveId = item.id
          }
          this.pekerjaan = item

          this.pkIdPekerjaan = item.id;
          
          this.currentPage=1;
          this.listPekerjaanLokasi();
        },
        terapkan() {
          this.currentPage = 1;
          this.listPekerjaanLokasi();
        },
        listPekerjaanLokasi() {
          const periode = this.year+this.month;
          this.listData({
                url: `/web/transaksi/data-lokasi?page=${this.currentPage}&q=${this.search}&periode=${periode}&pekerjaan_id=${this.pekerjaan.id}`,
            }).then((response) => {
                const { data, meta } = response.data
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
        showPekerjaan() {
            this.typeCrud = 'updateData'
            this.listData({
                url: `web/master/dinas/${this.$route.params.route_dinas_id}/pekerjaan/${this.pkIdPekerjaan}`,
            }).then((response) => {
                const { data } = response.data
                this.nama = data.nama;
                this.deskripsi = data.deskripsi;
                this.noUrut = data.no_urut;
                this.parentId = data.parent_id;
                this.modalAddPekerjaan = true;
            })
        },
        showLokasi(item){
          this.dataLokasi = item
          this.datePicker = moment(`'${this.year}-${this.month}-01'`).toISOString()
          let body = {
            'pekerjaan_id' : this.pekerjaan.id,
            'periode'      : this.year+this.month,
            'tanggal'      : moment(this.datePicker).format('YYYY-MM-DD')
          }
          this.listDataPost({
              url: `/web/transaksi/data-lokasi-tanggal/${this.dataLokasi.lokasi_id}`,
              body: body,
          }).then((response) => {
              let { data } = response.data
              this.dataLokasiTanggal = data
              this.tab = 'tabel'
              this.modalUpdateLokasi = true;

          })
        },
        terapkanTanggalLokasi(){
          let body = {
            'pekerjaan_id' : this.pekerjaan.id,
            'periode'      : this.year+this.month,
            'tanggal'      : moment(this.datePicker).format('YYYY-MM-DD')
          }
          this.listDataPost({
              url: `/web/transaksi/data-lokasi-tanggal/${this.dataLokasi.lokasi_id}`,
              body: body,
          }).then((response) => {
              let { data } = response.data
              this.dataLokasiTanggal = data

          })
        },
        udpateTanggal(){
          let body = {
            'pekerjaan_id' : this.pekerjaan.id,
            'periode'      : this.year+this.month,
            'tanggal'      : moment(this.datePicker).format('YYYY-MM-DD'),
            'data'         : this.dataLokasiTanggal
          }
          this.updateData({
              url: `/web/transaksi/data-lokasi-tanggal/${this.dataLokasi.lokasi_id}`,
              body: body,
          }).then((response) => {
              console.log(response)
              toast.info(`Data ${this.dataLokasi.nama} Telah Diupdate`, {
                position: toast.POSITION.TOP_CENTER,
                closeButton : false,
                hideProgressBar: true
            });

          })
        },
        updateStatus(checked, item) {
          let body = {
            'pekerjaan_id' : item.pekerjaan_id,
            'periode'      : item.periode,
            'status'         : checked ? 'AKTIF' : 'TIDAK-AKTIF'
          }
          this.updateData({
              url: `/web/transaksi/data-lokasi/${item.lokasi_id}`,
              body: body,
          }).then((response) => {
              const { data } = response
              toast.info(data.message, {
                position: toast.POSITION.TOP_CENTER,
                closeButton : false,
                hideProgressBar: true
            });

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
                    <div class="mt-3 mx-n4 px-4 file-menu-sidebar-scroll" data-simplebar>
                        <ul class="list-unstyled file-manager-menu">
                            <li v-for="(item, index) in pekerjaans" :key="index">
                                <b-link role="button" v-b-toggle="`pekerjaan-${index}`" 
                                    @click="setPekerjaan(item)"  
                                  >
                                    <i class="ri-folder-2-line align-bottom me-2"></i>
                                    <span class="file-list-link">{{item.nama}}</span>
                                </b-link>
                                <b-collapse :id="`pekerjaan-${index}`">
                                <ul class="sub-menu list-unstyled">
                                    <li v-for="(sub, indexSub) in item.subs" :key="indexSub">
                                        <b-link 
                                          :class="sub.id === folderActiveId ? 'active' : ''"
                                          @click="setPekerjaan(sub)"
                                        >
                                          {{sub.nama}}
                                        </b-link>
                                    </li>
                                </ul>
                                </b-collapse>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
          <div class="file-manager-content w-100 p-3 py-0 border">
            <div class="mx-n3 pt-4 px-4 file-manager-content-scroll" data-simplebar>
              <div>
                <div v-if="pekerjaan && pekerjaan.nama" class="header-list-action">
                  <h5 class="flex-grow-1 fs-16 mb-0" id="filetype-title">
                    {{ pekerjaan.nama }}
                  </h5>
                  <div class="header-action">
                      <b-form-select
                          v-model="month"
                          :options="months"
                          value-field="id"
                          text-field="name"
                      >
                      </b-form-select>
                      <b-form-select
                          class="year-action"
                          v-model="year"
                          :options="years"
                      >
                      </b-form-select>
                      <button class="btn btn-danger btn-sm" @click="terapkan">TERAPKAN</button>
                  </div>
                </div>
                <div v-if="pekerjaan && pekerjaan.nama" class="table-responsive">
                  <div class="search-box mb-2">
                      <input v-model="search" type="text" autocomplete="off" class="form-control border-light" placeholder="cari lokasi pekerjaan..." />
                      <i class="ri-search-2-line search-icon"></i>
                  </div>
                  <table class="table align-middle table-nowrap mb-0">
                    <thead class="table-active">
                      <tr>
                        <th scope="col" class="text-center">No. Urut</th>
                        <th scope="col">Nama</th>
                        <th scope="col">Periode</th>
                        <th scope="col">Download</th>
                        <th scope="col">Upload</th>
                        <th scope="col">Status</th>
                        <th scope="col" class="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody id="file-list">
                      <tr v-for="(item, index) in dataTable" :key="index">
                        <td class="text-center">{{item.no_urut}}</td>
                        <td>{{item.nama}}</td>
                        <td>{{item.periode}}</td>
                        <td>{{item.download}}Mbps</td>
                        <td>{{item.upload}}Mbps</td>
                        <td>
                          <b-form-checkbox 
                                :checked="item.status === 'AKTIF' ? true : false" 
                                name="check-button" 
                                switch 
                                @change="
                                    updateStatus($event, item)
                                "
                        >
                          </b-form-checkbox>
                        </td>
                        <td class="text-center">
                          <button class="btn btn-sm btn-outline-primary" @click="showLokasi(item)">
                            <vue-feather type="edit" size="13"></vue-feather>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <ul id="pagination" class="pagination pagination-lg"></ul>
                  <b-row v-if="pekerjaan && pekerjaan.nama" class="align-items-center mt-2 g-3 text-center text-sm-start">
                    <b-col cols="sm">
                      <div class="text-muted">
                        Showing <span class="fw-semibold"> {{  from  }} to {{  to }} </span> of
                        <span class="fw-semibold">{{ total }}</span> Results
                      </div>
                    </b-col>
                    <b-col sm="auto">
                      <b-pagination
                        v-model="currentPage"
                        :total-rows="rows"
                        :per-page="perPage"
                        first-text="First"
                        prev-text="Prev"
                        next-text="Next"
                        last-text="Last"
                        class="d-inline-flex"
                        @input="listPekerjaanLokasi"
                      >
                      </b-pagination>
                    </b-col>
                  </b-row>
              </div>
            </div>
          </div>
        </div>
        <b-modal 
            v-model="modalUpdateLokasi" 
            hide-footer 
            :title="dataLokasi.nama" 
            title-class="exampleModalLabelFolder" 
            modal-class="zoomIn modal-lg" 
            centered
            header-class="p-3 bg-soft-success"
            no-close-on-backdrop
            no-close-on-esc
        >
          <div class="row mb-2">
            <div class="col-sm-12 d-flex align-items-center gap-1 mb-2">
              <flat-pickr v-model="datePicker" :config="config" class="form-control flatpickr-input"></flat-pickr>
              <button class="btn btn-danger" @click="terapkanTanggalLokasi">TERAPKAN</button>
            </div>
            <div class="row">
              <ul class="nav nav-tabs nav-justified mb-4">
                <li class="nav-item">
                  <a @click="tab = 'tabel'" class="nav-link" :class="tab === 'tabel' ? 'active' : ''">Tabel</a>
                </li>
                <li class="nav-item">
                  <a @click="tab = 'grafik'" class="nav-link" :class="tab === 'grafik' ? 'active' : ''">Grafik</a>
                </li>
              </ul>
              <div v-if="tab==='tabel'" class="row">
                <div class="col-sm-12 table-scroll">
                  <table class="table align-middle table-nowrap table-sm mb-0">
                      <thead class="table-active">
                        <tr>
                          <th scope="col" class="text-center">Jam</th>
                          <th scope="col" class="text-center">Download (Mbps)</th>
                          <th scope="col" class="text-center">Upload (Mbps)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(item, index) in dataLokasiTanggal" :key="index">
                          <td class="text-center">{{ index }}</td>
                          <td class="text-center">
                            <input v-model="item.download" class="form-control" @keypress="onlyNumber" />
                          </td>
                          <td>
                            <input v-model="item.upload" class="form-control" @keypress="onlyNumber" />
                          </td>
                        </tr>
                      </tbody>
                  </table>
                </div>
                <div class="col-sm-12">
                  <button class="btn btn-primary btn-block" @click="udpateTanggal">UPDATE DATA</button>
                </div>
              </div>
              <chart v-if="tab==='grafik'" :lokasi="dataLokasi" :tanggal="datePicker"/>
            </div>
          </div>
        </b-modal>
    </Layout>
</template>
<style lang="scss">
  .folder-custom {
    height: 185px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .header-list-action {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 5px;
    .header-action {
        display: flex;
        flex-direction: row;
        gap: 5px;
        .year-action {
            width: 135px;
        }
    }
  }
  .table-scroll {
    overflow-y: auto;
    height: 330px;
    margin-bottom: 10px;
  }
  .btn-block {
    width: 100%;
  }
  .nav {
    &.nav-tabs {
      .nav-item {
        a {
          cursor: pointer;
        }
      }
    }
  }
</style>
