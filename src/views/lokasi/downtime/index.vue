<script>
import Layout from "@/src/layouts/main.vue";
import appConfig from "../../../../app.config";

import "prismjs";
import "prismjs/themes/prism.css";
import { crudMethods, pageMethods } from "@/src/state/helpers";

import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import moment from 'moment';
import { onlyNumber } from '@helpers/global-function'
// import { read, XLSX } from "xlsx";
const XLSX = require("xlsx")
export default {
    page: {
        title: "Laporan Downtime",
        meta: [{ name: "Data Downtime", content: appConfig.description }],
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
            title: "Data Downtime",
            baseURL: process.env.VUE_APP_API_ENDPOINT,
            apiUrl: '/web/lokasi/pekerjaan',
            routes: '/lokasi/pekerjaan',
            modalDelete: false,
            items: [],
            pekerjaans: [],
            pekerjaan: {},
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
            bulkData: [],
            modalImport: false,
            modalLoading: false,
            month: '01',
            months: [
                { id: '01', name: 'Januari' },
                { id: '02', name: 'Februari' },
                { id: '03', name: 'Maret' },
                { id: '04', name: 'April' },
                { id: '05', name: 'Mei' },
                { id: '06', name: 'Juni' },
                { id: '07', name: 'Juli' },
                { id: '08', name: 'Agustus' },
                { id: '09', name: 'September' },
                { id: '10', name: 'Oktober' },
                { id: '11', name: 'November' },
                { id: '12', name: 'Desember' },
                
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
    },
    computed: {},
    watch: {
        '$route.params.route_dinas_id': {
            handler: function () {
              this.getPekerjaans()
            }
        },
        year: {
            handler: function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    this.listDowntimes()
                }
            }
        }
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
        getPekerjaans() {
            this.listData({
                url: `/web/master/dinas/${this.$route.params.route_dinas_id}/pekerjaan?status=active`,
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
          this.listDowntimes();
        },
        showImport() {
          this.$refs.bulkupload.value = null
          this.bulkData = []
          this.modalImport = true;
        },
        listDowntimes() {
          this.listData({
                url: `/web/laporan/downtime?pekerjaan_id=${this.pekerjaan.id}&year=${this.year}`,
            }).then((response) => {
                const { data } = response.data
                this.items = data
            })
        },
        downloadTemplate() {
            const periode = this.year+this.month;
            this.downloadData({
                url: `/web/laporan/downtime/${this.pekerjaan.id}/${periode}/template`,
            }).then((response) => {
                const url = window.URL.createObjectURL(new Blob([response.data]))
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', `contoh template.xlsx`)
                document.body.appendChild(link)
                link.click()
            })
        },
        downloadPdf(periode) {
            this.modalLoading = true
            this.downloadData({
                url: `/web/laporan/downtime/${this.pekerjaan.id}/${periode}/pdf`,
            }).then((response) => {
                const url = window.URL.createObjectURL(new Blob([response.data]))
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', `downtime pekerjaan ${this.pekerjaan.nama} periode ${periode}.pdf`)
                document.body.appendChild(link)
                link.click()
                this.modalLoading = false
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
        async uploadBulk(event) {
          let src = event.target.files[0]
          var reader = new FileReader()
          reader.onload = () => {
            var fileData = reader.result
            var wb = XLSX.read(fileData, { type: 'binary' })
            wb.SheetNames.forEach((sheetName) => {
              var rowObj = XLSX.utils.sheet_to_json(wb.Sheets[sheetName])
              this.bulkData = JSON.stringify(rowObj)
            })
          }
          reader.readAsBinaryString(src)
          // this.$refs.bulkupload.value = null
        },
        simpanDowntime() {
          const periode = this.year+this.month;
          this.modalLoading = true;
          this.modalImport = false;
          let body = {
            "pekerjaan_id"  : this.pekerjaan.id,
            "periode"       : periode,
            "lokasies"      : this.bulkData.length ? JSON.parse(this.bulkData) : []
          }
          this.insertData({ url: `/web/laporan/downtime`, body: body })
            .then((response) => {
                const { data } = response
                if (data) {
                    let content = 'Data downtime berhasil disimpan'
                    toast.info(content, {
                        position: toast.POSITION.TOP_CENTER,
                        closeButton : false,
                        hideProgressBar: true
                    });
                    this.listDowntimes();
                }
                this.modalLoading = false;
            })
            .catch(() => {
              toast.error('Proses upload gagal, silahkan cek file anda', {
                  position: toast.POSITION.TOP_CENTER,
                  closeButton : false,
                  hideProgressBar: true
              });
              this.listDowntimes();    
              this.modalLoading = false;

            })
        }
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
                  <h5 class="fs-16 mb-0" id="filetype-title">
                    {{ pekerjaan.nama }}
                  </h5>
                  <div class="header-action">
                    <b-form-select
                        class="year-action"
                        v-model="year"
                        :options="years"
                    >
                    </b-form-select>
                    <button class="btn btn-primary btn-sm" @click="showImport">IMPORT</button>
                  </div>
                </div>
              </div>
              <b-row id="folderlist-data">
                <b-col v-for="(item, index) in items" :key="index" cols="6" xxl="2" class=" folder-card">
                    <b-card no-body class="bg-light shadow-none" id="folder-1">
                    <b-card-body class="file-custom">
                        <div class="text-center">
                        <div class="mb-2">
                            <i class="ri-file-text-line align-bottom text-warning display-5"></i>
                        </div>
                        <a 
                            href="javascript:void(0);" 
                            class="fs-15 folder-name stretched-link d-flex flex-column text-dark" 
                            @click="downloadPdf(item.periode)"
                        >
                            <span>Laporan</span>
                            <span>{{ item.nama }}</span>
                            <span>Periode {{ months.find((x) => x.id == item.periode.substr(item.periode.length-2)).name }} {{ year }}</span>
                        </a>
                        </div>
                    </b-card-body>
                    </b-card>
                </b-col>
              </b-row>
            </div>
          </div>          
        </div>
        <b-modal
            v-model="modalImport"
            title-class="text-center"
            centered
            no-close-on-backdrop
            no-close-on-esc
            hide-header
            hide-footer
            class="v-modal-custom"
        >
        <div class="row">
          <div class="col-sm-12">
            <div class="form-group">
              <label>Tahun : {{ year }}</label>
            </div>
          </div>
          <div class="col-sm-12 margin-bottom-10">
            <div class="form-group">
              <label>Bulan</label>
              <b-form-select
                    v-model="month"
                    :options="months"
                    value-field="id"
                    text-field="name"
                >
                </b-form-select>
            </div>
          </div>
          <div class="col-sm-12">
            <div class="form-group">
              <div class="d-flex gap-10"><label>File Target</label>
                <a href="javascript:void(0)" @click="downloadTemplate">Download Template</a>
              </div>
              <input
                id="file-input"
                ref="bulkupload"
                type="file"
                name="file-input"
                class="form-control"
                accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                @change="uploadBulk"
              />
            </div>
          </div>
        </div>
        <hr />
        <div class="d-flex gap-5 mt-2">
            <b-button class="width-50" type="button" variant="outline-primary" @click="modalImport = false">Batal</b-button>
            <b-button class="width-50" type="button" variant="primary" :disabled="bulkData.length === 0" @click="simpanDowntime">Proses</b-button>
        </div>
        </b-modal>
        <b-modal v-model="modalLoading" title-class="text-center" centered no-close-on-backdrop no-close-on-esc hide-header
          hide-footer class="v-modal-custom">
          <div class="d-flex flex-column justify-content-center align-items-center gap-2">
              <div>
                  <b-spinner style="width: 3rem; height: 3rem;"></b-spinner>
              </div>
              <div class="d-flex flex-column justify-content-center align-items-center gap-1">
                  <h5 class="mb-0">Harap Tunggu</h5>
                  <h6 class="mb-0">Data sedang dalam pemrosesan</h6>
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
        flex: 1;
        gap: 5px;
        justify-content: flex-end;
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
