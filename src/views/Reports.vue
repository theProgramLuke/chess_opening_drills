<template lang="pug">
  plot(:data="data", :layout="layout", :options="options")
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */
import Vue from "vue";
import { mapState } from "vuex";

import Plot from "@/components/Plot.vue";
import colors from "vuetify/lib/util/colors";

export default Vue.extend({
  data: () => {
    return {
      options: { displayModeBar: false }
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
    },

    layout() {
      return {
        paper_bgcolor: "#0000",
        plot_bgcolor: "#0000"
      };
    }
  },

  components: {
    Plot
  }
});
</script>
