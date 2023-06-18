<script>
import Layout from "@/src/layouts/main.vue";
import appConfig from "../../../app.config";

import "prismjs";
import "prismjs/themes/prism.css";
import { crudMethods, pageMethods } from "@/src/state/helpers";
import { debounce } from 'lodash'
import moment from 'moment';

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
        };
    },
    components: {
        Layout,
        
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
        listPekerjaanLokasi() {
          const periode = this.year+this.month;
          this.listData({
                url: `/web/transaksi/data-lokasi?periode=${periode}&pekerjaan_id=${this.pekerjaan.id}`,
            }).then((response) => {
                const { data } = response.data
                this.dataTable = data
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
                <div v-if="pekerjaan.nama" class="row mb-2">
                    <h5 class="mb-2 p-0">
                      {{ pekerjaan.nama }}
                    </h5>   
                </div>
                <div class="row">
                  <div v-for="(item, index) in dataTable" class="col-sm-3 list-dashboard" :key="index">
                    <div class="content-dashboard">
                      <h5>{{ item.nama }}</h5>
                      <div v-if="item.status === 'AKTIF'" class="green led"></div>
                      <div v-else class="red led"></div>

                    </div>
                  </div>
                </div>  
              </div>
            </div>
          </div>
        </div>
       
    </Layout>
</template>
<style lang="scss">
 .green {
    background-image: -webkit-linear-gradient(top, #13fB04 0%, #58e343 50%, #ADED99 100%);
}

.orange {
    background-image: -webkit-linear-gradient(top, #f9a004 0%, #e0ac45 50%, #ead698 100%);
}


.red {
    background-image: -webkit-linear-gradient(top, #fb1304 0%, #e35843 50%, #edad99 100%);
}


.led {
    border-radius: 5px;
    width: 10px;
    height: 10px;
    box-shadow: 0px 0px 3px black;
    margin: 5px;
    zoom: 3;
}

.led:after {
    display: block;            
    content: '';
    margin-left: 1px;
    margin-right: 1px;
    width: 8px;
    height: 6px;
    -webkit-border-top-right-radius: 4px 3px;
    -webkit-border-top-left-radius: 4px 3px;
    -webkit-border-bottom-right-radius: 4px 3px;
    -webkit-border-bottom-left-radius: 4px 3px;
    background-image: -webkit-linear-gradient(top, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%);
}
.list-dashboard {
  border: 1px solid #efefef;
  .content-dashboard {
    display: flex;
    align-items: center;
    justify-content: space-between;
    h5 {
      font-size: 14px;
    }
  }
}
</style>
