import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import { Engine } from "node-uci";

import EngineRecommendationsViewModel from "@/components/edit/EngineRecommendationsViewModel.ts";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { Side } from "@/store/side";

jest.mock("node-uci");
jest.mock("@/store/repertoirePosition");

const state = {
  engineMetadata: { filePath: "" }
};

const localVue = createLocalVue();
localVue.use(Vuex);
const store = new Vuex.Store({ state });

describe("EngineRecommendationsViewModel", () => {
  describe("activateEngine", () => {
    it("should start by not showing the dialog", async () => {
      const component = shallowMount(EngineRecommendationsViewModel, {
        localVue,
        store,
        render: jest.fn(),
        propsData: {
          activePosition: new RepertoirePosition("", "", Side.Black)
        }
      });
      component.vm.getNewEngine = jest.fn(() => {
        return new Engine("");
      });
      component.vm.startGettingEngineRecommendations = jest.fn();

      await component.vm.activateEngine(true);

      expect(component.vm.startGettingEngineRecommendations).toBeCalled();
    });
  });
});
