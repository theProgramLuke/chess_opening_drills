import _ from "lodash";
import Vue from "vue";
import Vuex from "vuex";
import { Wrapper, shallowMount, createLocalVue } from "@vue/test-utils";

import RepertoireHealthViewModel from "@/views/RepertoireHealthViewModel";
import { Repertoire } from "@/store/repertoire/Repertoire";
import { Side } from "@/store/side";

jest.mock("@/store/repertoire/Repertoire");

describe("RepertoireHealthViewModel", () => {
  let component: Wrapper<RepertoireHealthViewModel>;
  let whiteRepertoire: Repertoire;
  let blackRepertoire: Repertoire;

  function mountComponent(): Wrapper<RepertoireHealthViewModel> {
    const localVue = createLocalVue();
    localVue.use(Vuex);

    const state = { whiteRepertoire, blackRepertoire };
    const store = new Vuex.Store({ state });

    return shallowMount(RepertoireHealthViewModel, {
      render: jest.fn(),
      localVue,
      store,
    });
  }

  beforeEach(() => {
    const emptyRepertoire = {
      positions: {},
      training: {},
      tags: {
        name: "",
        id: "",
        fen: "",
        children: [],
        isRootTag: false,
      },
      sideToTrain: Side.White,
    };

    whiteRepertoire = new Repertoire(emptyRepertoire);
    blackRepertoire = new Repertoire(emptyRepertoire);

    component = mountComponent();
  });

  describe("positionsWithMultipleMovesToTrain", () => {
    it(
      "should be the positions with multiple moves to train from both repertoires",
      _.noop
    );
  });
});
