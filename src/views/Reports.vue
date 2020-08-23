<template lang="pug">
  plot(:data="data", :layout="layout", :options="options", :dark="darkMode")
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */
import Vue from "vue";
import { mapState } from "vuex";

import Plot from "@/components/Plot.vue";

export default Vue.extend({
  data: () => {
    return {
      options: {},
      layout: {}
    };
  },

  computed: {
    ...mapState(["darkMode"]),

    data() {
      return [
        {
          x: ["Zebras", "Lions", "Pelicans"],
          y: [90, 40, 60],
          type: "bar",
          name: "New York Zoo"
        }
      ];
    }
  },

  components: {
    Plot
  }
});
</script>
