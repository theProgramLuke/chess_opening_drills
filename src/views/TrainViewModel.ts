import "reflect-metadata";
import { Vue, Component } from "vue-property-decorator";
import { State } from "vuex-class";

import TrainingModeSelector from "@/components/train/TrainingModeSelector.vue";
import { TrainingOptions } from "@/components/train/TrainingOptions";
import Trainer from "@/components/train/Trainer.vue";
import { Repertoire } from "@/store/repertoire/Repertoire";

export enum TrainingState {
  Selecting,
  Training,
  Complete
}

@Component({ components: { TrainingModeSelector, Trainer } })
export default class TrainViewModel extends Vue {
  state: TrainingState = TrainingState.Selecting;
  trainingOptions?: TrainingOptions;

  @State
  whiteRepertoire!: Repertoire;

  @State
  blackRepertoire!: Repertoire;

  @State
  darkMode!: boolean;

  get isSelecting(): boolean {
    return this.state === TrainingState.Selecting;
  }

  get isTraining(): boolean {
    return this.state === TrainingState.Training;
  }

  get isComplete(): boolean {
    return this.state === TrainingState.Complete;
  }

  startTraining(options: TrainingOptions) {
    this.trainingOptions = options;
    this.state = TrainingState.Training;
  }

  onCompleted() {
    this.state = TrainingState.Complete;
  }

  reset() {
    this.state = TrainingState.Selecting;
  }
}
