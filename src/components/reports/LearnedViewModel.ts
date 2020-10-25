import Vue from "vue";
// import _ from "lodash";

// import Plot from "@/components/common/Plot.vue";

// TODO
export default Vue.extend({
  name: "LearnedReport"

  // data: () => ({
  //   options: { displayModeBar: false },
  //   layout: {},
  //   selectedTags: [] as RepertoireTag[]
  // }),

  // components: {
  //   Plot
  // },

  // computed: {
  //   ...mapState(["darkMode", "whiteRepertoire", "blackRepertoire"]),

  //   // TODO
  //   // combinedTags(): RepertoireTag[] {
  //   //   return _.concat(this.whiteRepertoire.tags, this.blackRepertoire.tags);
  //   // },

  //   showNoPositions(): boolean {
  //     return (
  //       this.whiteRepertoire.positions.length === 1 &&
  //       this.blackRepertoire.positions.length === 1
  //     );
  //   },

  //   selectedPositions(): RepertoirePosition[] {
  //     const positions: RepertoirePosition[] = [];

  //     _.forEach(this.selectedTags, tag =>
  //       tag.position.VisitChildren(position => {
  //         if (position.myTurn) {
  //           positions.push(position);
  //         }
  //       })
  //     );

  //     return _.uniq(positions);
  //   },

  //   plotData() {
  //     let trainedPositions = 0;
  //     let newPositions = 0;

  //     _.forEach(this.selectedPositions, position => {
  //       if (position.IncludeForTrainingMode(TrainingMode.New)) {
  //         ++newPositions;
  //       } else {
  //         ++trainedPositions;
  //       }
  //     });

  //     return [
  //       {
  //         type: "pie",
  //         hole: 0.7,
  //         labels: ["Trained", "New"],
  //         values: [trainedPositions, newPositions]
  //       }
  //     ];
  //   }
  // }
});
