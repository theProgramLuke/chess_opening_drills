<template lang="pug">
  chessboard
</template>

<script lang="ts">
import Vue from "vue";
import chessboard from "@/components/chessboard.vue";
import { TrainingOptions } from "@/components/TrainingModeSelector.vue";

export default Vue.extend({
  data: () => ({}),

  components: {
    chessboard
  },

  props: {
    options: {
      type: Object as () => TrainingOptions,
      required: true
    }
  }
});
</script>
