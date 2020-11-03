import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";

import LearnedViewModel from "@/components/reports/LearnedViewModel";
import { Repertoire, SavedRepertoire } from "@/store/repertoire/Repertoire";
import { Side } from "@/store/side";
import { TrainingCollection } from "@/store/repertoire/TrainingCollection";
import { RepetitionTraining } from "@/store/repertoire/RepetitionTraining";

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

const state = {
  whiteRepertoire: new Repertoire(emptySavedRepertoire),
  blackRepertoire: new Repertoire(emptySavedRepertoire),
};
state.whiteRepertoire.training = new TrainingCollection();
state.blackRepertoire.training = new TrainingCollection();
state.whiteRepertoire.sideToTrain = Side.White;
state.blackRepertoire.sideToTrain = Side.Black;

const localVue = createLocalVue();
localVue.use(Vuex);
const store = new Vuex.Store({ state });

describe("LearnedViewModel", () => {
  describe("repertoires", () => {
    it("should get the concatenated tags of the repertoires", () => {
      const expectedTags = [
        state.whiteRepertoire.tags,
        state.blackRepertoire.tags,
      ];
      const component = shallowMount(LearnedViewModel, {
        localVue,
        store,
        render: jest.fn(),
      });

      const combined = component.vm.combinedTags;

      expect(combined).toEqual(expectedTags);
    });
  });

  describe("showNoPositions", () => {
    it("should be true if the repertoires have no positions", () => {
      (state.whiteRepertoire.training.getMoves as jest.Mock).mockReturnValue(
        []
      );
      (state.blackRepertoire.training.getMoves as jest.Mock).mockReturnValue(
        []
      );
      const component = shallowMount(LearnedViewModel, {
        localVue,
        store,
        render: jest.fn(),
      });

      const show = component.vm.showNoPositions;

      expect(show).toBeTruthy();
    });

    it("should be false if either repertoire has more than the starting positions", () => {
      state.whiteRepertoire.training = new TrainingCollection();
      (state.whiteRepertoire.training.getMoves as jest.Mock).mockReturnValue([
        "anything",
      ]);
      (state.blackRepertoire.training.getMoves as jest.Mock).mockReturnValue(
        []
      );
      const component = shallowMount(LearnedViewModel, {
        localVue,
        store,
        render: jest.fn(),
      });

      const show = component.vm.showNoPositions;

      expect(show).toBeFalsy();
    });
  });

  describe("plotData", () => {
    it("should get a pie chart for count of moves that are trained and new from the selected tags", () => {
      const trainedMoves = 2;
      const newMoves = 1;
      const component = shallowMount(LearnedViewModel, {
        localVue,
        store,
        render: jest.fn(),
      });
      component.vm.selectedTags = [
        component.vm.whiteRepertoire.tags,
        component.vm.blackRepertoire.tags,
      ];
      const newTraining = new RepetitionTraining();
      const trainedTraining = new RepetitionTraining();
      (newTraining.includeForTrainingMode as jest.Mock).mockReturnValue(true);
      (trainedTraining.includeForTrainingMode as jest.Mock).mockReturnValue(
        false
      );
      (component.vm.whiteRepertoire
        .getTrainingForTags as jest.Mock).mockReturnValue([
        trainedTraining,
        newTraining,
      ]);
      (component.vm.blackRepertoire
        .getTrainingForTags as jest.Mock).mockReturnValue([trainedTraining]);

      const plotData = component.vm.plotData;

      expect(plotData).toEqual([
        {
          type: "pie",
          hole: 0.7,
          labels: ["Learned", "New"],
          values: [trainedMoves, newMoves],
        },
      ]);
    });
  });
});
