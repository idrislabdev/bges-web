<script>
import Layout from "@/src/layouts/main.vue";
import appConfig from "../../../../app.config";

import "prismjs";
import "prismjs/themes/prism.css";
import { crudMethods, pageMethods } from "@/src/state/helpers";

import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { debounce } from 'lodash'

import { ContextMenu, ContextMenuItem } from '@imengyu/vue3-context-menu';

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
        };
    },
    components: {
        Layout,
        ContextMenu,
        ContextMenuItem,
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
                this.getList()
                this.isTypingSearch = true
            }
        },
        currentPage: {
          handler: function() {
            this.listPekerjaanLokasi()
          }
        }
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
          this.pkIdPekerjaan = item.id;

          this.listPekerjaanLokasi();
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
            <div class="file-manager-sidebar border" @contextmenu="onContextMenuPekerjaan($event)">
                <div class="p-3 d-flex flex-column h-100">
                    <!-- <div class="mb-3">
                        <h5 class="mb-0 fw-semibold">Pekerjaan {{ pekerjaan.nama }}</h5>
                    </div> -->
                    <!-- <div class="search-box">
                        <input type="text" class="form-control bg-light border-light" placeholder="Search here..." />
                        <i class="ri-search-2-line search-icon"></i>
                    </div> -->
                    <div class="mt-3 mx-n4 px-4 file-menu-sidebar-scroll" data-simplebar>
                        <ul class="list-unstyled file-manager-menu">
                            <li v-for="(item, index) in pekerjaans" :key="index">
                                <b-link role="button" v-b-toggle="`pekerjaan-${index}`" 
                                    @contextmenu="onContextMenu($event, item.id, null)"
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
                                          @contextmenu="onContextMenu($event, sub.id, item.id)"
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
                        <h5 class="fs-16 mb-0">Sub Pekerjaan {{ pekerjaan.nama }}</h5>
                      </div>
                    </div>
                  </b-col>

                  <b-col v-if="pekerjaan.parent_id === null" cols="auto">
                    <div class="d-flex gap-2 align-items-start mb-2">
                      <b-button 
                        variant="primary" 
                        class="create-folder-modal text-nowrap flex-shrink-0"
                        @click="showModalPekerjaan(null)"
                      >
                        <i class="ri-add-line align-bottom me-1"></i> Sub Pekerjaan
                      </b-button>
                    </div>
                  </b-col>

                </b-row>

                <b-row id="folderlist-data">
                  <b-col v-for="(folder, index) of this.pekerjaan.subs" :key="index" cols="6" xxl="2" class=" folder-card">
                    <b-card no-body class="bg-light shadow-none" :class="folder.id === folderActiveId ? 'border-primary' : ''" id="folder-1">
                      <b-card-body class="folder-custom">
                        <div class="text-center">
                          <div class="mb-2">
                            <i class="ri-folder-2-fill align-bottom text-warning display-5"></i>
                          </div>
                          <a 
                            href="javascript:void(0);" 
                            class="fs-15 folder-name stretched-link text-dark" 
                            @contextmenu="onContextMenu($event, folder.id, folder.parent_id)"
                            @click="listPekerjaanSub(folder.id)"
                          >
                              {{ folder.nama}} 
                          </a>
                        </div>
                        <!-- <div class="hstack mt-4 text-muted">
                          <span class="me-auto"><b>{{ folder.files }}</b> Total Lokasi</span>
                          <span><b>{{ folder.storage }}</b>GB</span>
                        </div> -->
                      </b-card-body>
                    </b-card>
                  </b-col>

                </b-row>

              </div>
              <div>
                <div v-if="pekerjaan.nama" class="d-flex align-items-center mb-3">
                  <h5 class="flex-grow-1 fs-16 mb-0" id="filetype-title">
                    Titik Lokasi
                  </h5>
                  <div class="flex-shrink-0">
                    <b-button 
                      variant="primary" 
                      class="create-folder-modal text-nowrap flex-shrink-0"
                      @click="modalAddTitikLokasi = true"
                    >
                      <i class="ri-add-line align-bottom me-1"></i> Titik Lokasi
                    </b-button>
                  </div>
                </div>
                <div v-if="pekerjaan.nama" class="table-responsive">
                  <table class="table align-middle table-nowrap mb-0">
                    <thead class="table-active">
                      <tr>
                        <th scope="col">No. Urut</th>
                        <th scope="col">Nama</th>
                        <th scope="col">Download</th>
                        <th scope="col">Upload</th>
                        <th scope="col">Min Download</th>
                        <th scope="col">Min Upload</th>
                        <th scope="col">Alamat IP</th>
                        <th scope="col" class="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody id="file-list">
                      <tr v-for="(item, index) in dataTable" :key="index">
                        <td>{{item.no_urut}}</td>
                        <td>{{item.nama}}</td>
                        <td>{{item.download}}Mbps</td>
                        <td>{{item.upload}}Mbps</td>
                        <td>{{item.min_download}}Mbps</td>
                        <td>{{item.min_upload}}Mbps</td>
                        <td>{{item.alamat_ip}}</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <ul id="pagination" class="pagination pagination-lg"></ul>
                  <b-row v-if="pekerjaan.nama" class="align-items-center mt-2 g-3 text-center text-sm-start">
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
            </b-form>
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
        <context-menu
          v-model:show="menuPekerjaan"
          :options="optionsComponent"
        >
          <context-menu-item v-if="parentId === null" label="Tambah Sub" @click="showModalPekerjaan(null)">
            <template #icon>
              <i class="ri-add-circle-line"></i>
            </template>
          </context-menu-item>
          <context-menu-sperator v-if="parentId === null"/>
          <context-menu-item label="Edit Pekerjaan" @click="showPekerjaan()">
            <template #icon>
              <i class="ri-edit-2-line"></i>
            </template>
          </context-menu-item>
          <context-menu-item label="Hapus Pekerjaan" icon="icon-reload-1" @click="destroy()">
            <template #icon>
              <i class="ri-delete-bin-line"></i>
            </template>
          </context-menu-item>
        </context-menu>
        <context-menu
          v-model:show="menuAddPekerjaan"
          :options="optionsComponent"
        >
          <context-menu-item label="Tambah Pekerjaan" @click="showModalPekerjaan('outside')">
            <template #icon>
              <i class="ri-add-circle-line"></i>
            </template>
          </context-menu-item>
        </context-menu>
    </Layout>
</template>
<style lang="scss">
  .folder-custom {
    height: 185px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
</style>
