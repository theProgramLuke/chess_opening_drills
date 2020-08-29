import { shallowMount } from "@vue/test-utils";

import TagDeleterViewModel from "@/components/edit/TagDeleterViewModel.ts";
import { RepertoireTag } from "@/store/repertoireTag";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { Side } from "@/store/side";

describe("TagDeleterViewModel", () => {
  let tag: RepertoireTag;

  beforeEach(() => {
    tag = new RepertoireTag(
      Side.White,
      "",
      new RepertoirePosition("", "", Side.White),
      "",
      []
    );
  });

  describe("showDialog", () => {
    it("should start by not showing the dialog", () => {
      const component = shallowMount(TagDeleterViewModel, {
        render: jest.fn(),
        propsData: {
          tag: tag
        }
      });

      expect(component.vm.showDialog).toBeFalsy();
    });
  });

  describe("onDelete", () => {
    it("should emit onDelete with the tag", () => {
      const component = shallowMount(TagDeleterViewModel, {
        render: jest.fn(),
        propsData: {
          tag: tag
        }
      });

      component.vm.onDelete();

      expect(component.emitted().onDelete).toEqual([[tag]]);
    });

    it("should reset showDialog to false", () => {
      const component = shallowMount(TagDeleterViewModel, {
        render: jest.fn(),
        propsData: {
          tag: tag
        }
      });
      component.vm.showDialog = true;

      component.vm.onDelete();

      expect(component.vm.showDialog).toBeFalsy();
    });
  });
});
