import Vue from "vue";
import _ from "lodash";
import { mapState } from "vuex";

import Plot from "@/components/common/Plot.vue";
import { RepertoireTag } from "@/store/repertoireTag";
import { TrainingMode } from "@/store/trainingMode";

export default Vue.extend({
  name: "LearnedReport",

  data: () => ({
    options: { displayModeBar: false },
    layout: {},
    selectedTags: [] as RepertoireTag[]
  }),

  components: {
    Plot
  },

  computed: {
    ...mapState(["darkMode", "whiteRepertoire", "blackRepertoire"]),

    combinedTags(): RepertoireTag[] {
      return _.concat(this.whiteRepertoire.tags, this.blackRepertoire.tags);
    },

    showNoPositions(): boolean {
      return (
        this.whiteRepertoire.positions.length === 1 &&
        this.blackRepertoire.positions.length === 1
      );
    },

    plotData() {
      let trainedPositions = 0;
      let newPositions = 0;

      _.forEach(this.combinedTags, tag =>
        tag.position.VisitChildren(child => {
          if (child.IncludeForTrainingMode(TrainingMode.New)) {
            ++newPositions;
          } else {
            ++trainedPositions;
          }
        })
      );

      return {
        type: "pie",
        hole: 0.75,
        labels: ["Trained", "New"],
        values: [trainedPositions, newPositions]
      };
    }
  }
});
