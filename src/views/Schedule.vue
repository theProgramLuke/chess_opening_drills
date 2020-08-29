<template lang="pug">
  v-calendar(
    type="custom-weekly",
    :start="start",
    :end="end",
    :events="events")
</template>

<script lang="ts" src="./ScheduleViewModel.ts" />
