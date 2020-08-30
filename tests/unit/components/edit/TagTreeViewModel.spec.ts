import { shallowMount } from "@vue/test-utils";

import TagTreeViewModel from "@/components/edit/TagTreeViewModel.ts";
import { Repertoire } from "@/store/repertoire";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { Side } from "@/store/side";
import { RepertoireTag } from "@/store/repertoireTag";

describe("TagTreeViewModel", () => {
  let whiteRepertoire: Repertoire;
  let blackRepertoire: Repertoire;
  let activePosition: RepertoirePosition;

  beforeEach(() => {
    whiteRepertoire = new Repertoire(
      [],
      [
        new RepertoireTag(
          Side.White,
          "",
          new RepertoirePosition("", "", Side.White),
          "",
          []
        )
      ]
    );
    blackRepertoire = new Repertoire(
      [],
      [
        new RepertoireTag(
          Side.Black,
          "",
          new RepertoirePosition("", "", Side.Black),
          "",
          []
        )
      ]
    );
    activePosition = new RepertoirePosition("", "", Side.White);
  });

  describe("combinedTags", () => {
    it("should combine the white and black repertoire tags", () => {
      const component = shallowMount(TagTreeViewModel, {
        render: jest.fn(),
        propsData: {
          whiteRepertoire,
          blackRepertoire,
          activePosition
        }
      });

      expect(component.vm.combinedTags).toEqual([
        whiteRepertoire.tags[0],
        blackRepertoire.tags[0]
      ]);
    });
  });

  describe("onCreate", () => {
    it("should emit onCreate with the parent tag and name", () => {
      const parent = whiteRepertoire.tags[0];
      const name = "name";
      const component = shallowMount(TagTreeViewModel, {
        render: jest.fn(),
        propsData: {
          whiteRepertoire,
          blackRepertoire,
          activePosition
        }
      });

      component.vm.onCreate(parent, name);

      expect(component.emitted().onCreate).toEqual([[parent, name]]);
    });
  });

  describe("onDelete", () => {
    it("should emit onDelete with the tag", () => {
      const tag = whiteRepertoire.tags[0];
      const component = shallowMount(TagTreeViewModel, {
        render: jest.fn(),
        propsData: {
          whiteRepertoire,
          blackRepertoire,
          activePosition
        }
      });

      component.vm.onDelete(tag);

      expect(component.emitted().onDelete).toEqual([[tag]]);
    });
  });

  describe("onSelect", () => {
    it("should emit onSelect with the position", () => {
      const component = shallowMount(TagTreeViewModel, {
        render: jest.fn(),
        propsData: {
          whiteRepertoire,
          blackRepertoire,
          activePosition
        }
      });

      component.vm.onSelect(activePosition);

      expect(component.emitted().onSelect).toEqual([[activePosition]]);
    });
  });
});
