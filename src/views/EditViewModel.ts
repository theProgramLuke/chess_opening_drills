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
  RemoveRepertoireTagPayload
} from "@/store/MutationPayloads";
import { fenAfterMove } from "@/store/repertoire/chessHelpers";

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
  activeRepertoire: Repertoire = 0 as any;
  activePosition = "";
  recomputeCounter = 0;

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
    this.recomputeCounter;

    return this.activeRepertoire.positions.movesFromPosition(
      this.activePosition
    );
  }

  onCreateTag(partialPayload: Partial<AddRepertoireTagPayload>): void {
    if (
      !_.isUndefined(partialPayload.name) &&
      !_.isUndefined(partialPayload.parent) &&
      !_.isUndefined(partialPayload.fen)
    ) {
      this.addRepertoireTag({
        repertoire: this.activeRepertoire,
        parent: partialPayload.parent,
        name: partialPayload.name,
        fen: partialPayload.fen
      });
    }
  }

  onDeleteMove(move: VariationMove): void {
    this.removeRepertoireMove({
      repertoire: this.activeRepertoire,
      fen: move.sourceFen,
      san: move.san
    });

    ++this.recomputeCounter;
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
    if (threats.fen && threats.fen !== this.activePosition) {
      if (!_.some(this.nextMoves, move => move.resultingFen === threats.fen)) {
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
