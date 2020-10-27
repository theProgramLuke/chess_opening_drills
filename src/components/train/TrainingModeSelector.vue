<template lang="pug">
  v-container
    v-card.pa-4(min-width="550px")
      v-card-title Train
      v-treeview(
        :items="combinedTags",
        v-model="selectedTopics",
        selection-type="independent",
        return-object,
        dense,
        hoverable,
        selectable,
        open-on-click)

      v-select.ma-2(
        v-model="selectedModes",
        :items="modes",
        label="Positions to include",
        multiple,
        chips,
        deletable-chips)
        template(v-slot:append-outer)
          v-tooltip(bottom)
            template(v-slot:activator="{on }")
              v-chip(v-on="on", outlined) ?

            div Scheduled - Positions planned for study today.
            div New - Positions not studied before.
            div Cram - All positions.
            div Difficult - Positions historically hard to remember.

      v-slider(
        v-if="showDifficultyModeInput",
        v-model="difficultyModeLimit",
        :label="difficultyModeLimitLabel")

      v-checkbox(
        v-if="showPreviewInput",
        v-model="previewNewVariations",
        label="Preview variations for new positions")

      v-slider(
        v-if="previewNewVariations && showPreviewInput",
        v-model="playbackSpeedSlideValue",
        :label="playbackSpeedLabel")

      v-checkbox(label="Review entire variations", v-model="entireVariations")

      v-card-actions
        v-btn(
          @click="onStartTraining"
          :disabled="trainingVariations.length < 1",
          color="primary",
          x-large) {{ startTrainingLabel }}
</template>

<script lang="ts" src="./TrainingModeSelectorViewModel.ts" />
