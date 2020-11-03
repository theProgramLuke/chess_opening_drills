import { shallowMount } from "@vue/test-utils";

import MoveDeleterViewModel from "@/components/edit/MoveDeleterViewModel";
import { VariationMove } from "@/store/repertoire/PositionCollection";

describe("MoveDeleterViewModel", () => {
  const move: VariationMove = {
    sourceFen: "",
    resultingFen: "",
    san: "",
  };

  describe("showDialog", () => {
    it("should start by not showing the dialog", () => {
      const component = shallowMount(MoveDeleterViewModel, {
        render: jest.fn(),
        propsData: {
          move: move,
        },
      });

      expect(component.vm.showDialog).toBeFalsy();
    });
  });

  describe("onDelete", () => {
    it("should emit onDelete with the move", () => {
      const component = shallowMount(MoveDeleterViewModel, {
        render: jest.fn(),
        propsData: {
          move: move,
        },
      });

      component.vm.onDelete();

      expect(component.emitted().onDelete).toEqual([[move]]);
    });
  });
});
