import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import { Engine } from "node-uci";
import { EventEmitter } from "events";

import EngineRecommendationsViewModel from "@/components/edit/EngineRecommendationsViewModel.ts";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { Side } from "@/store/side";

jest.mock("node-uci");
jest.mock("events");
jest.mock("@/store/repertoirePosition");

const state = {
  engineMetadata: { filePath: "", options: [{ name: "", value: "value" }] }
};

const localVue = createLocalVue();
localVue.use(Vuex);
const store = new Vuex.Store({ state });

describe("EngineRecommendationsViewModel", () => {
  describe("activateEngine", () => {
    it("active=true should start an engine with the saved options", async () => {
      const component = shallowMount(EngineRecommendationsViewModel, {
        localVue,
        store,
        render: jest.fn(),
        propsData: {
          activePosition: new RepertoirePosition("", "", Side.Black)
        }
      });
      const engine = new Engine("");
      const createEngine = jest.fn(() => {
        return engine;
      });
      component.vm.startGettingEngineRecommendations = jest.fn();

      await component.vm.activateEngine(true, createEngine);

      expect(createEngine).toBeCalled();
      expect(engine.setoption).toBeCalled();
      expect(component.vm.startGettingEngineRecommendations).toBeCalled();
    });

    it("active=false should quit the running engine", async () => {
      const component = shallowMount(EngineRecommendationsViewModel, {
        localVue,
        store,
        render: jest.fn(),
        propsData: {
          activePosition: new RepertoirePosition("", "", Side.Black)
        }
      });
      const engine = new Engine("");
      const createEngine = jest.fn(() => {
        return engine;
      });
      engine.quit = jest.fn(async () => engine);
      component.vm.engine = engine;

      await component.vm.activateEngine(false, createEngine);

      expect(engine.quit).toBeCalled();
      expect(component.vm.engine).toBeUndefined();
      expect(createEngine).not.toBeCalled();
    });
  });

  describe("startGettingEngineRecommendations", () => {
    it("should set the engine position and receive recommendations", async () => {
      const component = shallowMount(EngineRecommendationsViewModel, {
        localVue,
        store,
        render: jest.fn(),
        propsData: {
          activePosition: new RepertoirePosition("", "", Side.Black)
        }
      });
      const fen = "some fen";
      component.vm.activePosition.fen = fen;
      const emitter = new EventEmitter();
      component.vm.engine = new Engine("");
      component.vm.engine.goInfinite = jest.fn(() => emitter);
      emitter.on = jest.fn((_name: string, fn: Function) => fn());
      component.vm.receiveRecommendation = jest.fn();

      await component.vm.startGettingEngineRecommendations();

      expect(component.vm.engine.position).toBeCalledWith(fen);
      expect(component.vm.receiveRecommendation).toBeCalled();
    });
  });

  describe("receiveRecommendation", () => {
    it("should not invoke sorter if data is not processed", () => {
      const component = shallowMount(EngineRecommendationsViewModel, {
        localVue,
        store,
        render: jest.fn(),
        propsData: {
          activePosition: new RepertoirePosition("", "", Side.Black)
        }
      });
      const sorter = jest.fn();

      component.vm.receiveRecommendation({}, sorter, () => undefined);

      expect(sorter).not.toBeCalled();
    });

    it("should set the indexed engineRecommendations and invoke sorter", () => {
      const component = shallowMount(EngineRecommendationsViewModel, {
        localVue,
        store,
        render: jest.fn(),
        propsData: {
          activePosition: new RepertoirePosition("", "", Side.Black)
        }
      });
      const sorter = jest.fn();
      const recommendation = {
        id: 4,
        evaluation: 0,
        depth: 0,
        variation: []
      };

      component.vm.receiveRecommendation({}, sorter, () => recommendation);

      expect(sorter).toBeCalled();
      expect(component.vm.engineRecommendations).toEqual([
        undefined,
        undefined,
        undefined,
        recommendation
      ]);
    });
  });

  describe("sortEngineRecommendations", () => {
    it("should set sort the defined recommendations by depth then evaluation", () => {
      const component = shallowMount(EngineRecommendationsViewModel, {
        localVue,
        store,
        render: jest.fn(),
        propsData: {
          activePosition: new RepertoirePosition("", "", Side.Black)
        }
      });
      const recommendations = [
        {
          id: 1,
          evaluation: 0,
          depth: 1,
          variation: []
        },
        undefined,
        {
          id: 3,
          evaluation: 1,
          depth: 2,
          variation: []
        },
        {
          id: 4,
          evaluation: 0,
          depth: 2,
          variation: []
        }
      ];
      component.vm.engineRecommendations = recommendations;

      component.vm.sortEngineRecommendations();

      expect(component.vm.sortedEngineRecommendations).toEqual([
        recommendations[2],
        recommendations[3],
        recommendations[0]
      ]);
    });

    it("should invert the evaluation order for black", () => {
      const component = shallowMount(EngineRecommendationsViewModel, {
        localVue,
        store,
        render: jest.fn(),
        propsData: {
          activePosition: new RepertoirePosition("", "", Side.Black)
        }
      });
      const recommendations = [
        {
          id: 1,
          evaluation: 0,
          depth: 1,
          variation: []
        },
        undefined,
        {
          id: 3,
          evaluation: 1,
          depth: 2,
          variation: []
        },
        {
          id: 4,
          evaluation: 0,
          depth: 2,
          variation: []
        }
      ];
      component.vm.engineRecommendations = recommendations;
      component.vm.activePosition.SideToMove = () => Side.Black;

      component.vm.sortEngineRecommendations();

      expect(component.vm.sortedEngineRecommendations).toEqual([
        recommendations[3],
        recommendations[2],
        recommendations[0]
      ]);
    });
  });

  describe("destroy", () => {
    it("should quit the engine", () => {
      const component = shallowMount(EngineRecommendationsViewModel, {
        localVue,
        store,
        render: jest.fn(),
        propsData: {
          activePosition: new RepertoirePosition("", "", Side.Black)
        }
      });
      const engine = new Engine("");
      component.vm.engine = engine;

      component.destroy();

      expect(engine.quit).toBeCalled();
    });
  });
});
