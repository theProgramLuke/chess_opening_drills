import "reflect-metadata";
import { Vue, Component } from "vue-property-decorator";
import { State } from "vuex-class";
import _ from "lodash";
import { Layout, Config, PlotData } from "plotly.js";

import Plot from "@/components/common/Plot.vue";
import { Repertoire } from "@/store/repertoire/Repertoire";
import { TrainingMoveSpecification } from "@/store/repertoire/TrainingCollection";

function easinessFromRepertoire(repertoire: Repertoire): number[] {
  const easiness: number[] = [];

  _.forEach(
    repertoire.training.getMoves(),
    (trainingMove: TrainingMoveSpecification) => {
      const training = repertoire.training.getTrainingForMove(
        trainingMove.fen,
        trainingMove.san
      );

      if (!_.isUndefined(training)) {
        easiness.push(training.easiness);
      }
    }
  );

  return easiness;
}

@Component({ name: "DifficultyReport", components: { Plot } })
export default class DifficultyViewModel extends Vue {
  options: Partial<Config> = { displayModeBar: false };
  layout: Partial<Layout> = {
    yaxis: {
      rangemode: "tozero",
      title: { text: "Position Count" }
    },
    xaxis: {
      title: { text: "Difficulty" }
    },
    margin: { b: 125 },
    barmode: "stack"
  };

  @State
  darkMode!: boolean;

  @State
  whiteRepertoire!: Repertoire;

  @State
  blackRepertoire!: Repertoire;

  get whiteEasiness(): number[] {
    return easinessFromRepertoire(this.whiteRepertoire);
  }

  get blackEasiness(): number[] {
    return easinessFromRepertoire(this.blackRepertoire);
  }

  get showNoPositions(): boolean {
    return _.isEmpty(this.whiteEasiness) && _.isEmpty(this.blackEasiness);
  }

  get plotData(): Partial<PlotData>[] {
    const common: Partial<PlotData> = {
      xbins: { start: 0, end: 15, size: 15 },
      type: "histogram"
    };
    return [
      {
        ...common,
        name: "Black Positions",
        x: this.blackEasiness
      },
      {
        ...common,
        name: "White Positions",
        x: this.whiteEasiness
      }
    ];
  }
}
