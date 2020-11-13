<template lang="pug">
  v-container.fill-height.ma-0(fluid)
    v-select(v-model="selectedReportType", :items="reportTypes")

    moves-per-tag-report(v-if="selectedReportType === 'Moves per Tag'")
    learned-report(v-if="selectedReportType === 'Learned Moves'")
    difficulty-report(v-if="selectedReportType === 'Difficulty Distribution'")
    retention-report(v-if="selectedReportType === 'Training Retention'")
    time-training-report(v-if="selectedReportType === 'Time Spent Training'")
</template>

<script lang="ts" src="./ReportsViewModel.ts" />
