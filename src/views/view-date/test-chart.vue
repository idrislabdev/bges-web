<template>
    <b-card no-body class="card-height-100">
        <b-card-header class="align-items-center d-flex">
            <b-card-title class="mb-0 flex-grow-1">Piutang Usaha</b-card-title>
        </b-card-header>
        <highcharts class="hc" :options="chartOptions" ref="chart"></highcharts>
    </b-card>
  </template>
  
  <script>
  import dat_json from './sample.json'
  export default {
    data() {
      return {
        chartOptions: {
            "chart": {
                "type": "area",
                "backgroundColor": "#f3f3f3",
                "plotBackgroundColor": "#fff"
            },
            "credits": {
                "enabled": false
            },
            "legend": {
                "enabled": false
            },
            "title": {
                "text": "Data Dinas kependudukan dan pencatatan sipil Bulan Januari",
                "x": -20
            },
            "subtitle": {
                "text": "<span style=\"color:#00CC33;\">Download</span><br><span style=\"color:#0000FF;\">Upload</span>",
                "x": -20
            },
            "xAxis": {
                "title": {
                    "text": "Periode Tanggal Bulan Januari"
                },
                "tickInterval": 1,
                "tickmarkPlacement": "on",
                "gridLineWidth": 1,
                "gridLineColor": "#bbbbbb",
                "gridLineDashStyle": "dash",
                "lineColor": "#000",
                "lineWidth": 1,
                "minorTickInterval": 0.5,
                "minorGridLineColor": "#dddddd",
                "minorGridLineDashStyle": "dash"
            },
            "yAxis": {
                "min": 1,
                "title": {
                    "text": "Download (Mbps)"
                },
                "minorTickInterval": 0.20,
                "minorGridLineColor": "#dddddd",
                "minorGridLineDashStyle": "dash",
                "gridLineColor": "#bbbbbb",
                "gridLineDashStyle": "dash",
                "lineColor": "#000",
                "lineWidth": 1
            },
            "plotOptions": {
                "area": {
                    "marker": {
                        "enabled": false
                    }
                }
            },
            "exporting": {
                "sourceWidth": 900
            },
            "series": [
                {
                    "linedWidth" : 0,
                    "color": "#00e600",
                    "type": "area",
                    "data": dat_json.downloads,
                    "step" : 1
                },
                {
                    "linedWidth" : 0.6,
                    "color": "#0000FF",
                    "type": "line",
                    "data": dat_json.uploads,
                    "step" : 1
                }
            ]
        }
      };
    }
  };
  </script>
  