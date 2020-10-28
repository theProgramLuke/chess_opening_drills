import "reflect-metadata";
import { Vue, Component } from "vue-property-decorator";
import { State } from "vuex-class";
import _ from "lodash";
import { Layout, Config } from "plotly.js";

import Plot from "@/components/common/Plot.vue";
import { Repertoire } from "@/store/repertoire/Repertoire";

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
    return this.easinessFromRepertoire(this.whiteRepertoire);
  }

  get blackEasiness(): number[] {
    return this.easinessFromRepertoire(this.blackRepertoire);
  }

  get showNoPositions(): boolean {
    return _.isEmpty(this.whiteEasiness) && _.isEmpty(this.blackEasiness);
  }

  get plotData() {
    const common = {
      xbins: { start: 0, end: 15 },
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

  private easinessFromRepertoire(repertoire: Repertoire): number[] {
    return _.map(
      repertoire.getTrainingForTags([repertoire.tags]),
      training => training.easiness
    );
  }
}
