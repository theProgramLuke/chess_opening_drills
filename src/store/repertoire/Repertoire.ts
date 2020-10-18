import _ from "lodash";

import { TagTree } from "@/store/repertoire/TagTree";
import {
  PositionCollection,
  SavedPositionCollection
} from "@/store/repertoire/PositionCollection";
import { Side } from "@/store/side";

export interface SavedRepertoire {
  name: string;
  sideToTrain: Side;
  positions: SavedPositionCollection;
  tags: TagTree[];
}

export class Repertoire {
  name: string;
  sideToTrain: Side;
  positions: PositionCollection;
  tags: TagTree[];

  constructor(saved: SavedRepertoire) {
    this.name = saved.name;
    this.sideToTrain = saved.sideToTrain;
    this.positions = new PositionCollection(saved);
    this.tags = saved.tags;
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
