import { shallowMount } from "@vue/test-utils";

import TagCreatorViewModel from "@/components/edit/TagCreatorViewModel.ts";
import { TagTree } from "@/store/repertoire/TagTree";
import { Repertoire } from "@/store/repertoire/Repertoire";
import { PositionCollection } from "@/store/repertoire/PositionCollection";

jest.mock("@/store/repertoire/TagTree");
jest.mock("@/store/repertoire/Repertoire");
jest.mock("@/store/repertoire/PositionCollection");

describe("TagCreatorViewModel", () => {
  let tag: TagTree;
  let repertoire: Repertoire;
  const taggedPosition = "fen";

  beforeEach(() => {
    tag = new TagTree("", "", "", []);
    tag.fen = taggedPosition;
    repertoire = new Repertoire({
      positions: {},
      training: {},
      sideToTrain: 0,
      tags: new TagTree("", "", "", [])
    });
    repertoire.positions = new PositionCollection({});
  });

  describe("showDialog", () => {
    it("should start by not showing the dialog", () => {
      const component = shallowMount(TagCreatorViewModel, {
        render: jest.fn(),
        propsData: {
          repertoire,
          parentTag: tag,
          activePosition: taggedPosition
        }
      });

      expect(component.vm.showDialog).toBeFalsy();
    });
  });

  describe("disabled", () => {
    it("should be disabled if the position is not a child of the tagged position", () => {
      (repertoire.positions.descendantPositions as jest.Mock).mockReturnValue(
        []
      );
      const component = shallowMount(TagCreatorViewModel, {
        render: jest.fn(),
        propsData: {
          repertoire,
          parentTag: tag,
          activePosition: "not a descendant"
        }
      });

      expect(component.vm.disabled).toBeTruthy();
    });

    it("should not be disabled if the active position is a child of the tagged position", () => {
      const childFen = "childFen";
      (repertoire.positions.descendantPositions as jest.Mock).mockReturnValue([
        childFen
      ]);
      const component = shallowMount(TagCreatorViewModel, {
        render: jest.fn(),
        propsData: {
          repertoire,
          parentTag: tag,
          activePosition: childFen
        }
      });

      expect(component.vm.disabled).toBeFalsy();
    });

    it("should not be disabled if the active position is the tagged position", () => {
      (repertoire.positions.descendantPositions as jest.Mock).mockReturnValue(
        []
      );
      const component = shallowMount(TagCreatorViewModel, {
        render: jest.fn(),
        propsData: {
          repertoire,
          parentTag: tag,
          activePosition: taggedPosition
        }
      });

      expect(component.vm.disabled).toBeFalsy();
    });
  });

  describe("onCreate", () => {
    it("should emit onCreate when onCreate invoked given a valid form", () => {
      const component = shallowMount(TagCreatorViewModel, {
        render: jest.fn(),
        propsData: {
          repertoire,
          parentTag: tag,
          activePosition: taggedPosition
        }
      });
      component.vm.validate = jest.fn(() => true);

      component.vm.onCreate();

      expect(component.emitted().onCreate).toEqual([
        [component.vm.parentTag, component.vm.name]
      ]);
    });

    it("should not emit onCreate when onCreate invoked given an invalid form", () => {
      const component = shallowMount(TagCreatorViewModel, {
        render: jest.fn(),
        propsData: {
          repertoire,
          parentTag: tag,
          activePosition: taggedPosition
        }
      });
      component.vm.validate = jest.fn(() => false);

      component.vm.onCreate();

      expect(component.emitted().onCreate).toBeUndefined;
    });
  });

  describe("nameRules", () => {
    it("invalidates an empty name", () => {
      const component = shallowMount(TagCreatorViewModel, {
        render: jest.fn(),
        propsData: {
          repertoire,
          parentTag: tag,
          activePosition: taggedPosition
        }
      });

      const valid = component.vm.nameRules[0]("");

      expect(valid).toEqual("Name is required");
    });

    it("validates a non empty name", () => {
      const component = shallowMount(TagCreatorViewModel, {
        render: jest.fn(),
        propsData: {
          repertoire,
          parentTag: tag,
          activePosition: taggedPosition
        }
      });

      const valid = component.vm.nameRules[0]("some name");

      expect(valid).toBeTruthy();
    });
  });
});
