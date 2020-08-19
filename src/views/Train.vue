<template lang="pug">
  v-container
    v-overlay(:value="selectionOverlay")
      training-mode-selector(
        :whiteRepertoire="whiteRepertoire", 
        :blackRepertoire="blackRepertoire")
</template>

<script lang="ts">
import Vue from "vue";
import { mapState } from "vuex";

import TrainingModeSelector from "@/components/TrainingModeSelector.vue";

export default Vue.extend({
  data: () => ({
    selectionOverlay: true
  }),

  components: {
    TrainingModeSelector
  },

  computed: {
    ...mapState(["whiteRepertoire", "blackRepertoire"])
  }
});
</script>
