<template lang="pug">
  v-container.fill-height.ma-0(fluid)
    v-select(v-model="selectedReportType", :items="reportTypes")

    positions-per-tag-report(v-if="selectedReportType === 'Positions per Tag'")
    learned-report(v-if="selectedReportType === 'Learned Positions'")
    difficulty-report(v-if="selectedReportType === 'Difficulty Distribution'")
    retention-report(v-if="selectedReportType === 'Training Retention'")
</template>

<script lang="ts" src="./ReportsViewModel.ts" />
