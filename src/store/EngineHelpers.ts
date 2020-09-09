import _ from "lodash";
import { Engine } from "node-uci";

interface SourceEngineOption {
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

interface MetadataEngine extends Engine {
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
            ...option
          });
        }
      });

      return {
        name: engine.id.name,
        filePath: enginePath,
        options
      };
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

export function ProcessAnalysis(engineData: any): EngineOutput | undefined {
  if (engineData.depth && engineData.score && engineData.pv) {
    return {
      evaluation: engineData.score.value / 100,
      depth: engineData.depth,
      variation: engineData.pv.split(" "),
      id: engineData.multipv
    };
  }

  return undefined;
}
