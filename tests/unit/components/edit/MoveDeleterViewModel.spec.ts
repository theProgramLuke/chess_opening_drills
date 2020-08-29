import { shallowMount } from "@vue/test-utils";

import MoveDeleterViewModel from "@/components/edit/MoveDeleterViewModel.ts";
import { Move } from "@/store/move";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { Side } from "@/store/side";

describe("MoveDeleterViewModel", () => {
  let move: Move;

  beforeEach(() => {
    move = new Move("", new RepertoirePosition("", "", Side.White));
  });

  describe("showDialog", () => {
    it("should start by not showing the dialog", async () => {
      const component = shallowMount(MoveDeleterViewModel, {
        render: jest.fn(),
        propsData: {
          move: move
        }
      });

      expect(component.vm.showDialog).toBeFalsy();
    });
  });

  describe("onDelete", () => {
    it("should emit onDelete with the move", () => {
      const component = shallowMount(MoveDeleterViewModel, {
        render: jest.fn(),
        propsData: {
          move: move
        }
      });

      component.vm.onDelete();

      expect(component.emitted().onDelete).toEqual([[move]]);
    });
  });
});
