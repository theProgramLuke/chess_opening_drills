import { shallowMount, createLocalVue, Wrapper } from "@vue/test-utils";
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

  let component: Wrapper<EngineRecommendationsViewModel>;
  let engine: Engine;
  let goInfiniteEmitter: EventEmitter;

  function mountComponent(): Wrapper<EngineRecommendationsViewModel> {
    return shallowMount(EngineRecommendationsViewModel, {
      localVue,
      store,
      render: jest.fn(),
      propsData: {
        activePosition,
      },
    });
  }

  beforeEach(() => {
    engine = new Engine("");
    goInfiniteEmitter = new EventEmitter();
    goInfiniteEmitter.on = jest.fn();
    engine.goInfinite = jest.fn(() => goInfiniteEmitter);
    engine.position = jest.fn();
    engine.stop = jest.fn().mockResolvedValue(true);
    (Engine as jest.Mock).mockImplementation(() => engine);

    component = mountComponent();
  });

  describe("activateEngine", () => {
    it("active=true should start an engine with the saved options", async () => {
      const options: EngineOption[] = [
        { name: "name0", value: "value0", type: "string", default: "" },
        { name: "name1", value: "value1", type: "string", default: "" },
      ];
      component.vm.engineMetadata.options = options;
      component.vm.startGettingEngineRecommendations = jest.fn();

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

    it("active=true should quit a running engine", async () => {
      component.vm.engine = engine;

      await component.vm.activateEngine(true);

      expect(engine.quit).toBeCalled();
    });

    it("active=false should quit the running engine", async () => {
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

    it("should start getting engine recommendations when changed", async () => {
      component.vm.startGettingEngineRecommendations = jest.fn();

      await component.setProps({ activePosition: "new position" });

      expect(component.vm.startGettingEngineRecommendations).toBeCalled();
    });
  });

  describe("startGettingEngineRecommendations", () => {
    it("should set the engine position and receive recommendations", async () => {
      component.vm.engine = engine;
      component.vm.receiveRecommendation = jest.fn();
      goInfiniteEmitter.on = jest.fn((_name: string, fn: Function) => fn());

      await component.vm.startGettingEngineRecommendations();

      expect(component.vm.engine.position).toBeCalledWith(activePosition);
      expect(component.vm.receiveRecommendation).toBeCalled();
    });

    it("should not set the engine position and receive recommendations when there is no engine", async () => {
      component.vm.engine = undefined;
      component.vm.receiveRecommendation = jest.fn();

      await component.vm.startGettingEngineRecommendations();

      expect(component.vm.receiveRecommendation).not.toBeCalled();
    });

    it("should stop the engine if it is already has recommendations", async () => {
      component.vm.engine = engine;
      component.vm.engineRecommendations = [undefined];

      await component.vm.startGettingEngineRecommendations();

      expect(engine.stop).toBeCalled();
    });
  });

  describe("receiveRecommendation", () => {
    it("should not invoke sorter if data is not processed", () => {
      const sorter = jest.fn();

      component.vm.receiveRecommendation({}, sorter, () => undefined);

      expect(sorter).not.toBeCalled();
    });

    it("should set the indexed engineRecommendations and invoke sorter", () => {
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
      const engine = new Engine("");
      component.vm.engine = engine;

      component.destroy();

      expect(engine.quit).toBeCalled();
    });
  });
});
