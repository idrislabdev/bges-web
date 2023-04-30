<script>
import Layout from "../../layouts/main.vue";

export default {
  components: {
    Layout,
  },
  data() {
    return {
      title: "Dashboard",
      items: [
        {
          text: "Dashboards",
          href: "/",
        },
        {
          text: "Dashboard",
          active: true,
        },
      ],
    };
  },
  methods: {},
};
</script>

<template>
  <Layout>
    <b-row> </b-row>
  </Layout>
</template>