import Vue from "vue";

import DifficultyReport from "@/components/reports/Difficulty.vue";
import PositionsPerTagReport from "@/components/reports/PositionsPerTag.vue";

enum ReportToShow {
  PositionsPerTag = "Positions per Tag",
  Difficulty = "Difficulty"
}

export default Vue.extend({
  data: () => ({
    selectedReportType: ReportToShow.PositionsPerTag,
    reportTypes: [ReportToShow.PositionsPerTag, ReportToShow.Difficulty]
  }),

  components: {
    DifficultyReport,
    PositionsPerTagReport
  }
});
