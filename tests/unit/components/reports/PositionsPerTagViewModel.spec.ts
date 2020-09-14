import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import _ from "lodash";

import PositionsPerTagViewModel from "@/components/reports/PositionsPerTagViewModel";
import { Repertoire } from "@/store/repertoire";
import { RepertoireTag } from "@/store/repertoireTag";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { Side } from "@/store/side";

const state = {
  whiteRepertoire: new Repertoire([], []),
  blackRepertoire: new Repertoire([], [])
};

const localVue = createLocalVue();
localVue.use(Vuex);
const store = new Vuex.Store({ state });

describe("PositionsPerTagViewModel", () => {
  describe("showNoPositions", () => {
    it("should be true if the repertoire only have the starting positions", () => {
      state.whiteRepertoire.positions = [
        new RepertoirePosition("", "", Side.White)
      ];
      state.blackRepertoire.positions = [
        new RepertoirePosition("", "", Side.White)
      ];
      const component = shallowMount(PositionsPerTagViewModel, {
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
      const component = shallowMount(PositionsPerTagViewModel, {
        localVue,
        store,
        render: jest.fn()
      });

      const show = component.vm.showNoPositions;

      expect(show).toBeFalsy();
    });
  });

  describe("plotData", () => {
    it("should be sunburst data of the repertoire counts per tag", () => {
      state.whiteRepertoire.positions = [
        new RepertoirePosition("", "", Side.White),
        new RepertoirePosition("", "", Side.White)
      ];
      state.blackRepertoire.positions = [
        new RepertoirePosition("", "", Side.Black)
      ];
      state.whiteRepertoire.tags = [
        new RepertoireTag(
          Side.White,
          "White",
          state.whiteRepertoire.positions[0],
          "",
          [
            new RepertoireTag(
              Side.White,
              "French",
              state.whiteRepertoire.positions[1],
              "",
              []
            )
          ]
        )
      ];
      state.blackRepertoire.tags = [
        new RepertoireTag(
          Side.Black,
          "Black",
          state.blackRepertoire.positions[0],
          "",
          [
            new RepertoireTag(
              Side.Black,
              "French",
              state.blackRepertoire.positions[0],
              "",
              []
            )
          ]
        )
      ];
      const component = shallowMount(PositionsPerTagViewModel, {
        localVue,
        store,
        render: jest.fn()
      });

      const plotData = component.vm.plotData;

      expect(plotData).toEqual([
        {
          labels: ["White", "White / French", "Black", "Black / French"],
          maxdepth: 3,
          parents: ["", "White", "", "Black"],
          type: "sunburst",
          values: [1, 1, 1, 1]
        }
      ]);
    });
  });
});