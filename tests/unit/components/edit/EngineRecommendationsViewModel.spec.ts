import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import { Engine } from "node-uci";
import { EventEmitter } from "events";

import EngineRecommendationsViewModel from "@/components/edit/EngineRecommendationsViewModel.ts";
import { sideFromFen } from "@/store/repertoire/chessHelpers";
import { EngineOption } from "@/store/EngineHelpers";
import { Side } from "@/store/side";

jest.mock("node-uci");
jest.mock("events");
jest.mock("@/store/repertoire/chessHelpers");

const state = {
  engineMetadata: { filePath: "", options: [{ name: "", value: "value" }] },
};
const localVue = createLocalVue();
localVue.use(Vuex);
const store = new Vuex.Store({ state });

describe("EngineRecommendationsViewModel", () => {
  const activePosition = "some fen";
  describe("activateEngine", () => {
    it("active=true should start an engine with the saved options", async () => {
      const component = shallowMount(EngineRecommendationsViewModel, {
        localVue,
        store,
        render: jest.fn(),
        propsData: {
          activePosition,
        },
      });
      const options: EngineOption[] = [
        { name: "name0", value: "value0", type: "string", default: "" },
        { name: "name1", value: "value1", type: "string", default: "" },
      ];
      component.vm.engineMetadata.options = options;
      component.vm.startGettingEngineRecommendations = jest.fn();
      const engine = new Engine("");
      (Engine as jest.Mock).mockImplementationOnce(() => engine);

      await component.vm.activateEngine(true);

      expect(component.vm.startGettingEngineRecommendations).toBeCalled();
      expect(engine.setoption).toHaveBeenNthCalledWith(
        1,
        options[0].name,
        options[0].value
      );
      expect(engine.setoption).toHaveBeenNthCalledWith(
        2,
        options[1].name,
        options[1].value
      );
    });

    it("active=false should quit the running engine", async () => {
      const component = shallowMount(EngineRecommendationsViewModel, {
        localVue,
        store,
        render: jest.fn(),
        propsData: {
          activePosition,
        },
      });
      const engine = new Engine("");
      const createEngine = jest.fn(() => {
        return engine;
      });
      engine.quit = jest.fn(async () => engine);
      component.vm.engine = engine;

      await component.vm.activateEngine(false);

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
          activePosition,
        },
      });
      const emitter = new EventEmitter();
      component.vm.engine = new Engine("");
      component.vm.engine.goInfinite = jest.fn(() => emitter);
      emitter.on = jest.fn((_name: string, fn: Function) => fn());
      component.vm.receiveRecommendation = jest.fn();

      await component.vm.startGettingEngineRecommendations();

      expect(component.vm.engine.position).toBeCalledWith(activePosition);
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
          activePosition,
        },
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
          activePosition,
        },
      });
      const sorter = jest.fn();
      const recommendation = {
        id: 4,
        evaluation: 0,
        depth: 0,
        variation: [],
      };

      component.vm.receiveRecommendation({}, sorter, () => recommendation);

      expect(sorter).toBeCalled();
      expect(component.vm.engineRecommendations).toEqual([
        undefined,
        undefined,
        undefined,
        recommendation,
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
          activePosition,
        },
      });
      const recommendations = [
        {
          id: 1,
          evaluation: 0,
          depth: 1,
          variation: [],
        },
        undefined,
        {
          id: 3,
          evaluation: 1,
          depth: 2,
          variation: [],
        },
        {
          id: 4,
          evaluation: 0,
          depth: 2,
          variation: [],
        },
      ];
      component.vm.engineRecommendations = recommendations;

      component.vm.sortEngineRecommendations();

      expect(component.vm.sortedEngineRecommendations).toEqual([
        recommendations[2],
        recommendations[3],
        recommendations[0],
      ]);
    });

    it("should invert the evaluation order for black", () => {
      (sideFromFen as jest.Mock).mockReturnValue(Side.Black);
      const component = shallowMount(EngineRecommendationsViewModel, {
        localVue,
        store,
        render: jest.fn(),
        propsData: {
          activePosition,
        },
      });
      const recommendations = [
        {
          id: 1,
          evaluation: 0,
          depth: 1,
          variation: [],
        },
        undefined,
        {
          id: 3,
          evaluation: 1,
          depth: 2,
          variation: [],
        },
        {
          id: 4,
          evaluation: 0,
          depth: 2,
          variation: [],
        },
      ];
      component.vm.engineRecommendations = recommendations;

      component.vm.sortEngineRecommendations();

      expect(component.vm.sortedEngineRecommendations).toEqual([
        recommendations[3],
        recommendations[2],
        recommendations[0],
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
          activePosition,
        },
      });
      const engine = new Engine("");
      component.vm.engine = engine;

      component.destroy();

      expect(engine.quit).toBeCalled();
    });
  });
});
