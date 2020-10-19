import _ from "lodash";

import { TagTree } from "@/store/repertoire/TagTree";
import {
  PositionCollection,
  SavedPositionCollection,
  VariationMove
} from "@/store/repertoire/PositionCollection";
import { Side } from "@/store/side";
import {
  TrainingCollection,
  SavedTrainingCollection
} from "@/store/repertoire/TrainingCollection";
import { sideFromFen } from "@/store/repertoire/chessHelpers";
import { TrainingMode } from "@/store/trainingMode";

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
      },
      (fen: string, san: string, deletedPositions: string[]) => {
        this.deleteMove(fen, san, deletedPositions);
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
    const side = sideFromFen(fen);

    if (this.sideToTrain === side) {
      this.training.addMove(fen, san);
    }
  }

  private deleteMove(fen: string, san: string, deletedPositions: string[]) {
    this.training.deleteMove(fen, san);
    _.forEach(deletedPositions, position => {
      this.training.deletePosition(position);

      _.forEach(this.tags, tag => tag.removeTag(position));
    });
  }
}
