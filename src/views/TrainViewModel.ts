import Vue from "vue";
import { mapState } from "vuex";

import TrainingModeSelector from "@/components/train/TrainingModeSelector.vue";
import { TrainingOptions } from "@/components/train/TrainingModeSelectorViewModel";
import Trainer from "@/components/train/Trainer.vue";

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
