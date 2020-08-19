<template lang="pug">
  v-container.justify-center
    v-card.pa-4(max-width="750px")
      v-card-title Train
      v-treeview(:items="combinedTags", dense, hoverable, selectable, open-on-click)
      v-select(
        v-model="selectedModes",
        :items="modes",
        hint="Positions to include",
        multiple)
      v-checkbox(
        v-if="showPreviewInput",
        v-model="previewNewVariations",
        label="Preview variation for new positions")
      v-checkbox(label="Review entire variations", v-model="entireVariations")
      v-slider(v-model="playbackSpeedSlideValue", :label="playbackSpeedLabel")
      v-card-actions
        v-btn(color="primary", x-large) Start Training
</template>

<script lang="ts">
import Vue from "vue";
import { mapState } from "vuex";
import _ from "lodash";
import { Repertoire } from "@/store/repertoire";

const minPlaybackSpeed = 0.2;
const maxPlaybackSpeed = 5;

export default Vue.extend({
  data: () => ({
    modes: ["Scheduled", "New", "Learned"],
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
  }
});
</script>
