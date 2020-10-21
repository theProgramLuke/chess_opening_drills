import _ from "lodash";

import { TagTree } from "@/store/repertoire/TagTree";
import {
  PositionCollection,
  SavedPositionCollection,
  Variation,
  VariationMove
} from "@/store/repertoire/PositionCollection";
import { Side } from "@/store/side";
import {
  TrainingCollection,
  SavedTrainingCollection
} from "@/store/repertoire/TrainingCollection";
import { sideFromFen } from "@/store/repertoire/chessHelpers";
import { TrainingMode } from "@/store/trainingMode";
import { filterPrefixLists } from "@/store/ListHelpers";

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

  getTrainingVariations(
    tagsToTrain: TagTree[],
    trainingModes: TrainingMode[]
  ): Variation[] {
    const variations: Variation[] = [];

    const descendantPositions = _.uniq(
      _.flatten(
        _.map(tagsToTrain, tag => this.positions.descendantPositions(tag.fen))
      )
    );

    const descendantMoves = _.uniq(
      _.flatten(
        _.map(descendantPositions, position =>
          this.positions.movesFromPosition(position)
        )
      )
    );

    const trainingMoves: VariationMove[] = [];

    _.forEach(descendantMoves, move => {
      const trainingForMove = this.training.getTrainingForMove(
        move.sourceFen,
        move.san
      );

      if (trainingForMove) {
        const include = _.some(trainingModes, mode =>
          trainingForMove.includeForTrainingMode(mode)
        );

        if (include) {
          trainingMoves.push(move);
        }
      }
    });

    _.forEach(trainingMoves, move => {
      const trainingVariations = this.positions.getSourceVariations(
        move.sourceFen
      );
      _.forEach(trainingVariations, variation => {
        variation.push(move); // include the move to be trained at the end of the variation
        variations.push(variation);
      });
    });

    return filterPrefixLists(variations);
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
