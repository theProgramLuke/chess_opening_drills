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

<script lang="ts">
import Vue from "vue";
import _ from "lodash";
import { mapState } from "vuex";

import Plot from "@/components/Plot.vue";
import { Repertoire } from "@/store/repertoire";
import { TrainingMode } from "@/store/trainingMode";

export default Vue.extend({
  name: "DifficultyReport",

  data: () => ({
    options: { displayModeBar: false },
    layout: { yaxis: { rangemode: "tozero" } }
  }),

  components: {
    Plot
  },

  computed: {
    ...mapState(["darkMode", "whiteRepertoire", "blackRepertoire"]),

    whiteEasiness(): number[] {
      return this.easinessFromRepertoire(this.whiteRepertoire);
    },

    blackEasiness(): number[] {
      return this.easinessFromRepertoire(this.blackRepertoire);
    },

    showNoPositions(): boolean {
      return _.isEmpty(this.whiteEasiness) && _.isEmpty(this.blackEasiness);
    },

    data() {
      return [
        {
          type: "histogram",
          name: "White",
          x: this.whiteEasiness
        },
        {
          type: "histogram",
          name: "Black",
          x: this.blackEasiness
        }
      ];
    }
  },

  methods: {
    easinessFromRepertoire(repertoire: Repertoire): number[] {
      const easiness: number[] = [];

      _.forEach(
        _.filter(
          repertoire.positions,
          position => !position.IncludeForTrainingMode(TrainingMode.New)
        ),
        position => {
          easiness.push(position.easinessFactor);
        }
      );

      return easiness;
    }
  }
});
</script>
