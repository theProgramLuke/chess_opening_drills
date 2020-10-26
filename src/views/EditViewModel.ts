import _ from "lodash";
import "reflect-metadata";
import { Vue, Component } from "vue-property-decorator";
import { State, Mutation } from "vuex-class";

import chessboard from "@/components/common/chessboard.vue";
import TagTree from "@/components/edit/TagTree.vue";
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
import { sideFromFen } from "@/store/repertoire/chessHelpers";

@Component({
  components: {
    chessboard,
    TagTree,
    MoveList,
    VariationList,
    EngineRecommendations
  }
})
export default class EditViewModel extends Vue {
  activeRepertoire!: Repertoire;
  activePosition = "8/8/8/8/8/8/8/8 w KQkq -";
  boardOrientation: Side = Side.White;

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
  removeRepertoireMov!: (payload: RemoveRepertoireMovePayload) => void;

  get sourceVariations(): Variation[] {
    return this.activeRepertoire.positions.getSourceVariations(
      this.activePosition
    );
  }

  get nextMoves(): VariationMove[] {
    return this.activeRepertoire.positions.movesFromPosition(
      this.activePosition
    );
  }

  updateBoard(fen: string): void {
    this.activePosition = fen;
    this.boardOrientation = sideFromFen(fen);
  }

  onBoardMove(threats: Threats): void {
    const lastMoveSan = _.last(threats.history) || "";
    if (threats.fen && threats.fen !== this.activePosition) {
      this.addRepertoireMove({
        repertoire: this.activeRepertoire,
        fen: threats.fen,
        san: lastMoveSan
      });

      this.updateBoard(threats.fen);
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
    this.updateBoard(this.whiteRepertoire.tags.fen);
    this.activeRepertoire = this.whiteRepertoire;
  }
}
