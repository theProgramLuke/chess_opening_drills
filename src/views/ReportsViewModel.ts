import "reflect-metadata";
import { Vue, Component } from "vue-property-decorator";

import DifficultyReport from "@/components/reports/Difficulty.vue";
import PositionsPerTagReport from "@/components/reports/PositionsPerTag.vue";
import LearnedReport from "@/components/reports/Learned.vue";
import RetentionReport from "@/components/reports/Retention.vue";

enum ReportToShow {
  PositionsPerTag = "Positions per Tag",
  Difficulty = "Difficulty Distribution",
  Learned = "Learned Moves",
  Retention = "Training Retention"
}

@Component({
  components: {
    DifficultyReport,
    PositionsPerTagReport,
    LearnedReport,
    RetentionReport
  }
})
export default class ReportsViewModel extends Vue {
  selectedReportType: ReportToShow = ReportToShow.PositionsPerTag;
  reportTypes: ReportToShow[] = [
    ReportToShow.PositionsPerTag,
    ReportToShow.Learned,
    ReportToShow.Retention,
    ReportToShow.Difficulty
  ];
}
