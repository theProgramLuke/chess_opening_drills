import { shallowMount } from "@vue/test-utils";

import MoveListViewModel from "@/components/edit/MoveListViewModel.ts";
import { VariationMove } from "@/store/repertoire/PositionCollection";

describe("MoveListViewModel", () => {
  describe("pageIndex", () => {
    it("should start at 1", () => {
      const component = shallowMount(MoveListViewModel, {
        render: jest.fn(),
        propsData: {
          turnLists: []
        }
      });

      expect(component.vm.pageIndex).toBe(1);
    });

    it("should be reset to 1 when turnLists is updated", async () => {
      const component = shallowMount(MoveListViewModel, {
        render: jest.fn(),
        propsData: {
          turnLists: []
        }
      });
      component.vm.pageIndex = 10;

      await component.setProps({ turnLists: [0, 1] });

      expect(component.vm.pageIndex).toBe(1);
    });
  });

  describe("onSelectMove", () => {
    it("should emit onSelectMove with the position when invoked", () => {
      const component = shallowMount(MoveListViewModel, {
        render: jest.fn(),
        propsData: {
          turnLists: []
        }
      });
      const move: VariationMove = { resultingFen: "", san: "", sourceFen: "" };

      component.vm.onSelectMove(move);

      expect(component.emitted().onSelectMove).toEqual([[move]]);
    });
  });
});
