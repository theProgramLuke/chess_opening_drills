import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import _ from "lodash";

import DifficultyViewModel from "@/components/reports/DifficultyViewModel";
import { Repertoire } from "@/store/repertoire";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { Side } from "@/store/side";
import { TrainingMode } from "@/store/trainingMode";

jest.mock("@/store/repertoire");
jest.mock("@/store/repertoirePosition");

const state = {
  whiteRepertoire: new Repertoire([], []),
  blackRepertoire: new Repertoire([], [])
};

const localVue = createLocalVue();
localVue.use(Vuex);
const store = new Vuex.Store({ state });

const positionsFromDifficulties = (
  difficulties: number[]
): RepertoirePosition[] => {
  return _.map(difficulties, difficulty => {
    const position = new RepertoirePosition("", "", Side.White);
    position.easinessFactor = difficulty;
    return position;
  });
};

describe("DifficultyViewModel", () => {
  describe("showNoPositions", () => {
    it("should be true if the repertoire has no trained positions", () => {
      const position = new RepertoirePosition("", "", Side.White);
      position.IncludeForTrainingMode = (mode: TrainingMode) =>
        mode === TrainingMode.New;
      state.whiteRepertoire.positions = [position];
      const component = shallowMount(DifficultyViewModel, {
        localVue,
        store,
        render: jest.fn()
      });

      const show = component.vm.showNoPositions;

      expect(show).toBeTruthy();
    });

    it("should be false if the repertoire has trained positions", () => {
      const position = new RepertoirePosition("", "", Side.White);
      position.IncludeForTrainingMode = (mode: TrainingMode) =>
        mode !== TrainingMode.New;
      state.whiteRepertoire.positions = [position];
      const component = shallowMount(DifficultyViewModel, {
        localVue,
        store,
        render: jest.fn()
      });

      const show = component.vm.showNoPositions;

      expect(show).toBeFalsy();
    });
  });

  describe("plotData", () => {
    it("should be histogram data of the repertoire difficulty", () => {
      const whiteEasinessFactors = [0, 1, 2];
      const blackEasinessFactors = [3, 4];
      state.whiteRepertoire.positions = positionsFromDifficulties(
        whiteEasinessFactors
      );
      state.blackRepertoire.positions = positionsFromDifficulties(
        blackEasinessFactors
      );
      const component = shallowMount(DifficultyViewModel, {
        localVue,
        store,
        render: jest.fn()
      });

      const plotData = component.vm.plotData;

      expect(plotData).toEqual([
        {
          type: "histogram",
          name: "Black Positions",
          x: blackEasinessFactors,
          xbins: { start: 0, end: 15 }
        },
        {
          type: "histogram",
          name: "White Positions",
          x: whiteEasinessFactors,
          xbins: { start: 0, end: 15 }
        }
      ]);
    });
  });
});
