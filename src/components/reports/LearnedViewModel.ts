import "reflect-metadata";
import { Vue, Component } from "vue-property-decorator";
import { State } from "vuex-class";
import _ from "lodash";
import { PlotData, Config, Layout } from "plotly.js";

import Plot from "@/components/common/Plot.vue";
import { Repertoire } from "@/store/repertoire/Repertoire";
import { TagTree } from "@/store/repertoire/TagTree";
import { TrainingMode } from "@/store/trainingMode";

@Component({ name: "LearnedReport", components: { Plot } })
export default class LearnedViewModel extends Vue {
  options: Partial<Config> = { displayModeBar: false };
  layout: Partial<Layout> = { margin: { b: 125 } };
  selectedTags: TagTree[] = [];

  @State
  whiteRepertoire!: Repertoire;

  @State
  blackRepertoire!: Repertoire;

  @State
  darkMode!: boolean;

  get combinedTags(): TagTree[] {
    return [this.whiteRepertoire.tags, this.blackRepertoire.tags];
  }

  get showNoPositions(): boolean {
    return (
      _.isEmpty(this.whiteRepertoire.training.getMoves()) &&
      _.isEmpty(this.blackRepertoire.training.getMoves())
    );
  }

  get plotData(): Partial<PlotData>[] {
    let learnedTrainingCount = 0;
    let newTrainingCount = 0;

    const repertoires = [this.whiteRepertoire, this.blackRepertoire];

    _.forEach(repertoires, repertoire => {
      const filteredTraining = repertoire.getTrainingForTags(this.selectedTags);

      _.forEach(filteredTraining, training => {
        if (training.includeForTrainingMode(TrainingMode.New)) {
          ++newTrainingCount;
        } else {
          ++learnedTrainingCount;
        }
      });
    });

    return [
      {
        type: "pie",
        hole: 0.7,
        labels: ["Learned", "New"],
        values: [learnedTrainingCount, newTrainingCount]
      }
    ];
  }
}
