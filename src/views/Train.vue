<template lang="pug">
  v-container
    v-overlay(:value="selectionOverlay")
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
    ...mapState(["whiteRepertoire", "blackRepertoire"])
  },

  methods: {
    startTraining(options: TrainingOptions) {
      console.log(options);
      this.selectionOverlay = false;
    }
  }
});
</script>
