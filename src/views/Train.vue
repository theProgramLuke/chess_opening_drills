<template lang="pug">
  v-container
    training-mode-selector(
      v-if="isSelecting"
      :whiteRepertoire="whiteRepertoire", 
      :blackRepertoire="blackRepertoire",
      @onStartTraining="startTraining")
    
    trainer(
      v-if="isTraining",
      :options="trainingOptions",
      @onCompleted="onCompleted")

    v-overlay(v-model="isComplete", :darkMode="darkMode")
      v-card.pa-4(min-width="550px")
        v-card-title Training Complete!
        v-card-actions
          v-btn(@click="reset", color="success") Train different positions
</template>

<script lang="ts">
import Vue from "vue";
import { mapState } from "vuex";

import TrainingModeSelector, {
  TrainingOptions
} from "@/components/TrainingModeSelector.vue";
import Trainer from "@/components/Trainer.vue";

enum TrainingState {
  Selecting,
  Training,
  Complete
}

export default Vue.extend({
  data: () => ({
    state: TrainingState.Selecting,
    trainingOptions: {}
  }),

  components: {
    TrainingModeSelector,
    Trainer
  },

  computed: {
    ...mapState(["whiteRepertoire", "blackRepertoire", "darkMode"]),

    isSelecting(): boolean {
      return this.state === TrainingState.Selecting;
    },

    isTraining(): boolean {
      return this.state === TrainingState.Training;
    },

    isComplete(): boolean {
      return this.state === TrainingState.Complete;
    }
  },

  methods: {
    startTraining(options: TrainingOptions) {
      this.state = TrainingState.Training;
      this.trainingOptions = options;
    },

    onCompleted() {
      this.state = TrainingState.Complete;
    },

    reset() {
      this.state = TrainingState.Selecting;
    }
  }
});
</script>
