import Vue from "vue";
import _ from "lodash";
import { mapState } from "vuex";
import { Engine } from "node-uci";

import {
  EngineOption,
  ProcessAnalysis,
  EngineOutput
} from "@/store/EngineHelpers";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { Side } from "@/store/side";

interface EngineRecommendationsViewModelData {
  activeEngine: boolean;
  engineRecommendations: Array<EngineOutput | undefined>;
  sortedEngineRecommendations: EngineOutput[];
  engine?: Engine;
}

export default Vue.extend({
  data(): EngineRecommendationsViewModelData {
    return {
      activeEngine: false,
      engineRecommendations: [],
      sortedEngineRecommendations: [],
      engine: undefined
    };
  },

  props: {
    activePosition: {
      type: RepertoirePosition,
      required: true
    }
  },

  computed: {
    ...mapState(["engineMetadata"])
  },

  methods: {
    async activateEngine(
      active: boolean,
      createEngine = (filePath: string) => new Engine(filePath)
    ) {
      if (active) {
        this.engine = createEngine(this.engineMetadata.filePath);

        await this.engine.init();
        _.forEach(this.engineMetadata.options, async (option: EngineOption) => {
          if (this.engine) {
            await this.engine.setoption(option.name, option.value.toString());
          }
        });

        this.startGettingEngineRecommendations();
      } else {
        if (this.engine) {
          await this.engine
            .quit()
            .then(() => (this.engine = undefined))
            .catch();
        }
      }
    },

    async startGettingEngineRecommendations() {
      if (this.engine) {
        this.sortedEngineRecommendations = [];
        await this.engine.position(this.activePosition.fen);

        const throttledSort = _.throttle(this.sortEngineRecommendations, 100);

        this.engine
          .goInfinite({})
          .on("data", data => this.receiveRecommendation(data, throttledSort));
      }
    },

    receiveRecommendation(
      data: any,
      sorter: Function,
      processor = ProcessAnalysis
    ): void {
      const processed = processor(data);
      if (processed) {
        while (this.engineRecommendations.length < processed.id) {
          this.engineRecommendations.push(undefined);
        }

        this.engineRecommendations[processed.id - 1] = processed;
        sorter();
      }
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

  destroyed(): void {
    if (this.engine) {
      this.engine.quit();
    }
  }
});
