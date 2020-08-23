<template lang="pug">
  v-container.fill-height.ma-0(fluid)
    v-select(v-model="selectedReportType", :items="reportTypes")

    difficulty-report(v-if="selectedReportType === 'Difficulty'")
    positions-per-tag-report(v-if="selectedReportType === 'Positions per Tag'")
</template>

<script lang="ts">
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
</script>
