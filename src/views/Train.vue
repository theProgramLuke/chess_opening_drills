<template lang="pug">
  v-container
    v-overlay(:value="selectionOverlay", :dark="darkMode")
      training-mode-selector(
        :whiteRepertoire="whiteRepertoire", 
        :blackRepertoire="blackRepertoire",
        @onStartTraining="startTraining")
    
    trainer(v-if="!selectionOverlay", :options="trainingOptions")
</template>

<script lang="ts">
import Vue from "vue";
import { mapState } from "vuex";

import TrainingModeSelector, {
  TrainingOptions
} from "@/components/TrainingModeSelector.vue";
import Trainer from "@/components/Trainer.vue";

export default Vue.extend({
  data: () => ({
    selectionOverlay: true,
    trainingOptions: {}
  }),

  components: {
    TrainingModeSelector,
    Trainer
  },

  computed: {
    ...mapState(["whiteRepertoire", "blackRepertoire", "darkMode"])
  },

  methods: {
    startTraining(options: TrainingOptions) {
      this.selectionOverlay = false;
      this.trainingOptions = options;
    }
  }
});
</script>
