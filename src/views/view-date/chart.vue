<template>
    <highcharts class="hc" :options="chartOptions" ref="chart"></highcharts>
  </template>
  
  <script>
    import { crudMethods } from "@/src/state/helpers";
    import moment from 'moment'
  export default {
    props: {
        lokasi: {
            type: Object,
            default: () => {
                return {};
            },
        },
        tanggal: {
            type: Date,
            default: () => {
                return new Date();
            },
        },
    },
    data() {
      return {
        chartOptions: {}
      };
    },
    mounted() {
        this.getGrafik()
    },
    methods: {
        ...crudMethods,
        getGrafik() {
            let body = {
                "pekerjaan_id": this.lokasi.pekerjaan_id,
                "periode": this.lokasi.periode,
                "tanggal": moment(this.tanggal).format('YYYY-MM-DD')
            }
            this.listDataPost({
                url: `/web/view/grafik-per-tanggal/${this.lokasi.lokasi_id}`,
                body: body,
            }).then((response) => {
                this.chartOptions = response.data
            })
        },
    }
  };
  </script>
  