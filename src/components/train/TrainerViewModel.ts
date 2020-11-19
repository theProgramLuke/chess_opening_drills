import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { Mutation } from "vuex-class";
import _ from "lodash";
import { Chess } from "chess.js";
import { DrawShape } from "chessground/draw";

import chessboard from "@/components/common/chessboard.vue";
import { Threats } from "@/components/common/chessboardViewModel";
import {
  TrainingOptions,
  TrainingVariation,
} from "@/components/train/TrainingOptions";
import { Side } from "@/store/side";
import { sideFromFen, normalizeFen } from "@/store/repertoire/chessHelpers";
import { AddTrainingEventPayload } from "@/store/MutationPayloads";
import { VariationMove } from "@/store/repertoire/PositionCollection";
import { TrainingMode } from "@/store/trainingMode";

const maxAttempts = 3;

@Component({ components: { chessboard } })
export default class TrainerViewModel extends Vue {
  variationIndex = 0;
  previewIndex = 0;
  plyCount = 0;
  startTime: number = _.now();
  attempts: string[] = [];
  previewedVariations: number[] = [];
  mistakeInVariation = false;

  @Prop({ required: true })
  options!: TrainingOptions;

  @Mutation
  addTrainingEvent!: (payload: AddTrainingEventPayload) => void;

  @Watch("previewing")
  onPreviewingChange(newPreviewing: boolean): void {
    if (newPreviewing) {
      this.advancePreview();
    }
  }

  private get anyNewPositionsInActiveVariation(): boolean {
    if (_.isUndefined(this.activeVariation)) {
      return false;
    }

    const repertoire = this.activeVariation.repertoire;

    const newMoves = _.find(
      this.activeVariation.variation,
      (move: VariationMove) => {
        const training = repertoire.training.getTrainingForMove(
          move.sourceFen,
          move.san
        );

        if (training) {
          return training.includeForTrainingMode(TrainingMode.New);
        }

        return false;
      }
    );

    return !_.isUndefined(newMoves);
  }

  get previewing(): boolean {
    const anyNew = this.anyNewPositionsInActiveVariation;

    const previewingEnabled = this.options.previewNewVariations;

    const alreadyPreviewed = _.includes(
      this.previewedVariations,
      this.variationIndex
    );

    return anyNew && previewingEnabled && !alreadyPreviewed;
  }

  get previewPositionFen(): string {
    return this.activeVariationPositions[this.previewIndex];
  }

  get previewPositionLegalFen(): string {
    return `${this.previewPositionFen} 0 1`;
  }

  get variationProgress(): string {
    return this.variationIndex + " / " + this.options.variations.length;
  }

  get activeVariation(): TrainingVariation | undefined {
    const trainingVariation = this.options.variations[this.variationIndex];

    if (trainingVariation) {
      if (
        trainingVariation.repertoire.sideToTrain !==
        sideFromFen(trainingVariation.variation[0].sourceFen)
      ) {
        trainingVariation.variation.shift();
      }

      return trainingVariation;
    } else {
      return undefined;
    }
  }

  get activeVariationPositions(): string[] {
    if (_.isUndefined(this.activeVariation)) {
      return [];
    }

    const positions: string[] = [];

    _.forEach(this.activeVariation.variation, (move: VariationMove) =>
      positions.push(move.sourceFen)
    );

    const lastMove = _.last(this.activeVariation.variation);
    if (lastMove) {
      positions.push(lastMove.resultingFen);
    }

    return positions;
  }

  get activePosition(): string {
    return this.activeVariationPositions[this.plyCount];
  }

  get activePositionLegalFen(): string {
    return `${this.activePosition} 0 1`;
  }

  get expectedMove(): VariationMove | undefined {
    if (_.isUndefined(this.activeVariation)) {
      return undefined;
    }

    return this.activeVariation.variation[this.plyCount];
  }

  get boardOrientation(): Side {
    if (_.isUndefined(this.activeVariation)) {
      return Side.White;
    }

    return this.activeVariation.repertoire.sideToTrain;
  }

  get complete(): boolean {
    return this.variationIndex >= this.options.variations.length;
  }

  get completionPercent(): number {
    return (100 * this.variationIndex) / this.options.variations.length;
  }

  get previewPlaybackDelay(): number {
    return this.options.playbackSpeed * 1000;
  }

  get mistakeArrow(): DrawShape[] {
    if (_.isUndefined(this.expectedMove) || !this.showMistakeArrow) {
      return [];
    }

    const board = new Chess(this.activePositionLegalFen);
    const move = board.move(this.expectedMove.san);
    const drawings: DrawShape[] = [];

    if (move) {
      drawings.push({ orig: move.from, dest: move.to, brush: "red" });
    }

    return drawings;
  }

  get showMistakeArrow(): boolean {
    return this.attempts.length >= maxAttempts;
  }

  reloadPosition(): void {
    (this.$refs.board as Vue & {
      loadPosition: () => void;
    }).loadPosition();
  }

  onBoardMove(threats: Threats): void {
    if (!_.isUndefined(this.activeVariation)) {
      if (threats.fen && threats.fen !== this.activePositionLegalFen) {
        const correct = this.moveIsCorrect(threats.fen);
        this.attempts.push(_.last(threats.history) || "not a move");

        if (correct) {
          this.addTrainingEvent({
            repertoire: this.activeVariation.repertoire,
            event: {
              attemptedMoves: this.attempts,
              elapsedMilliseconds: this.getElapsedMilliseconds(),
            },
            fen: this.activePosition,
            san: this.activeVariation.variation[this.plyCount].san,
          });

          this.nextTrainingPosition();
        } else {
          this.mistakeInVariation = true;
          this.reloadPosition();
        }
      }
    }
  }

  moveIsCorrect(fen: string): boolean {
    if (_.isUndefined(this.expectedMove)) {
      return false;
    }

    const expectedFen = normalizeFen(this.expectedMove.resultingFen, false);
    const attemptedFen = normalizeFen(fen, false);
    return attemptedFen === expectedFen;
  }

  private get isTurnOfSideToTrain(): boolean {
    const sideToMove = sideFromFen(this.activePosition);
    return sideToMove === this.activeVariation!.repertoire.sideToTrain;
  }

  nextTrainingPosition(): void {
    if (!_.isUndefined(this.activeVariation)) {
      this.attempts = [];

      do {
        this.plyCount++;

        if (this.plyCount >= this.activeVariation.variation.length) {
          this.nextVariation();
        }
      } while (!this.complete && !this.isTurnOfSideToTrain);

      this.startTime = _.now();
    }
  }

  nextVariation(): void {
    if (!_.isUndefined(this.activeVariation)) {
      if (this.activeVariation.variation.length === 1) {
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
    }
  }

  // Method instead of computed so this won't be cached
  getElapsedMilliseconds(): number {
    return _.now() - this.startTime;
  }

  advancePreview(): void {
    if (!_.isUndefined(this.activeVariation)) {
      if (this.previewIndex <= this.activeVariation.variation.length) {
        setTimeout(() => {
          ++this.previewIndex;
          this.advancePreview();
        }, this.previewPlaybackDelay);
      } else {
        this.previewedVariations.push(this.variationIndex);
        this.previewIndex = 0;
        this.startTime = _.now();
      }
    }
  }

  mounted(): void {
    if (this.previewing) {
      setTimeout(() => this.advancePreview(), this.previewPlaybackDelay);
    }
  }
}
