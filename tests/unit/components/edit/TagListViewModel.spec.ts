import { shallowMount } from "@vue/test-utils";

import TagListViewModel from "@/components/edit/TagListViewModel";
import { Repertoire, SavedRepertoire } from "@/store/repertoire/Repertoire";
import { TagTree } from "@/store/repertoire/TagTree";
import { Side } from "@/store/side";

jest.mock("@/store/repertoire/Repertoire");
jest.mock("@/store/repertoire/TagTree");

describe("TagListViewModel", () => {
  let whiteRepertoire: Repertoire;
  let blackRepertoire: Repertoire;
  const activePosition = "some fen";

  beforeEach(() => {
    const emptyRepertoire: SavedRepertoire = {
      training: {},
      positions: {},
      sideToTrain: Side.White,
      tags: { name: "", fen: "", id: "", children: [], isRootTag: false },
    };

    whiteRepertoire = new Repertoire(emptyRepertoire);
    blackRepertoire = new Repertoire(emptyRepertoire);

    whiteRepertoire.tags = new TagTree("", "", []);
    blackRepertoire.tags = new TagTree("", "", []);
  });

  describe("repertoires", () => {
    it("should be the white and black repertoires", () => {
      const component = shallowMount(TagListViewModel, {
        render: jest.fn(),
        propsData: {
          whiteRepertoire,
          blackRepertoire,
          activePosition,
        },
      });

      const actual = component.vm.repertoires;

      expect(actual).toEqual([whiteRepertoire, blackRepertoire]);
    });
  });

  describe("onCreate", () => {
    it("should emit onCreate", () => {
      const component = shallowMount(TagListViewModel, {
        render: jest.fn(),
        propsData: {
          whiteRepertoire,
          blackRepertoire,
          activePosition,
        },
      });

      component.vm.onCreate();

      expect(component.emitted().onCreate).toEqual([[]]);
    });
  });

  describe("onDelete", () => {
    it("should emit onDelete", () => {
      const component = shallowMount(TagListViewModel, {
        render: jest.fn(),
        propsData: {
          whiteRepertoire,
          blackRepertoire,
          activePosition,
        },
      });

      component.vm.onDelete();

      expect(component.emitted().onDelete).toEqual([[]]);
    });
  });

  describe("onSelect", () => {
    it("should emit onSelect with the position", () => {
      const component = shallowMount(TagListViewModel, {
        render: jest.fn(),
        propsData: {
          whiteRepertoire,
          blackRepertoire,
          activePosition,
        },
      });

      component.vm.onSelect(whiteRepertoire, activePosition);

      expect(component.emitted().onSelect).toEqual([
        [whiteRepertoire, activePosition],
      ]);
    });
  });
});
