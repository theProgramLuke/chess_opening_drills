import Vue from "vue";
import _ from "lodash";
import { mapState, mapMutations } from "vuex";

import chessboard from "@/components/common/chessboard.vue";
import TagTree from "@/components/edit/TagTree.vue";
import MoveList from "@/components/edit/MoveList.vue";
import VariationList from "@/components/edit/VariationList.vue";
import EngineRecommendations from "@/components/edit/EngineRecommendations.vue";
import { Threats } from "@/components/common/chessboardViewModel";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { Turn } from "@/store/turn";
import { Move } from "@/store/move";
import { Side } from "@/store/side";
import { RepertoireTag } from "@/store/repertoireTag";

interface EditViewModelData {
  activePosition: RepertoirePosition;
  boardOrientation: Side;
}

export default Vue.extend({
  data(): EditViewModelData {
    return {
      activePosition: new RepertoirePosition(
        "8/8/8/8/8/8/8/8 w KQkq - 0 1",
        "",
        Side.White
      ),
      boardOrientation: Side.White
    };
  },

  components: {
    chessboard,
    TagTree,
    MoveList,
    VariationList,
    EngineRecommendations
  },

  computed: {
    ...mapState(["whiteRepertoire", "blackRepertoire", "engineMetadata"]),

    turnLists(): Turn[][] {
      return this.activePosition.GetTurnLists() || [[]];
    },

    nextMoves(): Move[] {
      return this.activePosition.children;
    }
  },

  methods: {
    ...mapMutations([
      "addRepertoirePosition",
      "addRepertoireTag",
      "removeRepertoireTag",
      "removeRepertoireMove"
    ]),

    updateBoard(position: RepertoirePosition) {
      this.activePosition = position;
      this.boardOrientation = position.forSide;
    },

    onBoardMove(threats: Threats) {
      const lastMoveSan = _.last(threats.history) || "SAN";

      if (threats.fen && threats.fen !== this.activePosition.fen) {
        const position = new RepertoirePosition(
          threats.fen,
          "",
          this.activePosition.forSide
        );

        const move = new Move(lastMoveSan, position);

        this.addRepertoirePosition({
          parent: this.activePosition,
          newMove: move
        });

        this.updateBoard(move.position);
      }
    },

    addNewRepertoireTag(parent: RepertoireTag, name: string): void {
      this.addRepertoireTag({
        parent: parent,
        tag: new RepertoireTag(
          parent.forSide,
          name,
          this.activePosition,
          this.activePosition.fen,
          []
        )
      });
    },

    goToNextPosition() {
      if (!_.isEmpty(this.activePosition.children)) {
        this.updateBoard(this.activePosition.children[0].position);
      }
    },

    goToPreviousPosition() {
      if (!_.isEmpty(this.activePosition.parents)) {
        this.updateBoard(this.activePosition.parents[0]);
      }
    },

    onScroll(event: WheelEvent) {
      if (event.deltaY > 0) {
        this.goToNextPosition();
      } else {
        this.goToPreviousPosition();
      }
    }
  },

  created() {
    this.updateBoard(this.whiteRepertoire.tags[0].position);
  }
});
