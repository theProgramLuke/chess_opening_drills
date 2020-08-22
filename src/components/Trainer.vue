<template lang="pug">
  v-container(v-if="!complete")
    chessboard(
        ref="board"
        :fen="activePosition.fen",
        :orientation="boardOrientation",
        @onMove="onBoardMove")

    v-progress-linear.mb-10(
      :value="completionPercent",
      height=25,
      color="primary")
        template(v-slot="value")
            strong {{ variationProgress }}
</template>

<script lang="ts">
import Vue from "vue";
import _ from "lodash";

import chessboard, { Threats } from "@/components/chessboard.vue";
import { TrainingOptions } from "@/components/TrainingModeSelector.vue";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { Side } from "@/store/side";
import { Move } from "@/store/move";
import { mapMutations } from "vuex";
import { TrainingEvent } from "@/store/TrainingEvent";

const maxAttempts = 3;

export default Vue.extend({
  data: () => ({
    variationIndex: 0,
    plyCount: 0,
    startTime: _.now(),
    attempts: 0
  }),

  components: {
    chessboard
  },

  props: {
    options: {
      type: TrainingOptions,
      required: true
    }
  },

  computed: {
    variationProgress(): string {
      return this.variationIndex + " / " + this.options.variations.length;
    },

    activeVariation(): Move[] {
      return this.options.variations[this.variationIndex];
    },

    activeVariationPositions(): RepertoirePosition[] {
      if (this.activeVariation) {
        const positions: RepertoirePosition[] = [];

        if (this.activeVariation[0].position.forSide === Side.White) {
          positions.push(this.activeVariation[0].position.parents[0]);
        }

        _.forEach(this.activeVariation, move => positions.push(move.position));
        return positions;
      } else {
        return [];
      }
    },

    activePosition(): RepertoirePosition {
      return this.activeVariationPositions[this.plyCount];
    },

    expectedMove(): Move {
      let offset = 0;
      if (this.activeVariation[0].position.forSide === Side.Black) {
        offset = 1;
      }
      return this.activeVariation[this.plyCount + offset];
    },

    boardOrientation(): Side {
      return this.activePosition.forSide;
    },

    complete(): boolean {
      return this.variationIndex >= this.options.variations.length;
    },

    completionPercent(): number {
      return (100 * this.variationIndex) / this.options.variations.length;
    }
  },

  methods: {
    ...mapMutations(["addTrainingEvent"]),

    onBoardMove(threats: Threats): void {
      if (threats.fen && threats.fen !== this.activePosition.fen) {
        this.attempts++;
        const correct = this.moveIsCorrect(threats.fen);
        const shouldContinue = correct || this.attempts >= maxAttempts;

        if (shouldContinue) {
          this.addTrainingEvent({
            position: this.activePosition,
            event: new TrainingEvent(this.attempts, this.getElapsedSeconds())
          });

          this.nextTrainingPosition();
        } else {
          // forces a reload of the previous position
          this.$refs.board.loadPosition();
        }
      }
    },

    moveIsCorrect(fen: string): boolean {
      return fen === this.expectedMove.position.fen;
    },

    nextTrainingPosition(): void {
      this.attempts = 0;
      do {
        this.plyCount++;
        if (this.plyCount >= this.activeVariation.length) {
          this.nextVariation();
        }
      } while (!this.complete && !this.activePosition.myTurn);
      this.startTime = _.now();
    },

    nextVariation(): void {
      if (this.activeVariation.length === 1) {
        // force reset of board since fen was the same
        this.$refs.board.loadPosition();
      }
      this.variationIndex++;
      this.plyCount = 0;

      if (this.complete) {
        this.$emit("onCompleted");
      }
    },

    getElapsedSeconds(): number {
      return (_.now() - this.startTime) / 1000;
    }
  }
});
</script>
