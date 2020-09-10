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
import { Engine } from "node-uci";
import {
  EngineOption,
  ProcessAnalysis,
  EngineOutput
} from "@/store/EngineHelpers";

interface EditViewModelData {
  activePosition: RepertoirePosition;
  boardOrientation: Side;
  activeEngine: boolean;
  engineRecommendations: Array<EngineOutput | undefined>;
  sortedEngineRecommendations: Array<EngineOutput | undefined>;
  engine?: Engine;
  positionReportDepth: number;
}

export default Vue.extend({
  data(): EditViewModelData {
    return {
      activePosition: new RepertoirePosition(
        "8/8/8/8/8/8/8/8 w KQkq - 0 1",
        "",
        Side.White
      ),
      boardOrientation: Side.White,
      activeEngine: false,
      engineRecommendations: [],
      sortedEngineRecommendations: [],
      engine: undefined,
      positionReportDepth: 25
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
    },

    positionReportLabel(): string {
      return `Depth (${this.positionReportDepth})`;
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
      if (this.activeEngine) {
        this.engine?.stop().then(this.startGettingEngineRecommendations);
      }
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
        this.engine = new Engine(this.engineMetadata.filePath);

        await this.engine?.init();
        _.forEach(this.engineMetadata.options, async (option: EngineOption) => {
          if (option.value) {
            await this.engine?.setoption(option.name, option.value.toString());
          }
        });

        this.startGettingEngineRecommendations();
      } else {
        this.engine
          ?.quit()
          .then(() => (this.engine = undefined))
          .catch();
      }
    },

    async startGettingEngineRecommendations() {
      this.sortedEngineRecommendations = [];
      await this.engine?.position(this.activePosition.fen);

      const throttledSort = _.throttle(this.sortEngineRecommendations, 100);

      this.engine?.goInfinite({}).on("data", data => {
        const processed = ProcessAnalysis(data);
        if (processed) {
          while (this.engineRecommendations.length < processed.id) {
            this.engineRecommendations.push(undefined);
          }

          this.engineRecommendations[processed.id] = processed;
          throttledSort();
        }
      });
    },

    sortEngineRecommendations(): void {
      const recommendations: EngineOutput[] = [];

      _.forEach(this.engineRecommendations, recommendation => {
        if (recommendation) {
          recommendations.push(recommendation);
        }
      });

      this.sortedEngineRecommendations = _.reverse(
        _.sortBy(recommendations, recommendation => {
          let evaluation = recommendation.evaluation;
          if (this.activePosition.SideToMove() === Side.Black) {
            evaluation = 0 - evaluation;
          }
          return 255 * recommendation.depth + evaluation;
        })
      );
    }
  },

  created() {
    this.updateBoard(this.whiteRepertoire.tags[0].position);
  },

  destroyed(): void {
    this.engine?.quit().catch();
  }
});
