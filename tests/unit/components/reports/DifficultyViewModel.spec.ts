import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import _ from "lodash";

import DifficultyViewModel from "@/components/reports/DifficultyViewModel";
import { Repertoire, SavedRepertoire } from "@/store/repertoire/Repertoire";
import { Side } from "@/store/side";
import { RepetitionTraining } from "@/store/repertoire/RepetitionTraining";
import { Writeable } from "../../../TestHelpers";

jest.mock("@/store/repertoire/Repertoire");
jest.mock("@/store/repertoire/TagTree");
jest.mock("@/store/repertoire/RepetitionTraining");
jest.mock("@/store/repertoire/TrainingCollection");

const emptySavedRepertoire: SavedRepertoire = {
  positions: {},
  training: {},
  tags: { name: "", fen: "", id: "", children: [], isRootTag: false },
  sideToTrain: Side.White,
};

const notIncludedTraining = new RepetitionTraining();
(notIncludedTraining.includeForTrainingMode as jest.Mock).mockReturnValue(
  false
);

const includedTraining = new RepetitionTraining();
(includedTraining.includeForTrainingMode as jest.Mock).mockReturnValue(true);

const state = {
  whiteRepertoire: new Repertoire(emptySavedRepertoire),
  blackRepertoire: new Repertoire(emptySavedRepertoire),
};

const localVue = createLocalVue();
localVue.use(Vuex);
const store = new Vuex.Store({ state });

describe("DifficultyViewModel", () => {
  function trainingFromDifficulties(
    difficulties: number[]
  ): RepetitionTraining[] {
    return _.map(difficulties, difficulty => {
      const training: Writeable<RepetitionTraining> = new RepetitionTraining();
      training.easiness = difficulty;
      return training as RepetitionTraining;
    });
  }

  describe("showNoPositions", () => {
    it("should be true if the repertoire has no trained positions", () => {
      (state.whiteRepertoire.getTrainingForTags as jest.Mock).mockReturnValue(
        []
      );
      (state.blackRepertoire.getTrainingForTags as jest.Mock).mockReturnValue(
        []
      );
      const component = shallowMount(DifficultyViewModel, {
        localVue,
        store,
        render: jest.fn(),
      });

      const show = component.vm.showNoPositions;

      expect(show).toBeTruthy();
    });

    it("should be false if the repertoire has trained positions", () => {
      (state.whiteRepertoire.getTrainingForTags as jest.Mock).mockReturnValue([
        "anything",
      ]);
      (state.blackRepertoire.getTrainingForTags as jest.Mock).mockReturnValue(
        []
      );
      const component = shallowMount(DifficultyViewModel, {
        localVue,
        store,
        render: jest.fn(),
      });

      const show = component.vm.showNoPositions;

      expect(show).toBeFalsy();
    });
  });

  describe("plotData", () => {
    it("should be histogram data of the repertoire difficulty", () => {
      const whiteEasinessFactors = [0, 1, 2];
      const blackEasinessFactors = [3, 4];
      (state.whiteRepertoire.getTrainingForTags as jest.Mock).mockReturnValue(
        trainingFromDifficulties(whiteEasinessFactors)
      );
      (state.blackRepertoire.getTrainingForTags as jest.Mock).mockReturnValue(
        trainingFromDifficulties(blackEasinessFactors)
      );
      const component = shallowMount(DifficultyViewModel, {
        localVue,
        store,
        render: jest.fn(),
      });

      const plotData = component.vm.plotData;

      expect(plotData).toEqual([
        {
          type: "histogram",
          name: "Black Positions",
          x: blackEasinessFactors,
          xbins: { start: 0, end: 15 },
        },
        {
          type: "histogram",
          name: "White Positions",
          x: whiteEasinessFactors,
          xbins: { start: 0, end: 15 },
        },
      ]);
    });
  });
});
