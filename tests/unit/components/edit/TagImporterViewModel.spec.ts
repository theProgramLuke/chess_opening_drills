import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";

import TagImporterViewModel from "@/components/edit/TagImporterViewModel.ts";
import { RepertoireTag } from "@/store/repertoireTag";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { Side } from "@/store/side";

describe("TagImporterViewModel", () => {
  const localVue = createLocalVue();
  localVue.use(Vuex);

  let tag: RepertoireTag;

  const mutations = {
    addPositionsFromGame: jest.fn()
  };
  const store = new Vuex.Store({ mutations });

  beforeEach(() => {
    tag = new RepertoireTag(
      Side.White,
      "",
      new RepertoirePosition("", "", Side.White),
      "",
      []
    );

    mutations.addPositionsFromGame.mockClear();
  });

  describe("showDialog", () => {
    it("should start by not showing the dialog", () => {
      const component = shallowMount(TagImporterViewModel, {
        render: jest.fn(),
        propsData: {
          tag: tag
        }
      });

      expect(component.vm.showDialog).toBeFalsy();
    });
  });

  describe("onImport", () => {
    const pgn = "pgn";
    const pgnGames = [
      {
        commentsAboveHeader: "",
        headers: [],
        comments: "",
        moves: [],
        result: ""
      }
    ];
    const mockFile = new File([], "");

    it("should load the pgn", async () => {
      const component = shallowMount(TagImporterViewModel, {
        localVue,
        store,
        render: jest.fn(),
        propsData: {
          tag: tag
        }
      });
      const textPromise = new Promise<string>(f => f(pgn));
      mockFile.text = jest.fn((): Promise<string> => textPromise);
      component.vm.inputFile = mockFile;
      component.vm.pgnParser = jest.fn(() => pgnGames);

      await component.vm.onImport();

      expect(mutations.addPositionsFromGame).toBeCalledWith(expect.anything(), {
        game: pgnGames[0],
        forSide: tag.forSide
      });
    });
  });
});
