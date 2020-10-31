import _ from "lodash";
import "reflect-metadata";
import { Vue, Component } from "vue-property-decorator";
import { State, Mutation } from "vuex-class";

import chessboard from "@/components/common/chessboard.vue";
import TagList from "@/components/edit/TagList.vue";
import MoveList from "@/components/edit/MoveList.vue";
import VariationList from "@/components/edit/VariationList.vue";
import EngineRecommendations from "@/components/edit/EngineRecommendations.vue";
import { Threats } from "@/components/common/chessboardViewModel";
import { Repertoire } from "@/store/repertoire/Repertoire";
import { Side } from "@/store/side";
import {
  Variation,
  VariationMove
} from "@/store/repertoire/PositionCollection";
import {
  AddRepertoireMovePayload,
  AddRepertoireTagPayload,
  RemoveRepertoireMovePayload,
  RemoveRepertoireTagPayload,
  SetPositionCommentsPayload,
  SetPositionDrawingsPayload
} from "@/store/MutationPayloads";
import { fenAfterMove, normalizeFen } from "@/store/repertoire/chessHelpers";
import { DrawShape } from "chessground/draw";

@Component({
  components: {
    chessboard,
    TagList,
    MoveList,
    VariationList,
    EngineRecommendations
  }
})
export default class EditViewModel extends Vue {
  // hack so that this will be reactive https://github.com/vuejs/vue-class-component/issues/211
  activeRepertoire: Repertoire = (null as unknown) as Repertoire;
  activePosition = "";
  recomputeNextMovesCounter = 0;

  @State
  whiteRepertoire!: Repertoire;

  @State
  blackRepertoire!: Repertoire;

  @Mutation
  addRepertoireMove!: (payload: AddRepertoireMovePayload) => void;

  @Mutation
  addRepertoireTag!: (payload: AddRepertoireTagPayload) => void;

  @Mutation
  removeRepertoireTag!: (payload: RemoveRepertoireTagPayload) => void;

  @Mutation
  removeRepertoireMove!: (payload: RemoveRepertoireMovePayload) => void;

  @Mutation
  setPositionComments!: (payload: SetPositionCommentsPayload) => void;

  @Mutation
  setPositionDrawings!: (payload: SetPositionDrawingsPayload) => void;

  get activePositionLegalFen(): string {
    return `${this.activePosition} 0 1`;
  }

  get boardOrientation(): Side {
    return this.activeRepertoire.sideToTrain;
  }

  get sourceVariations(): Variation[] {
    return this.activeRepertoire.positions.getSourceVariations(
      this.activePosition
    );
  }

  get nextMoves(): VariationMove[] {
    this.recomputeNextMovesCounter;

    return this.activeRepertoire.positions.movesFromPosition(
      this.activePosition
    );
  }

  get activePositionComments(): string {
    return this.activeRepertoire.positions.getPositionComments(
      this.activePosition
    );
  }

  set activePositionComments(comments: string) {
    this.setPositionComments({
      repertoire: this.activeRepertoire,
      fen: this.activePosition,
      comments
    });
  }

  get activePositionDrawings(): DrawShape[] {
    return this.activeRepertoire.positions.getPositionDrawings(
      this.activePosition
    );
  }

  set activePositionDrawings(drawings: DrawShape[]) {
    this.setPositionDrawings({
      repertoire: this.activeRepertoire,
      fen: this.activePosition,
      drawings
    });
  }

  onCreateTag(
    partialPayload: Omit<AddRepertoireTagPayload, "repertoire">
  ): void {
    this.addRepertoireTag({
      ...partialPayload,
      repertoire: this.activeRepertoire
    });
  }

  onDeleteMove(move: VariationMove): void {
    this.removeRepertoireMove({
      repertoire: this.activeRepertoire,
      fen: move.sourceFen,
      san: move.san
    });

    ++this.recomputeNextMovesCounter;
  }

  onRemoveTag(
    partialPayload: Omit<RemoveRepertoireTagPayload, "repertoire">
  ): void {
    this.removeRepertoireTag({
      ...partialPayload,
      repertoire: this.activeRepertoire
    });
  }

  onSelectMove(move: VariationMove): void {
    this.updateBoard(move.resultingFen);
  }

  updateBoard(fen: string): void {
    this.activePosition = fen;
  }

  onTagSelect(repertoire: Repertoire, fen: string): void {
    this.activeRepertoire = repertoire;
    this.updateBoard(fen);
  }

  onBoardMove(threats: Threats): void {
    const lastMoveSan = _.last(threats.history) || "";
    if (threats.fen) {
      const moveAlreadyExists = _.some(
        this.nextMoves,
        move => move.sourceFen === normalizeFen(threats.fen || "", false)
      );

      if (!moveAlreadyExists) {
        this.addRepertoireMove({
          repertoire: this.activeRepertoire,
          fen: this.activePosition,
          san: lastMoveSan
        });
      }

      this.activePosition =
        fenAfterMove(this.activePosition, lastMoveSan) || this.activePosition;
    }
  }

  goToNextPosition(): void {
    const childMoves = this.activeRepertoire.positions.movesFromPosition(
      this.activePosition
    );

    if (!_.isEmpty(childMoves)) {
      this.updateBoard(childMoves[0].resultingFen);
    }
  }

  goToPreviousPosition(): void {
    const parentPositions = this.activeRepertoire.positions.parentPositions(
      this.activePosition
    );

    if (!_.isEmpty(parentPositions)) {
      this.updateBoard(parentPositions[0]);
    }
  }

  onScroll(event: { deltaY: number }): void {
    if (event.deltaY > 0) {
      this.goToNextPosition();
    } else {
      this.goToPreviousPosition();
    }
  }

  created(): void {
    this.activePosition = this.whiteRepertoire.tags.fen;
    this.activeRepertoire = this.whiteRepertoire;
  }
}
