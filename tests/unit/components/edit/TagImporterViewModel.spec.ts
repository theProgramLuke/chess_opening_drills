import { shallowMount, createLocalVue, Wrapper } from "@vue/test-utils";
import Vuex from "vuex";

import TagImporterViewModel from "@/components/edit/TagImporterViewModel.ts";
import { TagTree } from "@/store/repertoire/TagTree";
import { Repertoire } from "@/store/repertoire/Repertoire";
import { Side } from "@/store/side";

jest.mock("@/store/repertoire/TagTree");
jest.mock("@/store/repertoire/Repertoire");

describe("TagImporterViewModel", () => {
  const localVue = createLocalVue();
  localVue.use(Vuex);
  const mutations = {
    addPositionsFromPgn: jest.fn()
  };
  const store = new Vuex.Store({ mutations });

  let component: Wrapper<TagImporterViewModel>;
  let tag: TagTree;
  let repertoire: Repertoire;

  beforeEach(() => {
    tag = new TagTree("", "", []);
    repertoire = new Repertoire({
      training: {},
      positions: {},
      sideToTrain: Side.White,
      tags: new TagTree("", "", []).asSaved()
    });

    mutations.addPositionsFromPgn.mockClear();

    component = shallowMount(TagImporterViewModel, {
      localVue,
      store,
      render: jest.fn(),
      propsData: {
        tag,
        repertoire
      }
    });
  });

  describe("showDialog", () => {
    it("should start by not showing the dialog", () => {
      expect(component.vm.showDialog).toBeFalsy();
    });
  });

  describe("onImport", () => {
    const pgn = "pgn";
    let file: File;

    beforeEach(() => {
      file = new File([], "");

      const textPromise = new Promise<string>(f => f(pgn));
      file.text = jest.fn((): Promise<string> => textPromise);
    });

    it("should load the pgn", async () => {
      component.vm.inputFile = file;

      await component.vm.onImport();

      expect(mutations.addPositionsFromPgn).toBeCalledWith(expect.anything(), {
        repertoire,
        pgn
      });
    });

    it("should set the error message on an exception", async () => {
      component.vm.inputFile = file;
      const message = "message";
      (mutations.addPositionsFromPgn as jest.Mock).mockImplementation(() => {
        throw { message };
      });

      await component.vm.onImport();
      const actual = component.vm.inputFileErrors;

      expect(actual).toEqual(["Invalid PGN: message"]);
    });
  });

  describe("inputFileRules", () => {
    it("should be valid for a non empty string", () => {
      const actual = component.vm.inputFileRules[0]("not empty");

      expect(actual).toBeTruthy();
    });

    it("should be invalid for an empty string", () => {
      const actual = component.vm.inputFileRules[0]("");

      expect(actual).toEqual("Must specify a file to import.");
    });
  });
});
