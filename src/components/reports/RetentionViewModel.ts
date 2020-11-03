import "reflect-metadata";
import { Vue, Component } from "vue-property-decorator";
import { State } from "vuex-class";
import _ from "lodash";
import { Config, Layout, PlotData } from "plotly.js";

import { TagTree } from "@/store/repertoire/TagTree";
import { Repertoire } from "@/store/repertoire/Repertoire";
import Plot from "@/components/common/Plot.vue";
import { RepetitionTraining } from "@/store/repertoire/RepetitionTraining";

@Component({ name: "RetentionReport", components: { Plot } })
export default class RetentionViewModel extends Vue {
  selectedTags: TagTree[] = [];
  options: Partial<Config> = { displayModeBar: false };
  layout: Partial<Layout> = {
    margin: { b: 125 },
    xaxis: {
      domain: [0, 0.8],
      showgrid: true,
      zeroline: false,
      title: { text: "Training Repetition Count" },
    },
    yaxis: {
      domain: [0, 0.8],
      showgrid: true,
      zeroline: false,
      rangemode: "nonnegative",
      title: { text: "Retention Rate" },
    },
    xaxis2: {
      domain: [0.85, 1],
      showgrid: false,
      zeroline: false,
    },
    yaxis2: {
      domain: [0.85, 1],
      showgrid: false,
      zeroline: false,
    },
  };

  @State
  whiteRepertoire!: Repertoire;

  @State
  blackRepertoire!: Repertoire;

  @State
  darkMode!: boolean;

  get showNoPositions(): boolean {
    return _.isEmpty(this.whiteTraining) && _.isEmpty(this.blackTraining);
  }

  get plotData(): Partial<PlotData>[] {
    const training = _.concat(this.whiteTraining, this.blackTraining);
    _.remove(training, moveTraining => _.isEmpty(moveTraining.history));

    const x = _.map(training, moveTraining => moveTraining.history.length);
    const y = _.map(
      training,
      moveTraining =>
        this.countTrainingSuccesses(moveTraining) / moveTraining.history.length
    );

    return [
      {
        x,
        y,
        mode: "markers",
        name: "Positions",
        type: "scatter",
      },
      {
        x,
        yaxis: "y2",
        type: "histogram",
        showlegend: false,
      },
      {
        y,
        xaxis: "x2",
        type: "histogram",
        showlegend: false,
      },
    ];
  }

  private get blackTraining(): RepetitionTraining[] {
    return this.blackRepertoire.getTrainingForTags([this.blackRepertoire.tags]);
  }

  private get whiteTraining(): RepetitionTraining[] {
    return this.whiteRepertoire.getTrainingForTags([this.whiteRepertoire.tags]);
  }

  private countTrainingSuccesses(moveTraining: RepetitionTraining) {
    return _.filter(
      moveTraining.history,
      historyEvent => historyEvent.attemptedMoves.length === 1
    ).length;
  }
}
