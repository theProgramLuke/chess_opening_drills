import { shallowMount, Wrapper } from "@vue/test-utils";

import VariationListViewModel from "@/components/edit/VariationListViewModel.ts";
import { Variation } from "@/store/repertoire/PositionCollection";

describe("VariationListViewModel", () => {
  let component: Wrapper<VariationListViewModel>;
  let variations: Variation[];

  function mountComponent(variations: Variation[]) {
    return shallowMount(VariationListViewModel, {
      render: jest.fn(),
      propsData: {
        variations,
      },
    });
  }

  beforeEach(() => {
    variations = [[{ san: "", sourceFen: "", resultingFen: "" }]];

    component = mountComponent(variations);
  });

  describe("onDeleteMove", () => {
    it("should emit onDeleteMove with the move", () => {
      component.vm.onDeleteMove(variations[0][0]);

      expect(component.emitted().onDeleteMove).toEqual([[variations[0][0]]]);
    });
  });

  describe("onSelectMove", () => {
    it("should emit onSelectMove with the position", () => {
      component.vm.onSelectMove(variations[0][0]);

      expect(component.emitted().onSelectMove).toEqual([[variations[0][0]]]);
    });
  });
});
