import { TagTree } from "@/store/repertoire/TagTree";
import { Variation } from "@/store/repertoire/PositionCollection";
import { Repertoire } from "@/store/repertoire/Repertoire";

export interface TrainingVariation {
  repertoire: Repertoire;
  variation: Variation;
}

export class TrainingOptions {
  readonly topics: TagTree[];
  readonly variations: TrainingVariation[];
  readonly previewNewVariations: boolean;
  readonly entireVariations: boolean;
  readonly playbackSpeed: number;
  readonly difficultyModeLimit: number;

  constructor(
    topics: TagTree[],
    variations: TrainingVariation[],
    previewNewVariations: boolean,
    entireVariations: boolean,
    playbackSpeed: number,
    difficultyModeLimit: number
  ) {
    this.topics = topics;
    this.variations = variations;
    this.previewNewVariations = previewNewVariations;
    this.entireVariations = entireVariations;
    this.playbackSpeed = playbackSpeed;
    this.difficultyModeLimit = difficultyModeLimit;
  }
}
