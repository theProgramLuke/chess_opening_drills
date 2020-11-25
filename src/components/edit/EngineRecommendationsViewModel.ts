import _ from "lodash";
import "reflect-metadata";
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { State } from "vuex-class";
import { Engine } from "node-uci";

import {
  EngineOption,
  ProcessAnalysis,
  EngineOutput,
  EngineMetadata,
  EngineData,
} from "@/store/EngineHelpers";
import { sideFromFen } from "@/store/repertoire/chessHelpers";
import { Side } from "@/store/side";

type NullableEngineOutput = EngineOutput | undefined;

@Component
export default class EngineRecommendationsViewModel extends Vue {
  activeEngine = false;
  engineRecommendations: NullableEngineOutput[] = [];
  sortedEngineRecommendations: EngineOutput[] = [];
  engine?: Engine = undefined;

  @Prop()
  activePosition!: string;

  @State
  engineMetadata!: EngineMetadata;

  @Watch("activePosition")
  async onActivePositionChanged(): Promise<void> {
    await this.startGettingEngineRecommendations();
  }

  async activateEngine(active: boolean): Promise<void> {
    if (active) {
      if (this.engine) {
        await this.engine.quit();
      }

      this.engine = new Engine(this.engineMetadata.filePath);

      await this.engine.init();
      _.forEach(this.engineMetadata.options, async (option: EngineOption) => {
        if (this.engine) {
          await this.engine.setoption(option.name, option.value.toString());
        }
      });

      await this.startGettingEngineRecommendations();
    } else {
      if (this.engine) {
        await this.engine
          .quit()
          .then(() => (this.engine = undefined))
          .catch(_.noop);
      }
    }
  }

  async startGettingEngineRecommendations(): Promise<void> {
    if (this.engine) {
      try {
        await this.engine.stop();
      } catch {
        // Engine may not be analyzing yet.
        _.noop();
      }

      this.sortedEngineRecommendations = [];
      this.engineRecommendations = [];

      await this.engine.position(this.activePosition);

      const throttledSort = _.throttle(this.sortEngineRecommendations, 100);

      this.engine
        .goInfinite({})
        .on("data", data =>
          this.receiveRecommendation(data as EngineData, throttledSort)
        );
    }
  }

  receiveRecommendation(
    data: EngineData,
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
  }

  sortEngineRecommendations(): void {
    const recommendations: EngineOutput[] = [];
    const blackToMove = sideFromFen(this.activePosition) === Side.Black;

    _.forEach(this.engineRecommendations, recommendation => {
      if (recommendation) {
        if (blackToMove) {
          recommendation.evaluation = 0 - recommendation.evaluation;
        }
        recommendations.push(recommendation);
      }
    });

    const evaluationSortOrder = blackToMove ? "asc" : "desc";

    this.sortedEngineRecommendations = _.orderBy(
      recommendations,
      ["depth", "evaluation"],
      ["desc", evaluationSortOrder]
    );
  }

  destroyed(): void {
    if (this.engine) {
      this.engine.quit();
    }
  }
}
