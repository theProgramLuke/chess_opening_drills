import Vue from "vue";
import _ from "lodash";
import { mapState } from "vuex";

import Plot from "@/components/common/Plot.vue";
import { Repertoire } from "@/store/repertoire";
import { TrainingMode } from "@/store/trainingMode";

function easinessFromRepertoire(repertoire: Repertoire): number[] {
  const easiness: number[] = [];

  _.forEach(
    _.filter(
      repertoire.positions,
      position => !position.IncludeForTrainingMode(TrainingMode.New)
    ),
    position => {
      easiness.push(position.easinessFactor);
    }
  );

  return easiness;
}

export default Vue.extend({
  name: "DifficultyReport",

  data: () => ({
    options: { displayModeBar: false },
    layout: {
      yaxis: {
        rangemode: "tozero",
        title: { text: "Position Count" }
      },
      xaxis: {
        title: { text: "Difficulty" }
      },
      margin: { b: 125 },
      barmode: "stack"
    }
  }),

  components: {
    Plot
  },

  computed: {
    ...mapState(["darkMode", "whiteRepertoire", "blackRepertoire"]),

    whiteEasiness(): number[] {
      return easinessFromRepertoire(this.whiteRepertoire);
    },

    blackEasiness(): number[] {
      return easinessFromRepertoire(this.blackRepertoire);
    },

    showNoPositions(): boolean {
      return _.isEmpty(this.whiteEasiness) && _.isEmpty(this.blackEasiness);
    },

    plotData() {
      const common = { xbins: { start: 0, end: 15 }, type: "histogram" };
      return [
        {
          ...common,
          name: "Black",
          x: this.blackEasiness
        },
        {
          ...common,
          name: "White",
          x: this.whiteEasiness
        }
      ];
    }
  }
});
