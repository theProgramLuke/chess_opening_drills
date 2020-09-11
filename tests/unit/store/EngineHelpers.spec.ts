import { Engine } from "node-uci";

import {
  GetMetadataFromEngine,
  MetadataEngine,
  EngineOption,
  SourceEngineOption
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

    const metadata = await GetMetadataFromEngine(filePath, createEngine);

    expect(createEngine).toBeCalledWith(filePath);
    expect(engine.init).toBeCalled();
    expect(engine.position).toBeCalledWith("7K/8/8/8/8/8/8/7k");
    expect(engine.go).toBeCalledWith({ depth: 1 });
    expect(engine.quit).toBeCalled();
    expect(metadata).toEqual({ filePath, name, options });
  });
});
