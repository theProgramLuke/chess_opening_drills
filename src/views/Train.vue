<template lang="pug">
  v-container
    v-overlay(:value="selectionOverlay", :dark="darkMode")
      training-mode-selector(
        :whiteRepertoire="whiteRepertoire", 
        :blackRepertoire="blackRepertoire",
        @onStartTraining="startTraining")
</template>

<script lang="ts">
import Vue from "vue";
import { mapState } from "vuex";

import TrainingModeSelector, {
  TrainingOptions
} from "@/components/TrainingModeSelector.vue";

export default Vue.extend({
  data: () => ({
    selectionOverlay: true
  }),

  components: {
    TrainingModeSelector
  },

  computed: {
    ...mapState(["whiteRepertoire", "blackRepertoire", "darkMode"])
  },

  methods: {
    startTraining(options: TrainingOptions) {
      this.selectionOverlay = false;
    }
  }
});
</script>
