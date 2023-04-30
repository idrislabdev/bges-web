<script>
import { authComputed, layoutComputed } from "@state/helpers";

import TwoColumns from "./twocolumn";

export default {
  components: {
    TwoColumns
  },
  data() {
    return {
      dinases: null
    };
  },
  computed: {
    ...layoutComputed,
    ...authComputed,
  },
  mounted() {
    // document.querySelector("html").setAttribute('dir', 'rtl');
    this.dinases = this.currentUser.dinases
    console.log(this.dinases)
  },
};
</script>

<template>
   <TwoColumns v-if="dinases !== null" :layout="layoutType" :dinases="dinases">
      <slot />
  </TwoColumns>
</template>
