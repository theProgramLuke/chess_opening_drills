import Vue from "vue";
import _ from "lodash";
import { mapState } from "vuex";

import Plot from "@/components/common/Plot.vue";
import { Repertoire } from "@/store/repertoire";

interface RetentionData {
  retentionRate: number;
  attempts: number;
}

const getRetentionData = (repertoire: Repertoire): RetentionData[] => {
  const trainedPositions = _.filter(
    repertoire.positions,
    position => position.trainingHistory.length > 0
  );

  return _.map(trainedPositions, position => {
    const attempts = position.trainingHistory.length;
    const successes = _.filter(
      position.trainingHistory,
      trainingEvent => trainingEvent.attempts === 1
    ).length;
    const retentionRate = successes / attempts;

    return { attempts, retentionRate };
  });
};

export default Vue.extend({
  name: "RetentionReport",

  data: () => ({
    options: { displayModeBar: false },
    layout: {
      xaxis: { type: "log", rangemode: "tozero" },
      yaxis: { rangemode: "tozero" }
    }
  }),

  components: {
    Plot
  },

  computed: {
    ...mapState(["darkMode", "whiteRepertoire", "blackRepertoire"]),

    whiteRetention(): RetentionData[] {
      return getRetentionData(this.whiteRepertoire);
    },

    blackRetention(): RetentionData[] {
      return getRetentionData(this.blackRepertoire);
    },

    showNoPositions(): boolean {
      return _.isEmpty(this.whiteRetention) && _.isEmpty(this.blackRetention);
    },

    plotData(): any[] {
      return [
        {
          type: "scatter",
          mode: "markers",
          name: "Black",
          marker: { size: 12 },
          x: _.map(this.blackRetention, retention => retention.attempts),
          y: _.map(this.blackRetention, retention => retention.retentionRate)
        },
        {
          type: "scatter",
          mode: "markers",
          name: "White",
          marker: { size: 12 },
          x: _.map(this.whiteRetention, retention => retention.attempts),
          y: _.map(this.whiteRetention, retention => retention.retentionRate)
        }
      ];
    }
  }
});
