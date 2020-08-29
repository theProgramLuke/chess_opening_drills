import { shallowMount } from "@vue/test-utils";

import MoveListViewModel from "@/components/edit/MoveListViewModel.ts";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { Side } from "@/store/side";

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
          turnLists: [0]
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
          turnLists: [0]
        }
      });
      const position = new RepertoirePosition("", "", Side.White);

      component.vm.onSelectMove(position);

      expect(component.emitted().onSelectMove).toEqual([[position]]);
    });
  });
});
