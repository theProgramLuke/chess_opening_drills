import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import _ from "lodash";

import RetentionViewModel from "@/components/reports/RetentionViewModel";
import { Repertoire } from "@/store/repertoire";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { Side } from "@/store/side";
import { TrainingMode } from "@/store/trainingMode";
import { TrainingEvent } from "@/store/TrainingEvent";

jest.mock("@/store/repertoire");
jest.mock("@/store/repertoirePosition");

const state = {
  whiteRepertoire: new Repertoire([], []),
  blackRepertoire: new Repertoire([], [])
};

const localVue = createLocalVue();
localVue.use(Vuex);
const store = new Vuex.Store({ state });

const positionsFromData = (
  counts: number[],
  retentionSuccesses: number[]
): RepertoirePosition[] => {
  expect(counts.length).toEqual(retentionSuccesses.length);
  return _.map(counts, (count, index) => {
    const successes = retentionSuccesses[index];
    expect(count).toBeGreaterThanOrEqual(successes);
    const position = new RepertoirePosition("", "", Side.White);
    position.trainingHistory = [
      ..._.times(successes, () => new TrainingEvent(1, 0)),
      ..._.times(count - successes, () => new TrainingEvent(2, 0))
    ];
    return position;
  });
};

describe("RetentionViewModel", () => {
  describe("showNoPositions", () => {
    it("should be true if the repertoire has no trained positions", () => {
      state.whiteRepertoire.positions = [];
      state.blackRepertoire.positions = [];
      const component = shallowMount(RetentionViewModel, {
        localVue,
        store,
        render: jest.fn()
      });

      const show = component.vm.showNoPositions;

      expect(show).toBeTruthy();
    });

    it("should be false if the repertoire has trained positions", () => {
      state.blackRepertoire.positions = positionsFromData([1], [1]);
      const component = shallowMount(RetentionViewModel, {
        localVue,
        store,
        render: jest.fn()
      });

      const show = component.vm.showNoPositions;

      expect(show).toBeFalsy();
    });
  });

  describe("plotData", () => {
    it("should be scatter data of the positions training count and retention rate", () => {
      const blackTrainingCounts = [1, 0, 7, 3];
      const blackRetentionSuccesses = [1, 0, 4, 1];
      const blackRetentionRates = [1, 4 / 7, 1 / 3];
      const whiteTrainingCounts = [9, 1];
      const whiteRetentionSuccesses = [9, 0];
      const whiteRetentionRates = [1, 0];
      state.blackRepertoire.positions = positionsFromData(
        blackTrainingCounts,
        blackRetentionSuccesses
      );
      state.whiteRepertoire.positions = positionsFromData(
        whiteTrainingCounts,
        whiteRetentionSuccesses
      );
      const component = shallowMount(RetentionViewModel, {
        localVue,
        store,
        render: jest.fn()
      });

      const plotData = component.vm.plotData;

      expect(plotData).toEqual([
        {
          type: "scatter",
          name: "Black",
          mode: "markers",
          marker: { size: 12 },
          x: _.compact(blackTrainingCounts),
          y: blackRetentionRates
        },
        {
          type: "scatter",
          name: "White",
          mode: "markers",
          marker: { size: 12 },
          x: _.compact(whiteTrainingCounts),
          y: whiteRetentionRates
        }
      ]);
    });
  });
});
