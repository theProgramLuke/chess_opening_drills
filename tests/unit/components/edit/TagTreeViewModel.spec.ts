import { shallowMount } from "@vue/test-utils";

import TagTreeViewModel from "@/components/edit/TagTreeViewModel.ts";
import { Repertoire, SavedRepertoire } from "@/store/repertoire/Repertoire";
import { TagTree } from "@/store/repertoire/TagTree";
import { Side } from "@/store/side";

jest.mock("@/store/repertoire/Repertoire");
jest.mock("@/store/repertoire/TagTree");

describe("TagTreeViewModel", () => {
  let whiteRepertoire: Repertoire;
  let blackRepertoire: Repertoire;
  const activePosition = "some fen";

  beforeEach(() => {
    const emptyRepertoire: SavedRepertoire = {
      training: {},
      positions: {},
      sideToTrain: Side.White,
      tags: { name: "", fen: "", id: "", children: [] }
    };

    whiteRepertoire = new Repertoire(emptyRepertoire);
    blackRepertoire = new Repertoire(emptyRepertoire);

    whiteRepertoire.tags = new TagTree("", "", "", []);
    blackRepertoire.tags = new TagTree("", "", "", []);
  });

  describe("repertoires", () => {
    it("should be the white and black repertoires", () => {
      const component = shallowMount(TagTreeViewModel, {
        render: jest.fn(),
        propsData: {
          whiteRepertoire,
          blackRepertoire,
          activePosition
        }
      });

      const actual = component.vm.repertoires;

      expect(actual).toEqual([whiteRepertoire, blackRepertoire]);
    });
  });

  describe("onCreate", () => {
    it("should emit onCreate with the parent tag and name", () => {
      const parent = whiteRepertoire.tags;
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
      const tag = whiteRepertoire.tags;
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
