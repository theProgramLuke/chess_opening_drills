import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import _ from "lodash";

import LearnedViewModel from "@/components/reports/LearnedViewModel";
import { Repertoire } from "@/store/repertoire";
import { RepertoireTag } from "@/store/repertoireTag";
import { Side } from "@/store/side";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { TrainingMode } from "@/store/trainingMode";

jest.mock("@/store/repertoire");
jest.mock("@/store/repertoireTag");
jest.mock("@/store/repertoirePosition");

const state = {
  whiteRepertoire: new Repertoire([], []),
  blackRepertoire: new Repertoire([], [])
};

const localVue = createLocalVue();
localVue.use(Vuex);
const store = new Vuex.Store({ state });

const mockedRepertoirePosition = (includeAsNew = false) => {
  const position = new RepertoirePosition("", "", Side.White);
  position.IncludeForTrainingMode = (mode: TrainingMode) =>
    mode === TrainingMode.New && includeAsNew;
  return position;
};

const mockedRepertoireTag = (
  position = new RepertoirePosition("", "", Side.White)
) => {
  const tag = new RepertoireTag(Side.White, "", position, "", []);
  tag.position = position;
  return tag;
};

describe("LearnedViewModel", () => {
  describe("combinedTags", () => {
    it("should get the concatenated tags of the repertoires", () => {
      state.whiteRepertoire.tags = [
        mockedRepertoireTag(),
        mockedRepertoireTag()
      ];
      state.blackRepertoire.tags = [mockedRepertoireTag()];
      const expectedTags = _.concat(
        state.whiteRepertoire.tags,
        state.blackRepertoire.tags
      );
      const component = shallowMount(LearnedViewModel, {
        localVue,
        store,
        render: jest.fn()
      });

      const combined = component.vm.combinedTags;

      expect(combined).toEqual(expectedTags);
    });
  });

  describe("showNoPositions", () => {
    it("should be true if the repertoire only have the starting positions", () => {
      state.whiteRepertoire.positions = [
        new RepertoirePosition("", "", Side.White)
      ];
      state.blackRepertoire.positions = [
        new RepertoirePosition("", "", Side.White)
      ];
      const component = shallowMount(LearnedViewModel, {
        localVue,
        store,
        render: jest.fn()
      });

      const show = component.vm.showNoPositions;

      expect(show).toBeTruthy();
    });

    it("should be false if either repertoire has more than the starting positions", () => {
      state.whiteRepertoire.positions = [
        new RepertoirePosition("", "", Side.White),
        new RepertoirePosition("", "", Side.White)
      ];
      state.blackRepertoire.positions = [
        new RepertoirePosition("", "", Side.White)
      ];
      const component = shallowMount(LearnedViewModel, {
        localVue,
        store,
        render: jest.fn()
      });

      const show = component.vm.showNoPositions;

      expect(show).toBeFalsy();
    });
  });

  describe("plotData", () => {
    it("should get a pie chart for the unique positions of the selected tags", () => {
      const position = mockedRepertoirePosition();
      const trainedPositions = 3;
      const newPositions = 5;
      const positions = [
        ..._.times(trainedPositions, () => mockedRepertoirePosition(false)),
        ..._.times(newPositions, () => mockedRepertoirePosition(true))
      ];
      position.VisitChildren = (fn: (position: RepertoirePosition) => void) => {
        _.forEach(positions, fn);
      };
      const component = shallowMount(LearnedViewModel, {
        localVue,
        store,
        render: jest.fn()
      });
      component.vm.selectedTags = [
        mockedRepertoireTag(position),
        mockedRepertoireTag(position)
      ];

      const plotData = component.vm.plotData;

      expect(plotData).toEqual([
        {
          type: "pie",
          hole: 0.7,
          labels: ["Trained", "New"],
          values: [trainedPositions, newPositions]
        }
      ]);
    });
  });
});
