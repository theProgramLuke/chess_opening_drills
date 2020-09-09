import _ from "lodash";
import { Engine } from "node-uci";

interface SourceEngineOption {
  type: "spin" | "check" | "combo" | "string" | "button";
  value: number | boolean | string;
  min?: number;
  max?: number;
  options?: string[];
}

export interface EngineOption extends SourceEngineOption {
  name: string;
}

export interface EngineMetadata {
  name: string;
  filePath: string;
  options: EngineOption[];
}

interface MetadataEngine extends Engine {
  options?: Map<string, SourceEngineOption>;
  id?: { name: string };
}

export async function GetMetadataFromEngine(
  enginePath: string
): Promise<EngineMetadata | undefined> {
  // Launch the engine with a dummy position to get the available options.
  const engine: MetadataEngine = new Engine(enginePath);

  await engine.init();
  await engine.position("7K/8/8/8/8/8/8/7k");
  await engine.go({ depth: 1 });

  console.log(engine);

  if (engine.options && engine.id) {
    const options: EngineOption[] = [];
    engine.options.forEach((value, key) => {
      if (value.type !== "button" && key !== "MultiPV") {
        options.push({
          name: key,
          ...value
        });
      }
    });

    return {
      name: engine.id.name,
      filePath: enginePath,
      options
    };
  }

  return undefined;
}
