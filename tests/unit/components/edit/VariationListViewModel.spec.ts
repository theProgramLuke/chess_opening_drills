import { shallowMount } from "@vue/test-utils";

import VariationListViewModel from "@/components/edit/VariationListViewModel.ts";
import { Variation } from "@/store/repertoire/PositionCollection";

describe("VariationListViewModel", () => {
  let variations: Variation[];

  beforeEach(() => {
    variations = [[{ san: "", sourceFen: "", resultingFen: "" }]];
  });

  describe("onDeleteMove", () => {
    it("should emit onDeleteMove with the move", () => {
      const component = shallowMount(VariationListViewModel, {
        render: jest.fn(),
        propsData: {
          variations
        }
      });

      component.vm.onDeleteMove(variations[0][0]);

      expect(component.emitted().onDeleteMove).toEqual([[variations[0][0]]]);
    });
  });

  describe("onSelectMove", () => {
    it("should emit onSelectMove with the position", () => {
      const component = shallowMount(VariationListViewModel, {
        render: jest.fn(),
        propsData: {
          variations
        }
      });

      component.vm.onSelectMove(variations[0][0].resultingFen);

      expect(component.emitted().onSelectMove).toEqual([
        [variations[0][0].resultingFen]
      ]);
    });
  });
});
