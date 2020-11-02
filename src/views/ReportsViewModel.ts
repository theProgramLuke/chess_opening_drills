import "reflect-metadata";
import { Vue, Component } from "vue-property-decorator";

import DifficultyReport from "@/components/reports/Difficulty.vue";
import MovesPerTagReport from "@/components/reports/MovesPerTag.vue";
import LearnedReport from "@/components/reports/Learned.vue";
import RetentionReport from "@/components/reports/Retention.vue";

enum ReportToShow {
  MovesPerTag = "Moves per Tag",
  Difficulty = "Difficulty Distribution",
  Learned = "Learned Moves",
  Retention = "Training Retention",
}

@Component({
  components: {
    DifficultyReport,
    MovesPerTagReport,
    LearnedReport,
    RetentionReport,
  },
})
export default class ReportsViewModel extends Vue {
  selectedReportType: ReportToShow = ReportToShow.MovesPerTag;
  reportTypes: ReportToShow[] = [
    ReportToShow.MovesPerTag,
    ReportToShow.Learned,
    ReportToShow.Retention,
    ReportToShow.Difficulty,
  ];
}
