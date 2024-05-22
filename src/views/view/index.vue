<script>
import Layout from "@/src/layouts/main.vue";
import appConfig from "../../../app.config";

import "prismjs";
import "prismjs/themes/prism.css";
import { crudMethods, pageMethods } from "@/src/state/helpers";

import 'vue3-toastify/dist/index.css';
import Chart from './chart.vue'

import InfiniteLoading from "v3-infinite-loading";
import "v3-infinite-loading/lib/style.css";
import moment from 'moment'

export default {
    page: {
        title: "Pekerjaan",
        meta: [{ name: "View Pekerjaan MRTG", content: appConfig.description }],
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
            title: "View Pekerjaan",
            items: [
                {
                    text: "Master",
                    href: "/",
                },
                {
                    text: "View Pekerjaan",
                    active: true,
                },
            ],
            baseURL: process.env.VUE_APP_API_ENDPOINT,
            apiUrl: '/web/master/pekerjaan',
            routes: '/master/pekerjaan',
            isTypingSearch: true,
            modalDelete: false,
            dataTable: [],
            pekerjaans: [],
            lokasies: [],
            pekerjaan: {},
            modalLoading: false,
            downloadLoading: false,
            typeCrud: 'insertData',
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
        };
    },
    components: {
        Layout,
        Chart,
        InfiniteLoading
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
        pekerjaan: {
            handler: function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    this.page = 1;
                    this.lokasies = [];
                    this.infiniteId += 1;     
                }
            }
        },
        lokasies: {
            handler: function (newVal,) {
                newVal.forEach(element => {
                    console.log(element)
                });
            }
        }
    },
    mounted() {
        // this.modalLoading = true
        this.getPekerjaans()
        for (var i = this.year; i >= 2023; i--) {
            this.years.push(i)
        }
    },
    methods: {
        ...crudMethods,
        ...pageMethods,
        terapkan() {
            this.page = 1;
            this.lokasies = []
            this.infiniteId += 1;     
        },
        getPekerjaans() {
            this.listData({
                url: `/web/master/dinas/${this.$route.params.route_dinas_id}/pekerjaan?status=active`,
            }).then((response) => {
                const { data } = response.data
                this.pekerjaans = data

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
        getLokasi($state) {
            setTimeout(() => {
                let body = {
                    "pekerjaan_id": this.pekerjaan.id,
                    "periode": this.year+this.month
                }
                this.listDataPost({
                    url: `/web/view/grafik-per-bulan?page=${this.page++}`,
                    body: body,
                }).then((response) => {
                    let { data } = response.data.data
                    console.log(data)
                    if (data.length > 0) {
                        data.forEach((item) => this.lokasies.push(item));
                        $state.loaded();
                    } else {
                        $state.complete();
                        // this.loading = false;
                    }
                })
            }, 100);
            
        },
    }
};
</script>

<template>
    <Layout>
        <div class="chat-wrapper d-lg-flex gap-1 mx-n4 mt-n4 p-1">
            <div class="file-manager-sidebar border">
                <div class="p-3 d-flex flex-column h-100">
                    <div class="mt-3 mx-n4 px-4 file-menu-sidebar-scroll-2" data-simplebar>
                        <ul class="list-unstyled file-manager-menu">
                            <li v-for="(item, index) in pekerjaans" :key="index">
                                <b-link role="button" :class="item.id === pekerjaan.id ? 'active' : ''"
                                    @click="setPekerjaan(item)">
                                    <i class="ri-folder-2-line align-bottom me-2"></i>
                                    <span class="file-list-link">{{ item.nama }}</span>
                                </b-link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="file-manager-content w-100 p-3 py-0 border">
                <div class="mx-n3 pt-4 px-4 file-manager-content-scroll">
                    <div id="folder-list" class="mb-2">
                        <b-row v-if="pekerjaan.nama" class="justify-content-beetwen g-2 mb-3 align-items-center">
                            <b-col cols="12">
                                <div class="header-list">
                                    <h5 class="fs-16 mb-0">Pekerjaan {{ pekerjaan.nama }}</h5>
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
                            </b-col>
                        </b-row>

                        <b-row>
                            <b-col v-for="(item, index) in lokasies" :key="index" cols="12" class="chart-section">
                                <div class="chart-wrap">
                                    <h6>{{ item.no_urut }}. {{ item.nama }}</h6>
                                    <b-row>
                                        <b-col cols="12" >
                                            <chart :lokasi="item" />
                                        </b-col>
                                    </b-row>
                                </div>
                            </b-col>
                            <infinite-loading
                            spinner="spiral"
                            :identifier="infiniteId"
                            @infinite="getLokasi"
                        >
                        </infinite-loading>
                        </b-row>
                    </div>
                </div>
            </div>
        </div>
        <b-modal v-model="modalLoading" title-class="text-center" centered no-close-on-backdrop no-close-on-esc hide-header
            hide-footer class="v-modal-custom">
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
<style lang="scss" scoped>
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
.chart-section {
    margin-bottom: 20px;
    .chart-wrap {
        border: 1px solid #878a99;
        padding: 10px;

    }
}

.file-manager-content-scroll{
    overflow-y: auto;
    .simplebar-content{
        height: 100%;
    }
}
.header-list {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    .header-action {
        display: flex;
        flex-direction: row;
        gap: 5px;
        .year-action {
            width: 135px;
        }
    }
}
</style>
