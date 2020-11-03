import _ from "lodash";
import { Vue, Component } from "vue-property-decorator";
import { State, Mutation } from "vuex-class";

import { Repertoire } from "@/store/repertoire/Repertoire";
import { TrainingMoveSpecification } from "@/store/repertoire/TrainingCollection";
import chessboard from "@/components/common/chessboard.vue";
import { RemoveRepertoireMovePayload } from "@/store/MutationPayloads";

interface PositionToReview {
  fen: string;
  moves: TrainingMoveSpecification[];
  repertoire: Repertoire;
}

@Component({ components: { chessboard } })
export default class RepertoireHealthViewModel extends Vue {
  recomputePositions = 0;

  private positionsToSkip: PositionToReview[] = [];
  private showDialog: Record<string, boolean> = {};

  @State
  whiteRepertoire!: Repertoire;

  @State
  blackRepertoire!: Repertoire;

  @Mutation
  removeRepertoireMove!: (payload: RemoveRepertoireMovePayload) => void;

  get activePosition(): string | undefined {
    const position = this.positionToReview;

    if (position) {
      return `${position.fen} 0 1`;
    } else {
      return undefined;
    }
  }

  get activePositionMoves(): TrainingMoveSpecification[] {
    const position = this.positionToReview;

    if (!_.isUndefined(position)) {
      return position.moves;
    } else {
      return [];
    }
  }

  skipPosition(): void {
    const position = this.positionToReview;

    if (!_.isUndefined(position)) {
      this.positionsToSkip.push(position);
    }
  }

  onDeleteMove(move: TrainingMoveSpecification): void {
    if (this.activeRepertoire) {
      this.removeRepertoireMove({
        repertoire: this.activeRepertoire,
        fen: move.fen,
        san: move.san,
      });
    }

    ++this.recomputePositions;
  }

  private get activeRepertoire(): Repertoire | undefined {
    const position = this.positionToReview;

    if (position) {
      return position.repertoire;
    } else {
      return undefined;
    }
  }

  private get positionToReview(): PositionToReview | undefined {
    return _.head(
      _.without(this.positionsWithMultipleMoves, ...this.positionsToSkip)
    );
  }

  private get positionsWithMultipleMoves(): PositionToReview[] {
    this.recomputePositions;

    return _.concat(
      RepertoireHealthViewModel.getPositionsToReview(this.whiteRepertoire),
      RepertoireHealthViewModel.getPositionsToReview(this.blackRepertoire)
    );
  }

  private static getPositionsToReview(
    repertoire: Repertoire
  ): PositionToReview[] {
    const positions = repertoire.training.getPositionsWithMultipleTrainings();

    const fens = _.keys(positions);

    return _.map(fens, fen => {
      const moves = positions[fen];
      return { repertoire, fen, moves };
    });
  }
}
