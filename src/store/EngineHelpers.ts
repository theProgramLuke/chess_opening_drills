import { Engine } from "node-uci";

export interface EngineData {
  depth?: number;
  score?: {
    value: number;
  };
  pv?: string;
  multipv?: number;
}

export interface SourceEngineOption {
  type: "spin" | "check" | "combo" | "string" | "button";
  default: number | boolean | string;
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

export interface MetadataEngine extends Engine {
  options?: Map<string, SourceEngineOption>;
  id?: { name: string };
}

export async function GetMetadataFromEngine(
  enginePath: string
): Promise<EngineMetadata | undefined> {
  if (enginePath) {
    // Launch the engine with a dummy position to get the available options.
    const engine: MetadataEngine = new Engine(enginePath);

    await engine.init();
    await engine.position("7K/8/8/8/8/8/8/7k");
    await engine.go({ depth: 1 });

    if (engine.options && engine.id) {
      const options: EngineOption[] = [];
      engine.options.forEach((option, key) => {
        if (option.type !== "button") {
          option.value = option.default;
          options.push({
            name: key,
            ...option,
          });
        }
      });

      const result = {
        name: engine.id.name,
        filePath: enginePath,
        options,
      };

      await engine.quit();

      return result;
    }
  }

  return undefined;
}

export interface EngineOutput {
  evaluation: number;
  depth: number;
  variation: string[];
  id: number;
}

export function ProcessAnalysis(
  engineData: EngineData
): EngineOutput | undefined {
  if (
    engineData.depth &&
    engineData.score &&
    engineData.pv &&
    engineData.multipv
  ) {
    return {
      evaluation: engineData.score.value / 100,
      depth: engineData.depth,
      variation: engineData.pv.split(" "),
      id: engineData.multipv,
    };
  }

  return undefined;
}
