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

export default Vue.extend({
  data: () => ({
    variationIndex: 0,
    plyCount: 0,
    startTime: _.now()
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
        positions.push(this.activeVariation[0].position.parents[0]);
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
      return this.activeVariation[this.plyCount];
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
        const correct = this.moveIsCorrect(threats.fen);

        this.addTrainingEvent({
          position: this.activePosition,
          event: new TrainingEvent(correct, this.getElapsed())
        });

        if (correct) {
          this.nextTrainingPosition();
        } else {
          this.$refs.board.loadPosition();
        }
      }
    },

    moveIsCorrect(fen: string): boolean {
      return fen === this.expectedMove.position.fen;
    },

    nextTrainingPosition(): void {
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

    getElapsed(): number {
      return _.now() - this.startTime;
    }
  }
});
</script>
