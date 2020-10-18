import _ from "lodash";
import { json } from "graphlib";

import { TagTree } from "@/store/repertoire/TagTree";
import {
  PositionCollection,
  VariationMove
} from "@/store/repertoire/PositionCollection";
import { Side } from "@/store/side";

export interface SavedRepertoire {
  name: string;
  sideToTrain: Side;
  positions: json.SavedGraph;
  tags: TagTree[];
}

// Implement PositionCollectionInterface with positions as private so that
// we can modify the other repertoire members on position mutations.
export class Repertoire {
  name: string;
  sideToTrain: Side;
  positions: PositionCollection;
  tags: TagTree[];

  constructor(
    name: string,
    sideToTrain: Side,
    positions: PositionCollection,
    tags: TagTree[]
  ) {
    this.name = name;
    this.sideToTrain = sideToTrain;
    this.positions = positions;
    this.tags = tags;
  }

  asSaved(): SavedRepertoire {
    return {
      name: this.name,
      sideToTrain: this.sideToTrain,
      positions: this.positions.asSaved(),
      tags: this.tags
    };
  }
}
