<template lang="pug">
  v-container.fill-height.ma-0(fluid)
    v-select(v-model="selectedReportType", :items="reportTypes")

    difficulty-report(v-if="selectedReportType === 'Difficulty'")
    positions-per-tag-report(v-if="selectedReportType === 'Positions per Tag'")
</template>

<script lang="ts" src="./ReportsViewModel.ts" />
