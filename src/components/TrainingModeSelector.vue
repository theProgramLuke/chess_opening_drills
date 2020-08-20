<template lang="pug">
  v-container
    v-card.pa-4(min-width="550px")
      v-card-title Train
      v-treeview(
        :items="combinedTags",
        v-model="selectedTopics",
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
      v-checkbox(
        v-if="showPreviewInput",
        v-model="previewNewVariations",
        label="Preview variations for new positions")
      v-slider(v-if="previewNewVariations", v-model="playbackSpeedSlideValue", :label="playbackSpeedLabel")
      v-checkbox(label="Review entire variations", v-model="entireVariations")
      v-card-actions
        v-btn(
          @click="onStartTraining"
          :disabled="trainingPositions.length < 1",
          color="primary",
          x-large) {{ startTrainingLabel }}
</template>

<script lang="ts">
import Vue from "vue";
import _ from "lodash";
import { Repertoire } from "@/store/repertoire";
import {
  RepertoireTag,
  GetTrainingPositions,
  GetTrainingMoveLists
} from "@/store/repertoireTag";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { TrainingMode } from "@/store/trainingMode";
import { Turn } from "@/store/turn";
import { Move } from "@/store/move";

const minPlaybackSpeed = 0.2;
const maxPlaybackSpeed = 5;

export class TrainingOptions {
  topics: RepertoireTag[];
  variations: Move[][];
  previewNewVariations: boolean;
  entireVariations: boolean;
  playbackSpeed: number;

  constructor(
    topics: RepertoireTag[],
    variations: Move[][],
    previewNewVariations: boolean,
    entireVariations: boolean,
    playbackSpeed: number
  ) {
    this.topics = topics;
    (this.variations = variations),
      (this.previewNewVariations = previewNewVariations);
    this.entireVariations = entireVariations;
    this.playbackSpeed = playbackSpeed;
  }
}

export default Vue.extend({
  data: () => ({
    selectedTopics: [],
    modes: [TrainingMode.Scheduled, TrainingMode.New, TrainingMode.Mistakes],
    selectedModes: [TrainingMode.Scheduled],
    previewNewVariations: true,
    entireVariations: true,
    playbackSpeedSlideValue: 10
  }),

  props: {
    whiteRepertoire: {
      type: Repertoire,
      required: true
    },

    blackRepertoire: {
      type: Repertoire,
      required: true
    }
  },

  computed: {
    combinedTags(): RepertoireTag[] {
      return _.concat(this.whiteRepertoire.tags, this.blackRepertoire.tags);
    },

    showPreviewInput(): boolean {
      return _.includes(this.selectedModes, TrainingMode.New);
    },

    playbackSpeedLabel(): string {
      const speed = Number(this.coercedPlaybackSpeed).toFixed(1);
      return "Playback speed (" + speed + " moves per second)";
    },

    coercedPlaybackSpeed(): number {
      const normalized = this.playbackSpeedSlideValue / 100;
      return (
        minPlaybackSpeed + (maxPlaybackSpeed - minPlaybackSpeed) * normalized
      );
    },

    trainingPositions(): RepertoirePosition[] {
      return GetTrainingPositions(this.selectedModes, this.selectedTopics);
    },

    startTrainingLabel(): string {
      return "Start Training (" + this.trainingPositions.length + " positions)";
    }
  },

  methods: {
    onStartTraining() {
      this.$emit(
        "onStartTraining",
        new TrainingOptions(
          this.selectedTopics,
          GetTrainingMoveLists(this.trainingPositions),
          this.previewNewVariations,
          this.entireVariations,
          this.coercedPlaybackSpeed
        )
      );
    }
  }
});
</script>
