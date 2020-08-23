<template lang="pug">
  v-container
    v-select(v-model="selectedReportType", :items="reportTypes")
    difficulty-report(v-if="selectedReportType === 'Difficulty'")
</template>

<script lang="ts">
import Vue from "vue";
import DifficultyReport from "@/components/reports/DifficultyReport.vue";

enum ReportToShow {
  Difficulty = "Difficulty"
}

export default Vue.extend({
  data: () => {
    return {
      selectedReportType: ReportToShow.Difficulty,
      reportTypes: [ReportToShow.Difficulty]
    };
  },

  components: {
    DifficultyReport
  }
});
</script>
