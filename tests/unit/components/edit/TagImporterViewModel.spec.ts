import { shallowMount, createLocalVue } from "@vue/test-utils";
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

  let tag: TagTree;
  let repertoire: Repertoire;

  beforeEach(() => {
    tag = new TagTree("", "", "", []);
    repertoire = new Repertoire({
      name: "",
      training: {},
      positions: {},
      sideToTrain: Side.White,
      tags: []
    });

    mutations.addPositionsFromPgn.mockClear();
  });

  describe("showDialog", () => {
    it("should start by not showing the dialog", () => {
      const component = shallowMount(TagImporterViewModel, {
        render: jest.fn(),
        propsData: {
          tag,
          repertoire
        }
      });

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
      const component = shallowMount(TagImporterViewModel, {
        localVue,
        store,
        render: jest.fn(),
        propsData: {
          tag,
          repertoire
        }
      });
      component.vm.inputFile = file;

      await component.vm.onImport();

      expect(mutations.addPositionsFromPgn).toBeCalledWith(expect.anything(), {
        repertoire,
        pgn
      });
    });
  });
});
