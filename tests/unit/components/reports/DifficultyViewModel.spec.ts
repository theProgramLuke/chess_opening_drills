import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import _ from "lodash";

import DifficultyViewModel from "@/components/reports/DifficultyViewModel";
import { Repertoire, SavedRepertoire } from "@/store/repertoire/Repertoire";
import { Side } from "@/store/side";
import {
  TrainingCollection,
  TrainingMoveSpecification
} from "@/store/repertoire/TrainingCollection";
import { RepetitionTraining } from "@/store/repertoire/RepetitionTraining";
import { Writeable } from "../../../TestHelpers";

jest.mock("@/store/repertoire/Repertoire");
jest.mock("@/store/repertoire/TagTree");
jest.mock("@/store/repertoire/RepetitionTraining");
jest.mock("@/store/repertoire/TrainingCollection");

const emptySavedRepertoire: SavedRepertoire = {
  name: "",
  positions: {},
  training: {},
  tags: { name: "", fen: "", id: "", children: [] },
  sideToTrain: Side.White
};

const notIncludedTraining = new RepetitionTraining();
(notIncludedTraining.includeForTrainingMode as jest.Mock).mockReturnValue(
  false
);

const includedTraining = new RepetitionTraining();
(includedTraining.includeForTrainingMode as jest.Mock).mockReturnValue(true);

const state = {
  whiteRepertoire: new Repertoire(emptySavedRepertoire),
  blackRepertoire: new Repertoire(emptySavedRepertoire)
};

const localVue = createLocalVue();
localVue.use(Vuex);
const store = new Vuex.Store({ state });

describe("DifficultyViewModel", () => {
  function trainingFromDifficulties(
    difficulties: number[]
  ): TrainingCollection {
    const collection = new TrainingCollection();
    const moves: TrainingMoveSpecification[] = _.times(
      difficulties.length,
      (n: number): TrainingMoveSpecification => {
        return { fen: "fen", san: "san" };
      }
    );
    (collection.getMoves as jest.Mock).mockReturnValue(moves);
    _.forEach(difficulties, difficulty => {
      const training: Writeable<RepetitionTraining> = new RepetitionTraining();
      training.easiness = difficulty;
      (collection.getTrainingForMove as jest.Mock).mockReturnValueOnce(
        training
      );
    });
    return collection;
  }

  describe("showNoPositions", () => {
    it("should be true if the repertoire has no trained positions", () => {
      state.whiteRepertoire.training = trainingFromDifficulties([]);
      state.blackRepertoire.training = trainingFromDifficulties([]);
      const component = shallowMount(DifficultyViewModel, {
        localVue,
        store,
        render: jest.fn()
      });

      const show = component.vm.showNoPositions;

      expect(show).toBeTruthy();
    });

    it("should be false if the repertoire has trained positions", () => {
      const fen = "fen";
      const san = "san";
      const trainingMoves: TrainingMoveSpecification[] = [{ fen, san }];
      state.whiteRepertoire.training = new TrainingCollection();
      (state.whiteRepertoire.training.getMoves as jest.Mock).mockReturnValue(
        trainingMoves
      );
      (state.whiteRepertoire.training
        .getTrainingForMove as jest.Mock).mockReturnValue(includedTraining);
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
      state.whiteRepertoire.training = trainingFromDifficulties(
        whiteEasinessFactors
      );
      state.blackRepertoire.training = trainingFromDifficulties(
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
          xbins: { start: 0, end: 15, size: 15 }
        },
        {
          type: "histogram",
          name: "White Positions",
          x: whiteEasinessFactors,
          xbins: { start: 0, end: 15, size: 15 }
        }
      ]);
    });
  });
});
