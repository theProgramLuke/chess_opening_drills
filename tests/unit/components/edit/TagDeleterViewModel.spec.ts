import { shallowMount } from "@vue/test-utils";

import TagDeleterViewModel from "@/components/edit/TagDeleterViewModel";
import { TagTree } from "@/store/repertoire/TagTree";

jest.mock("@/store/repertoire/TagTree");

describe("TagDeleterViewModel", () => {
  let tag: TagTree;

  beforeEach(() => {
    tag = new TagTree("", "", []);
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

      expect(component.emitted().onDelete).toEqual([[{ id: tag.id }]]);
    });

    it("should set showDialog to false", () => {
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
