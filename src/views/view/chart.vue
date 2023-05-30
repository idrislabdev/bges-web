<template>
    <highcharts class="hc" :options="chartOptions" ref="chart"></highcharts>
  </template>
  
  <script>
    import { crudMethods } from "@/src/state/helpers";

  export default {
    props: {
        lokasi: {
            type: Object,
            default: () => {
                return {};
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
                "periode": this.lokasi.periode
            }
            this.listDataPost({
                url: `/web/view/grafik-per-bulan/${this.lokasi.lokasi_id}`,
                body: body,
            }).then((response) => {
                this.chartOptions = response.data
            })
        },
    }
  };
  </script>
  