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
      name: "",
      training: {},
      positions: {},
      sideToTrain: Side.White,
      tags: []
    };

    whiteRepertoire = new Repertoire(emptyRepertoire);
    blackRepertoire = new Repertoire(emptyRepertoire);

    whiteRepertoire.tags = [];
    blackRepertoire.tags = [];
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
