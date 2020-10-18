import _ from "lodash";

import { TagTree } from "@/store/repertoire/TagTree";
import {
  PositionCollection,
  SavedPositionCollection
} from "@/store/repertoire/PositionCollection";
import { Side } from "@/store/side";
import {
  TrainingCollection,
  SavedTrainingCollection
} from "./TrainingCollection";

export interface SavedRepertoire {
  name: string;
  sideToTrain: Side;
  positions: SavedPositionCollection;
  tags: TagTree[];
  training: SavedTrainingCollection;
}

export class Repertoire {
  name: string;
  sideToTrain: Side;
  positions: PositionCollection;
  tags: TagTree[];
  training: TrainingCollection;

  constructor(saved: SavedRepertoire) {
    this.name = saved.name;
    this.sideToTrain = saved.sideToTrain;
    this.positions = new PositionCollection(
      saved.positions,
      (fen: string, san: string): void => {
        this.onAddMove(fen, san);
      }
    );
    this.tags = saved.tags;
    this.training = TrainingCollection.fromSaved(saved.training);
  }

  asSaved(): SavedRepertoire {
    return {
      name: this.name,
      sideToTrain: this.sideToTrain,
      positions: this.positions.asSaved(),
      tags: this.tags,
      training: this.training.asSaved()
    };
  }

  private onAddMove(fen: string, san: string) {
    this.training.addMove(fen, san);
  }
}
