import { shallowMount } from "@vue/test-utils";
import { saveAs } from "file-saver";

import TagExporterViewModel from "@/components/edit/TagExporterViewModel.ts";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { Side } from "@/store/side";
import { RepertoireTag } from "@/store/repertoireTag";

jest.mock("@/store/repertoirePosition");
jest.mock("@/store/repertoireTag");
jest.mock("file-saver");

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

describe("TagExporterViewModel", () => {
  describe("pgnText", () => {
    it("should get the pgn text of the position", () => {
      const pgnText = "some pgn text";
      const position = new RepertoirePosition("", "", Side.White);
      position.AsPgn = jest.fn(() => pgnText);
      const component = shallowMount(TagExporterViewModel, {
        render: jest.fn(),
        propsData: {
          tag: new RepertoireTag(Side.White, "", position, "", [])
        }
      });

      const actual = component.vm.pgnText;

      expect(actual).toEqual(pgnText);
    });
  });

  describe("save", () => {
    beforeEach(() => {
      (saveAs as jest.Mock).mockReset();
    });

    it("should save the pgn text", () => {
      const name = "name";
      const pgnText = "some pgn text";
      const position = new RepertoirePosition("", "", Side.White);
      position.AsPgn = jest.fn(() => pgnText);
      const component = shallowMount(TagExporterViewModel, {
        render: jest.fn(),
        propsData: {
          tag: new RepertoireTag(Side.White, name, position, "", [])
        }
      });

      component.vm.save();

      expect(saveAs).toBeCalledWith(
        new Blob([pgnText], { type: "text/plain;charset=utf-8" }),
        `Exported ${name}.pgn`
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
      const pgnText = "some pgn text";
      const position = new RepertoirePosition("", "", Side.White);
      position.AsPgn = jest.fn(() => pgnText);
      const component = shallowMount(TagExporterViewModel, {
        render: jest.fn(),
        propsData: {
          tag: new RepertoireTag(Side.White, "", position, "", [])
        }
      });

      component.vm.copy();

      expect(global.navigator.clipboard.writeText).toBeCalledWith(pgnText);
    });
  });
});
