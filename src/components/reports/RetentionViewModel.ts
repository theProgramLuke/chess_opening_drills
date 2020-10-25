import Vue from "vue";
// import _ from "lodash";
// import { mapState } from "vuex";

// import Plot from "@/components/common/Plot.vue";

// interface RetentionData {
//   retentionRate: number;
//   attempts: number;
// }

// const getRetentionData = (repertoire: Repertoire): RetentionData[] => {
//   const trainedPositions = _.filter(
//     repertoire.positions,
//     position => position.trainingHistory.length > 0
//   );

//   return _.map(trainedPositions, position => {
//     const attempts = position.trainingHistory.length;
//     const successes = _.filter(
//       position.trainingHistory,
//       trainingEvent => trainingEvent.attempts === 1
//     ).length;
//     const retentionRate = successes / attempts;

//     return { attempts, retentionRate };
//   });
// };

// TODO
export default Vue.extend({
  name: "RetentionReport"

  // data: () => ({
  //   options: { displayModeBar: false },
  //   layout: {
  //     margin: { b: 125 },
  //     xaxis: {
  //       domain: [0, 0.8],
  //       showgrid: false,
  //       zeroline: false,
  //       title: { text: "Training Repetition Count" }
  //     },
  //     yaxis: {
  //       domain: [0, 0.8],
  //       showgrid: false,
  //       zeroline: false,
  //       rangemode: "tozero",
  //       title: { text: "Retention Rate" }
  //     },
  //     xaxis2: {
  //       domain: [0.85, 1],
  //       showgrid: false,
  //       zeroline: false
  //     },
  //     yaxis2: {
  //       domain: [0.85, 1],
  //       showgrid: false,
  //       zeroline: false
  //     }
  //   }
  // }),

  // components: {
  //   Plot
  // },

  // computed: {
  //   ...mapState(["darkMode", "whiteRepertoire", "blackRepertoire"]),

  //   whiteRetention(): RetentionData[] {
  //     return getRetentionData(this.whiteRepertoire);
  //   },

  //   blackRetention(): RetentionData[] {
  //     return getRetentionData(this.blackRepertoire);
  //   },

  //   showNoPositions(): boolean {
  //     return _.isEmpty(this.whiteRetention) && _.isEmpty(this.blackRetention);
  //   },

  //   plotData(): any[] {
  //     const retentions = _.concat(this.whiteRetention, this.blackRetention);
  //     const x = _.map(retentions, retention => retention.attempts);
  //     const y = _.map(retentions, retention => retention.retentionRate);

  //     return [
  //       {
  //         x,
  //         y,
  //         mode: "markers",
  //         name: "Positions",
  //         type: "scatter"
  //       },
  //       {
  //         x,
  //         yaxis: "y2",
  //         type: "histogram",
  //         showlegend: false
  //       },
  //       {
  //         y,
  //         xaxis: "x2",
  //         type: "histogram",
  //         showlegend: false
  //       }
  //     ];
  //   }
  // }
});
