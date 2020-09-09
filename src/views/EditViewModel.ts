import Vue from "vue";
import _ from "lodash";
import { mapState, mapMutations } from "vuex";

import chessboard from "@/components/common/chessboard.vue";
import TagTree from "@/components/edit/TagTree.vue";
import MoveList from "@/components/edit/MoveList.vue";
import VariationList from "@/components/edit/VariationList.vue";
import { Threats } from "@/components/common/chessboardViewModel";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { Turn } from "@/store/turn";
import { Move } from "@/store/move";
import { Side } from "@/store/side";
import { RepertoireTag } from "@/store/repertoireTag";
import { Engine } from "node-uci";
import { EngineOption } from "@/store/EngineHelpers";

export default Vue.extend({
  data: () => ({
    activePosition: new RepertoirePosition(
      "8/8/8/8/8/8/8/8 w KQkq - 0 1",
      "",
      Side.White
    ),
    boardOrientation: Side.White,
    activeEngine: false,
    engineOutput: "",
    engine: new Engine("")
  }),

  components: {
    chessboard,
    TagTree,
    MoveList,
    VariationList
  },

  computed: {
    ...mapState(["whiteRepertoire", "blackRepertoire", "engineMetadata"]),

    turnLists(): Turn[][] {
      return this.activePosition.GetTurnLists() || [[]];
    },

    nextMoves(): Array<Move> {
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

    updateBoard(position: RepertoirePosition): void {
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
    },

    async activateEngine(active: boolean) {
      if (active) {
        this.getEngineRecommendations();
      } else {
        this.engine.quit().catch();
      }
    },

    async getEngineRecommendations() {
      this.engine = new Engine(this.engineMetadata.filePath);

      await this.engine.init();
      _.forEach(this.engineMetadata.options, async (option: EngineOption) => {
        if (option.value) {
          await this.engine.setoption(option.name, option.value.toString());
        }
      });

      await this.engine.position(this.activePosition.fen);

      this.engine.goInfinite({}).on("data", data => {
        this.engineOutput = data;
      });
    }
  },

  created() {
    this.updateBoard(this.whiteRepertoire.tags[0].position);
  }
});
