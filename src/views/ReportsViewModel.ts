import Vue from "vue";

import DifficultyReport from "@/components/reports/Difficulty.vue";
import PositionsPerTagReport from "@/components/reports/PositionsPerTag.vue";
import LearnedReport from "@/components/reports/Learned.vue";

enum ReportToShow {
  PositionsPerTag = "Positions per Tag",
  Difficulty = "Difficulty Distribution",
  Learned = "Learned Positions"
}

export default Vue.extend({
  data: () => ({
    selectedReportType: ReportToShow.PositionsPerTag,
    reportTypes: [
      ReportToShow.PositionsPerTag,
      ReportToShow.Learned,
      ReportToShow.Difficulty
    ]
  }),

  components: {
    DifficultyReport,
    PositionsPerTagReport,
    LearnedReport
  }
});
