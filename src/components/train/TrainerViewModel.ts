import Vue from "vue";
import _ from "lodash";
import { Chess } from "chess.js";
import { DrawShape } from "chessground/draw";

import chessboard from "@/components/common/chessboard.vue";
import { Threats } from "@/components/common/chessboardViewModel";
import { TrainingOptions } from "@/components/train/TrainingModeSelectorViewModel";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { Side } from "@/store/side";
import { Move } from "@/store/move";
import { mapMutations } from "vuex";
import { TrainingEvent } from "@/store/TrainingEvent";
import { TrainingMode } from "@/store/trainingMode";

const maxAttempts = 3;

export default Vue.extend({
  data: () => ({
    variationIndex: 0,
    plyCount: 0,
    startTime: _.now(),
    attempts: 0,
    previewIndex: 0,
    previewedVariations: [] as number[],
    mistakeInVariation: false
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
    previewing(): boolean {
      const previewingEnabled = this.options.previewNewVariations;

      const anyNew =
        _.find(
          this.activeVariationPositions,
          position =>
            position.IncludeForTrainingMode(TrainingMode.New) && position.myTurn
        ) || false;

      const alreadyPreviewed = _.includes(
        this.previewedVariations,
        this.variationIndex
      );

      return previewingEnabled && anyNew && !alreadyPreviewed;
    },

    previewPositionFen(): string {
      return this.activeVariationPositions[this.previewIndex].fen;
    },

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
    },

    previewPlaybackDelay(): number {
      return this.options.playbackSpeed * 1000;
    },

    mistakeArrow(): DrawShape[] {
      if (this.showMistakeArrow) {
        const board = new Chess(this.activePosition.fen);
        const index =
          this.boardOrientation === Side.White
            ? this.plyCount
            : this.plyCount + 1;
        const move = board.move(this.activeVariation[index].san);

        if (move) {
          return [{ orig: move.from, dest: move.to, brush: "red" }];
        }
      }

      return [];
    },

    showMistakeArrow(): boolean {
      return this.attempts >= maxAttempts;
    }
  },

  watch: {
    previewing(newPreviewing: boolean) {
      if (newPreviewing) {
        this.advancePreview();
      }
    }
  },

  methods: {
    ...mapMutations(["addTrainingEvent"]),

    reloadPosition(): void {
      (this.$refs.board as Vue & {
        loadPosition: () => void;
      }).loadPosition();
    },

    onBoardMove(threats: Threats) {
      if (threats.fen && threats.fen !== this.activePosition.fen) {
        this.attempts++;
        const correct = this.moveIsCorrect(threats.fen);

        if (correct) {
          this.addTrainingEvent({
            position: this.activePosition,
            event: new TrainingEvent(this.attempts, this.getElapsedSeconds())
          });

          this.nextTrainingPosition();
        } else {
          this.mistakeInVariation = true;

          this.reloadPosition();
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

    nextVariation() {
      if (this.activeVariation.length === 1) {
        this.reloadPosition();
      }

      if (!this.mistakeInVariation) {
        this.variationIndex++;
      }

      this.mistakeInVariation = false;
      this.plyCount = 0;

      if (this.complete) {
        this.$emit("onCompleted");
      }
    },

    getElapsedSeconds(): number {
      return (_.now() - this.startTime) / 1000;
    },

    advancePreview() {
      if (this.previewIndex < this.activeVariation.length) {
        ++this.previewIndex;
        setTimeout(() => {
          this.advancePreview();
        }, this.previewPlaybackDelay);
      } else {
        this.previewedVariations.push(this.variationIndex);
        this.previewIndex = 0;
        this.startTime = _.now();
      }
    }
  },

  mounted(): void {
    if (this.previewing) {
      setTimeout(() => this.advancePreview(), this.previewPlaybackDelay);
    }
  }
});
