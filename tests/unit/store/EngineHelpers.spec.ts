import _ from "lodash";
import { Engine } from "node-uci";

import {
  GetMetadataFromEngine,
  MetadataEngine,
  EngineOption,
  SourceEngineOption,
  ProcessAnalysis
} from "@/store/EngineHelpers";

jest.mock("node-uci");

describe("GetEngineMetadata", () => {
  it("should get the engine metadata", async () => {
    const engine: MetadataEngine = new Engine("");
    const filePath = "filePath";
    const name = "name";
    const options: EngineOption[] = [
      { name: "option", type: "spin", default: 0, value: 0 },
      { name: "option2", type: "check", default: false, value: false }
    ];
    engine.id = { name };
    engine.options = new Map<string, SourceEngineOption>();
    engine.options.set(options[0].name, options[0]);
    engine.options.set(options[1].name, options[1]);
    const createEngine = jest.fn(() => engine);
    (Engine as jest.Mock).mockImplementationOnce(createEngine);

    const metadata = await GetMetadataFromEngine(filePath);

    expect(createEngine).toBeCalledWith(filePath);
    expect(engine.init).toBeCalled();
    expect(engine.position).toBeCalledWith("7K/8/8/8/8/8/8/7k");
    expect(engine.go).toBeCalledWith({ depth: 1 });
    expect(engine.quit).toBeCalled();
    expect(metadata).toEqual({ filePath, name, options });
  });

  it("should not include button options", async () => {
    const engine: MetadataEngine = new Engine("");
    const expectedOptions: EngineOption[] = [
      { name: "option", type: "spin", default: 0, value: 0 },
      { name: "option2", type: "check", default: false, value: false }
    ];
    const options = _.cloneDeep(expectedOptions);
    options.push({
      name: "option3",
      type: "button",
      default: false,
      value: false
    });
    engine.id = { name: name };
    engine.options = new Map<string, SourceEngineOption>();
    engine.options.set(options[0].name, options[0]);
    engine.options.set(options[1].name, options[1]);
    engine.options.set(options[2].name, options[2]);
    const createEngine = jest.fn(() => engine);
    (Engine as jest.Mock).mockImplementationOnce(createEngine);

    const metadata = await GetMetadataFromEngine("path");

    expect(metadata).toBeDefined();
    if (metadata) {
      expect(metadata.options).toEqual(expectedOptions);
    }
  });

  it("should be undefined if the engine does not have options", async () => {
    const engine: MetadataEngine = new Engine("");
    engine.options = undefined;
    engine.id = { name: "name" };
    (Engine as jest.Mock).mockImplementationOnce(() => engine);

    const metadata = await GetMetadataFromEngine("path");

    expect(metadata).toBeUndefined();
  });

  it("should be undefined if the engine does not have options", async () => {
    const engine: MetadataEngine = new Engine("");
    engine.options = undefined;
    engine.id = { name: "name" };
    (Engine as jest.Mock).mockImplementationOnce(() => engine);

    const metadata = await GetMetadataFromEngine("path");

    expect(metadata).toBeUndefined();
  });

  it("should be undefined if the engine path is empty", async () => {
    const engine: MetadataEngine = new Engine("");
    engine.options = new Map();
    engine.id = { name: "name" };
    (Engine as jest.Mock).mockImplementationOnce(() => engine);

    const metadata = await GetMetadataFromEngine("");

    expect(metadata).toBeUndefined();
  });
});

describe("ProcessAnalysis", () => {
  it("should process the engine output", () => {
    const variation = ["a2a3", "g8f6"];
    const engineData = {
      score: { value: 350 },
      depth: 10,
      pv: variation.join(" "),
      multipv: 3
    };
    const expected = {
      evaluation: engineData.score.value / 100,
      depth: engineData.depth,
      variation,
      id: engineData.multipv
    };

    const actual = ProcessAnalysis(engineData);

    expect(actual).toEqual(expected);
  });

  it("should be undefined if not given the depth", () => {
    const actual = ProcessAnalysis({ score: { value: 10 }, pv: ["a2a3"] });

    expect(actual).toBeUndefined();
  });

  it("should be undefined if not given the score", () => {
    const actual = ProcessAnalysis({ depth: 10, pv: ["a2a3"] });

    expect(actual).toBeUndefined();
  });

  it("should be undefined if not given the variation", () => {
    const actual = ProcessAnalysis({ score: { value: 10 }, depth: 10 });

    expect(actual).toBeUndefined();
  });
});
