import _ from "lodash";
import { Engine } from "node-uci";

interface SourceEngineOption {
  type: "spin" | "check" | "combo" | "string" | "button";
  default: number | boolean | string;
  min?: number;
  max?: number;
  options?: string[];
}

export interface EngineOption extends SourceEngineOption {
  name: string;
}

export async function GetEngineOptions(
  enginePath: string
): Promise<EngineOption[]> {
  // Launch the engine with a dummy position to get the available options.
  const engine = new Engine(enginePath);

  await engine.init();
  await engine.position("7K/8/8/8/8/8/8/7k");
  await engine.go({ depth: 1 });

  const sourceOptions: Map<string, SourceEngineOption> = (engine as any & {
    options: Map<string, SourceEngineOption>;
  }).options;

  const options: EngineOption[] = [];
  sourceOptions.forEach((value, key) => {
    if (value.type !== "button") {
      options.push({
        name: key,
        ...value
      });
    }
  });

  return options;
}
