import { shallowMount } from "@vue/test-utils";
import { saveAs } from "file-saver";

import TagExporterViewModel from "@/components/edit/TagExporterViewModel.ts";
import { Repertoire } from "@/store/repertoire/Repertoire";
import { Side } from "@/store/side";
import { PositionCollection } from "@/store/repertoire/PositionCollection";
import { TagTree } from "@/store/repertoire/TagTree";
import { Writeable } from "../../../TestHelpers";

jest.mock("@/store/repertoire/TagTree");
jest.mock("@/store/repertoire/Repertoire");
jest.mock("@/store/repertoire/PositionCollection");
jest.mock("file-saver");

describe("TagExporterViewModel", () => {
  const pgnText = "some pgn text";
  const tagName = "tag name";
  const tagPosition = "some fen";

  let repertoire: Repertoire;
  let tag: TagTree;

  beforeEach(() => {
    tag = new TagTree("", "", []);
    tag.name = tagName;
    tag.fen = tagPosition;

    repertoire = new Repertoire({
      training: {},
      positions: {},
      tags: new TagTree("", "", []),
      sideToTrain: Side.White
    });
    repertoire.positions = new PositionCollection({});
    (repertoire.positions.asPgn as jest.Mock).mockReturnValue(pgnText);
  });

  describe("pgnText", () => {
    it("should get the pgn text from the position", () => {
      const component = shallowMount(TagExporterViewModel, {
        render: jest.fn(),
        propsData: {
          tag,
          repertoire
        }
      });

      const actual = component.vm.pgnText;

      expect(actual).toEqual(pgnText);
      expect(repertoire.positions.asPgn).toBeCalledWith(tagPosition);
    });
  });

  describe("save", () => {
    beforeEach(() => {
      (saveAs as jest.Mock).mockReset();
    });

    it("should save the pgn text", () => {
      const component = shallowMount(TagExporterViewModel, {
        render: jest.fn(),
        propsData: {
          tag,
          repertoire
        }
      });

      component.vm.save();

      expect(saveAs).toBeCalledWith(
        new Blob([pgnText], { type: "text/plain;charset=utf-8" }),
        `Exported ${tagName}.pgn`
      );
    });
  });

  describe("copy", () => {
    beforeEach(() => {
      (global.navigator as Writeable<Navigator>).clipboard = {
        addEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
        readText: jest.fn(),
        removeEventListener: jest.fn(),
        writeText: jest.fn()
      };
    });

    it("should copy the pgn text", () => {
      const component = shallowMount(TagExporterViewModel, {
        render: jest.fn(),
        propsData: {
          tag,
          repertoire
        }
      });

      component.vm.copy();

      expect(global.navigator.clipboard.writeText).toBeCalledWith(pgnText);
    });
  });
});
