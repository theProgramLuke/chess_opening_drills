<template lang="pug">
  v-container.fill-height.ma-0(fluid)
    template(v-if="showNoPositions")
      v-alert(color="error") No positions have been trained
    template(v-else)
      v-tooltip(bottom)
        template(v-slot:activator="{ on }")
          v-chip(v-on="on", label) What is difficulty
            v-icon(right) mdi-comment-question-outline

        div Difficulty is the memory retention easiness factor from the SM-2 algorithm.
        div An easiness factor of 1 indicates a very hard position to remember,
        span higher easiness factors are easier to remember.
        div The initial easiness factor for a position is 2.5.

      plot(
        :data="data",
        :layout="layout",
        :options="options",
          :dark="darkMode")
</template>

<script lang="ts" src="./DifficultyViewModel.ts" />
