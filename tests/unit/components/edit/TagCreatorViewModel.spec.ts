import { shallowMount } from "@vue/test-utils";

import TagCreatorViewModel from "@/components/edit/TagCreatorViewModel.ts";
import { RepertoireTag } from "@/store/repertoireTag";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { Side } from "@/store/side";

describe("TagCreatorViewModel", () => {
  let tag: RepertoireTag;
  let position: RepertoirePosition;

  beforeEach(() => {
    tag = new RepertoireTag(
      Side.White,
      "",
      new RepertoirePosition("", "", Side.White),
      "",
      []
    );

    position = new RepertoirePosition("", "", Side.White);
  });

  describe("showDialog", () => {
    it("should start by not showing the dialog", async () => {
      const component = shallowMount(TagCreatorViewModel, {
        render: jest.fn(),
        propsData: {
          parentTag: tag,
          activePosition: position
        }
      });

      expect(component.vm.showDialog).toBeFalsy();
    });
  });

  describe("disabled", () => {
    it("should be disabled if the position is not a child of the tag", async () => {
      tag.position.IsChildPosition = jest.fn(() => false);
      const component = shallowMount(TagCreatorViewModel, {
        render: jest.fn(),
        propsData: {
          parentTag: tag,
          activePosition: position
        }
      });

      expect(component.vm.disabled).toBeTruthy();
    });

    it("should not be disabled if the position is a child of the tag", async () => {
      tag.position.IsChildPosition = jest.fn(() => true);
      const component = shallowMount(TagCreatorViewModel, {
        render: jest.fn(),
        propsData: {
          parentTag: tag,
          activePosition: position
        }
      });

      expect(component.vm.disabled).toBeFalsy();
    });
  });

  describe("onCreate", () => {
    it("should emit onCreate when onCreate invoked given a valid form", async () => {
      const component = shallowMount(TagCreatorViewModel, {
        render: jest.fn(),
        propsData: {
          parentTag: tag,
          activePosition: position
        }
      });
      component.vm.validate = jest.fn(() => true);

      component.vm.onCreate();

      expect(component.emitted().onCreate).toEqual([
        [component.vm.parentTag, component.vm.name]
      ]);
    });

    it("should not emit onCreate when onCreate invoked given an invalid form", async () => {
      const component = shallowMount(TagCreatorViewModel, {
        render: jest.fn(),
        propsData: {
          parentTag: tag,
          activePosition: position
        }
      });
      component.vm.validate = jest.fn(() => false);

      component.vm.onCreate();

      expect(component.emitted().onCreate).toBeUndefined;
    });
  });

  describe("nameRules", () => {
    it("invalidates an empty name", async () => {
      const component = shallowMount(TagCreatorViewModel, {
        render: jest.fn(),
        propsData: {
          parentTag: tag,
          activePosition: position
        }
      });

      const valid = component.vm.nameRules[0]("");

      expect(valid).toEqual("Name is required");
    });

    it("validates a non empty name", async () => {
      const component = shallowMount(TagCreatorViewModel, {
        render: jest.fn(),
        propsData: {
          parentTag: tag,
          activePosition: position
        }
      });

      const valid = component.vm.nameRules[0]("some name");

      expect(valid).toBeTruthy();
    });
  });
});
