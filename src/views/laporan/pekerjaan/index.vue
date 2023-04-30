<script>
import Layout from "@/src/layouts/main.vue";
import appConfig from "../../../../app.config";

import "prismjs";
import "prismjs/themes/prism.css";
import { crudMethods, pageMethods } from "@/src/state/helpers";

import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { debounce } from 'lodash'


import Swal from "sweetalert2";

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
            month : ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"],
            totalMonths: 0,
            date: new Date()
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
    },
    mounted() {
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
                url: `/web/master/dinas/${this.$route.params.route_dinas_id}/pekerjaan`,
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
        listPekerjaanLokasi() {
          this.listData({
                url: `/web/master/dinas/${this.$route.params.route_dinas_id}/pekerjaan/${this.pkIdPekerjaan}/lokasi?page=${this.currentPage}&q=${this.search}`,
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
        padWithLeadingZeros(num, totalLength) {
            return String(num).padStart(totalLength, '0');
        },
        downloadLaporan(month, year) {
            console.log(this.pekerjaan.nama)
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
            })
        },
        listPekerjaanSub(id) {
          this.folderActiveId = id
          this.pkIdPekerjaan = id
          this.listData({
                url: `/web/master/dinas/${this.$route.params.route_dinas_id}/pekerjaan/${id}/lokasi?page=${this.currentPage}&q=${this.search}`,
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
        storePekerjaan() {
            let body = {
                nama: this.nama,
                deskripsi: this.deskripsi,
                no_urut: this.noUrut,
                dinas_id: this.$route.params.route_dinas_id
            }

            if (this.parentId !== null)
              body.parent_id = this.parentId; 

            let url = `/web/master/dinas/${this.$route.params.route_dinas_id}/pekerjaan`

            if (this.typeCrud === 'updateData') {
                url = `${url}/${this.pkIdPekerjaan}`
            } 
            this[this.typeCrud]({ url: url, body: body })
            .then((response) => {
            const { data } = response
            if (data) {
                this.modalAddPekerjaan = false
                this.getPekerjaans();
                this.clearAddPekerjaan();
                let content = ''
                if (this.typeCrud === 'insertData') {
                    content = 'Pekerjaan berhasil disimpan'
                } else {
                    content = 'Pekerjaan berhasil diperbaharui'
                }
                toast.info(content, {
                    position: toast.POSITION.TOP_CENTER,
                    theme: toast.auto,
                    closeButton : false,
                    hideProgressBar: true
                });
            }
            })
            .catch((err) => {
                console.log(err)
                if (err.response.status === 403) {
                    // this.errorMessage = JSON.parse(
                    //   err.response.request.response
                    // ).message;
                } else if (err.response.status === 422) {
                    this.errors = err.response.data.errors
                }
            })
        },
        storeLokasi() {
            let body = {
                nama              : this.namaLokasi,
                no_urut           : this.noUrutLokasi,
                download          : this.download,
                upload            : this.upload,
                min_download      : this.minDownload,
                min_upload        : this.minUpload,
                alamat_ip         : this.alamatIp,
                nomor_pemasangan  : this.nomorPemasangan,
                alamat_pemasangan : this.alamatPemasangan,
                keterangan        : this.keterangan,
                latitude          : this.latitude,
                longitude         : this.longitude
            }

            let url = `/web/master/dinas/${this.$route.params.route_dinas_id}/pekerjaan/${this.pkIdPekerjaan}/lokasi`
            let typeCrud = 'insertData'

            if (this.pkIdLokasi !== null) {
                typeCrud = 'updateData'
                url = `${url}/${this.pkIdLokasi}`
            } 
            this[typeCrud]({ url: url, body: body })
            .then((response) => {
            const { data } = response
            if (data) {
                this.modalAddTitikLokasi = false
                this.listPekerjaanLokasi();
                // this.clearAddPekerjaan();
                let content = ''
                if (typeCrud === 'insertData') {
                    content = 'Lokasi berhasil disimpan'
                } else {
                    content = 'Lokasi berhasil diperbaharui'
                }
                toast.info(content, {
                    position: toast.POSITION.TOP_CENTER,
                    theme: toast.auto,
                    closeButton : false,
                    hideProgressBar: true
                });
            }
            })
            .catch((err) => {
                console.log(err)
                if (err.response.status === 403) {
                    // this.errorMessage = JSON.parse(
                    //   err.response.request.response
                    // ).message;
                } else if (err.response.status === 422) {
                    this.errors = err.response.data.errors
                }
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
        destroy() {
          Swal.fire({
            title: "Apakah anda yakin?",
            text: "Data Pekerjaan Akan Dihapus Dari Sistem!",
            icon: "warning",
            showCancelButton: true,
            cancelButtonColor: "#f46a6a",
            cancelButtonText: 'Batal',
            confirmButtonColor: "#34c38f",
            confirmButtonText: "Ya, Hapus Saja!",
          }).then((result) => {
            if (result.value) {
              let url = `${this.apiUrl}/${this.pkIdPekerjaan}`;
              this.deleteData({
                  url: url,
              })
              .then((response) => {
                  console.log(response)
                  this.modalDelete = false
                  this.getPekerjaans()
                  
                  toast.info(this.title + ' berhasil dihapus', {
                      position: toast.POSITION.TOP_CENTER,
                      theme: toast.auto,
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
              // Swal.fire("Deleted!", "Your file has been deleted.", "success");
            }
          });
        },
        showDestroy(data) {
            this.pkId = data.id
            this.nama = data.nama
            this.modalDelete = true
        },
        showModalPekerjaan(from) {
          if (from === null) {
            this.typeCrud = 'insertData'
            this.parentId =  this.pekerjaan.id 
          } else {
            this.parentId = null
          }
          this.modalAddPekerjaan = true;
        },
        clearAddPekerjaan() {
          this.nama = '';
          this.deskripsi = '';
          this.noUrut = '';
          this.pkIdPekerjaan = null
          this.parentId = null
        },
        onContextMenuPekerjaan(e) {
          e.preventDefault();
          this.pkIdPekerjaan = null;
          this.optionsComponent.x = e.x;
          this.optionsComponent.y = e.y;
          this.menuAddPekerjaan = true;
        },
        onContextMenu(e, id, parentId) {
          this.parentId = parentId;
          this.pkIdPekerjaan = id;
          e.preventDefault();
          e.stopPropagation();
          //Set the mouse position
          this.optionsComponent.x = e.x;
          this.optionsComponent.y = e.y;
          //Show menu
          this.menuPekerjaan = true;
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
                      <div class="flex-grow-1">
                        <h5 class="fs-16 mb-0">Pekerjaan {{ pekerjaan.nama }}</h5>
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
                            class="fs-15 folder-name stretched-link d-flex flex-column" 
                            @click="downloadLaporan(i, date.getFullYear())"
                          >
                              <span>Laporan</span>
                              <spann>Bulan {{ month[i-1]  }} {{ date.getFullYear() }}</spann>
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
        <b-modal 
            v-model="modalAddPekerjaan" 
            hide-footer title="Tambah Pekerjaan" 
            title-class="exampleModalLabelFolder" 
            class="v-modal-custom" 
            modal-class="zoomIn" 
            centered
            header-class="p-3 bg-soft-success"
            no-close-on-backdrop
            no-close-on-esc
        >
            <b-form autocomplete="off" class="needs-validation createfolder-form" id="createfolder-form" novalidate>
                <b-row class="gy-4 mb-2">
                    <b-col xxl="12">
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
                    <b-col xxl="12">
                        <div>
                            <label for="deskripsi" class="form-label">Deskripsi</label>
                            <b-form-textarea
                                id="textarea"
                                v-model="deskripsi"
                                rows="3"
                                max-rows="3"
                                no-resize
                            ></b-form-textarea>
                            <span v-if="errors.deskripsi" class="text-required">
                                {{ errors.deskripsi.toString() }}
                            </span>
                        </div>
                    </b-col>
                </b-row>
                <b-row class="gy-4 mb-2">
                    <b-col xxl="12">
                        <div>
                            <label for="noUrut" class="form-label">No. Urut</label>
                            <input v-model="noUrut" type="text" class="form-control" id="deskripsi">
                            <span v-if="errors.no_urut" class="text-required">
                                {{ errors.no_urut.toString() }}
                            </span>
                        </div>
                    </b-col>
                </b-row>
                <div class="hstack gap-2 justify-content-end mt-3">
                    <b-button type="button" variant="ghost-danger" data-bs-dismiss="modal" id="addFolderBtn-close" @click="modalAddPekerjaan = false">
                        <i class="ri-close-line align-bottom"></i> Tutup
                    </b-button>
                    <b-button type="button" variant="primary" id="createfolder-btn" @click="storePekerjaan">
                        Simpan Data
                    </b-button>
                </div>
            </b-form>request-
        </b-modal>
        <b-modal 
            v-model="modalAddTitikLokasi" 
            hide-footer title="Tambah Lokasi" 
            title-class="exampleModalLabelFolder" 
            class="v-modal-custom v-modal-custom__2" 
            modal-class="zoomIn" 
            centered
            header-class="p-3 bg-soft-success"
            no-close-on-backdrop
            no-close-on-esc
        >
            <b-form autocomplete="off" class="needs-validation createfolder-form" id="createfolder-form" novalidate>
                <b-row class="gy-4 mb-2">
                    <b-col xxl="6">
                        <div>
                            <label for="nama" class="form-label">Nama</label>
                            <input v-model="namaLokasi" type="text" class="form-control" id="nama">
                            <span v-if="errors.nama" class="text-required">
                                {{ errors.nama.toString() }}
                            </span>
                        </div>
                    </b-col>
                    <b-col xxl="6">
                        <div>
                            <label for="no_urut" class="form-label">No. Urut</label>
                            <input v-model="noUrutLokasi" type="text" class="form-control" id="no_urut">
                            <span v-if="errors.no_urut" class="text-required">
                                {{ errors.no_urut.toString() }}
                            </span>
                        </div>
                    </b-col>
                </b-row>
                <b-row class="gy-4 mb-2">
                    <b-col xxl="6">
                        <div>
                            <label for="download" class="form-label">Download</label>
                            <input v-model="download" type="text" class="form-control" id="download">
                            <span v-if="errors.download" class="text-required">
                                {{ errors.download.toString() }}
                            </span>
                        </div>
                    </b-col>
                    <b-col xxl="6">
                        <div>
                            <label for="min_download" class="form-label">Min Download</label>
                            <input v-model="minDownload" type="text" class="form-control" id="min_download">
                            <span v-if="errors.min_download" class="text-required">
                                {{ errors.min_download.toString() }}
                            </span>
                        </div>
                    </b-col>
                </b-row>
                <b-row class="gy-4 mb-2">
                    <b-col xxl="6">
                        <div>
                            <label for="upload" class="form-label">Upload</label>
                            <input v-model="upload" type="text" class="form-control" id="upload">
                            <span v-if="errors.upload" class="text-required">
                                {{ errors.upload.toString() }}
                            </span>
                        </div>
                    </b-col>
                    <b-col xxl="6">
                        <div>
                            <label for="min_upload" class="form-label">Min Upload</label>
                            <input v-model="minUpload" type="text" class="form-control" id="min_upload">
                            <span v-if="errors.min_upload" class="text-required">
                                {{ errors.min_upload.toString() }}
                            </span>
                        </div>
                    </b-col>
                </b-row>
                <b-row class="gy-4 mb-2">
                    <b-col xxl="6">
                        <div>
                            <label for="alamat_ip" class="form-label">Alamat IP</label>
                            <input v-model="alamatIp" type="text" class="form-control" id="alamat_ip">
                            <span v-if="errors.alamat_ip" class="text-required">
                                {{ errors.alamat_ip.toString() }}
                            </span>
                        </div>
                    </b-col>
                    <b-col xxl="6">
                        <div>
                            <label for="nomor_pemasangan" class="form-label">Nomor Pemasangan</label>
                            <input v-model="nomorPemasangan" type="text" class="form-control" id="nomor_pemasangan">
                            <span v-if="errors.nomor_pemasangan" class="text-required">
                                {{ errors.nomor_pemasangan.toString() }}
                            </span>
                        </div>
                    </b-col>
                </b-row>
                <b-row class="gy-4 mb-2">
                    <b-col xxl="6">
                        <div>
                            <label for="alamat_pemasangan" class="form-label">Alamat Pemasangan</label>
                            <input v-model="alamatPemasangan" type="text" class="form-control" id="alamat_pemasangan">
                            <span v-if="errors.alamat_pemasangan" class="text-required">
                                {{ errors.alamat_pemasangan.toString() }}
                            </span>
                        </div>
                    </b-col>
                    <b-col xxl="6">
                        <div>
                            <label for="keterangan" class="form-label">Keterangan</label>
                            <input v-model="keterangan" type="text" class="form-control" id="keterangan">
                            <span v-if="errors.keterangan" class="text-required">
                                {{ errors.keterangan.toString() }}
                            </span>
                        </div>
                    </b-col>
                </b-row>
                <b-row class="gy-4 mb-2">
                  <b-col xxl="6">
                        <div>
                            <label for="latitude" class="form-label">Latitude</label>
                            <input v-model="latitude" type="text" class="form-control" id="latitude">
                            <span v-if="errors.latitude" class="text-required">
                                {{ errors.latitude.toString() }}
                            </span>
                        </div>
                    </b-col>
                  <b-col xxl="6">
                      <div>
                          <label for="longitude" class="form-label">Longitude</label>
                          <input v-model="longitude" type="text" class="form-control" id="longitude">
                          <span v-if="errors.longitude" class="text-required">
                              {{ errors.longitude.toString() }}
                          </span>
                      </div>
                  </b-col>
                </b-row>
                <div class="hstack gap-2 justify-content-end mt-3">
                    <b-button type="button" variant="ghost-danger" data-bs-dismiss="modal" id="addFolderBtn-close" @click="modalAddTitikLokasi = false">
                        <i class="ri-close-line align-bottom"></i> Tutup
                    </b-button>
                    <b-button type="button" variant="primary" id="createfolder-btn" @click="storeLokasi">
                        Simpan Data
                    </b-button>
                </div>
            </b-form>
        </b-modal>
    </Layout>
</template>
<style lang="scss">
  .file-custom {
    height: 185px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
</style>
