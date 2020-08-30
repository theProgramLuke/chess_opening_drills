import { shallowMount } from "@vue/test-utils";

import VariationListViewModel from "@/components/edit/VariationListViewModel.ts";
import { Move } from "@/store/move";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { Side } from "@/store/side";

describe("VariationListViewModel", () => {
  let variations: Move[];

  beforeEach(() => {
    variations = [new Move("", new RepertoirePosition("", "", Side.White))];
  });

  describe("onDeleteMove", () => {
    it("should emit onDeleteMove with the move", () => {
      const component = shallowMount(VariationListViewModel, {
        render: jest.fn(),
        propsData: {
          variations
        }
      });

      component.vm.onDeleteMove(variations[0]);

      expect(component.emitted().onDeleteMove).toEqual([[variations[0]]]);
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

      component.vm.onSelectMove(variations[0].position);

      expect(component.emitted().onSelectMove).toEqual([
        [variations[0].position]
      ]);
    });
  });
});
