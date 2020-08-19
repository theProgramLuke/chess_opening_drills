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
      v-select(
        v-model="selectedModes",
        :items="modes",
        hint="Positions to include",
        multiple)
      v-checkbox(
        v-if="showPreviewInput",
        v-model="previewNewVariations",
        label="Preview variations for new positions")
      v-checkbox(label="Review entire variations", v-model="entireVariations")
      v-slider(v-if="previewNewVariations", v-model="playbackSpeedSlideValue", :label="playbackSpeedLabel")
      v-card-actions
        v-btn(
          @click="onStartTraining"
          color="primary",
          x-large) Start Training
</template>

<script lang="ts">
import Vue from "vue";
import _ from "lodash";
import { Repertoire } from "@/store/repertoire";
import { RepertoireTag } from "@/store/repertoireTag";

const minPlaybackSpeed = 0.2;
const maxPlaybackSpeed = 5;

export interface TrainingOptions {
  topics: RepertoireTag[];
  modes: string[];
  previewNewVariations: boolean;
  entireVariations: boolean;
  playbackSpeed: number;
}

export default Vue.extend({
  data: () => ({
    selectedTopics: [],
    modes: ["Scheduled", "New", "Common Mistakes"],
    selectedModes: ["Scheduled"],
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
    combinedTags() {
      return _.concat(this.whiteRepertoire.tags, this.blackRepertoire.tags);
    },

    showPreviewInput() {
      return _.includes(this.selectedModes, "New");
    },

    playbackSpeedLabel: {
      get() {
        const speed = Number(this.coercedPlaybackSpeed).toFixed(1);
        return "Playback speed (" + speed + " moves per second)";
      }
    },

    coercedPlaybackSpeed: {
      get(): number {
        const normalized = this.playbackSpeedSlideValue / 100;
        return (
          minPlaybackSpeed + (maxPlaybackSpeed - minPlaybackSpeed) * normalized
        );
      }
    }
  },

  methods: {
    onStartTraining() {
      this.$emit("onStartTraining", {
        topics: this.selectedTopics,
        selectedModes: this.selectedModes,
        previewNewVariations: this.previewNewVariations,
        entireVariations: this.entireVariations,
        playbackSpeed: this.coercedPlaybackSpeed
      });
    }
  }
});
</script>
