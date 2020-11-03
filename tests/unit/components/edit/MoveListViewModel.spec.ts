import { shallowMount, Wrapper } from "@vue/test-utils";

import MoveListViewModel, {
  Turn,
} from "@/components/edit/MoveListViewModel.ts";
import {
  VariationMove,
  Variation,
} from "@/store/repertoire/PositionCollection";

describe("MoveListViewModel", () => {
  let component: Wrapper<MoveListViewModel>;

  function mountComponent() {
    return shallowMount(MoveListViewModel, {
      render: jest.fn(),
      propsData: {
        variations: [],
      },
    });
  }

  beforeEach(() => {
    component = mountComponent();
  });

  describe("pageIndex", () => {
    it("should start at 1", () => {
      expect(component.vm.pageIndex).toBe(1);
    });

    it("should be reset to 1 when variations is updated", async () => {
      component.vm.pageIndex = 10;

      await component.setProps({ variations: [0, 1] });

      expect(component.vm.pageIndex).toBe(1);
    });
  });

  describe("onSelectMove", () => {
    it("should emit onSelectMove with the position when invoked", () => {
      const move: VariationMove = { resultingFen: "", san: "", sourceFen: "" };

      component.vm.onSelectMove(move);

      expect(component.emitted().onSelectMove).toEqual([[move]]);
    });
  });

  describe("turnLists", () => {
    it("should be the variations split into turns", () => {
      const variations: Variation[] = [
        [
          { resultingFen: "", san: "", sourceFen: " w " },
          { resultingFen: "", san: "", sourceFen: " b " },
          { resultingFen: "", san: "", sourceFen: " w " },
          { resultingFen: "", san: "", sourceFen: " b " },
        ],
        [{ resultingFen: "", san: "", sourceFen: " w " }],
        [{ resultingFen: "", san: "", sourceFen: " b " }],
      ];
      const expected: Turn[][] = [
        [
          {
            turnNumber: 1,
            whiteMove: variations[0][0],
            blackMove: variations[0][1],
          },
          {
            turnNumber: 2,
            whiteMove: variations[0][2],
            blackMove: variations[0][3],
          },
        ],
        [
          {
            turnNumber: 1,
            whiteMove: variations[1][0],
            blackMove: undefined,
          },
        ],
        [
          {
            turnNumber: 1,
            whiteMove: undefined,
            blackMove: variations[2][0],
          },
        ],
      ];
      component.vm.variations.push(...variations);

      const actual = component.vm.turnLists;

      expect(actual).toEqual(expected);
    });
  });
});
