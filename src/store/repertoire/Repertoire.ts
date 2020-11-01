import _ from "lodash";

import { TagTree, SavedTagTree } from "@/store/repertoire/TagTree";
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
import { RepetitionTraining } from "./RepetitionTraining";

export interface SavedRepertoire {
  sideToTrain: Side;
  positions: SavedPositionCollection;
  tags: SavedTagTree;
  training: SavedTrainingCollection;
}

export class Repertoire {
  sideToTrain: Side;
  positions: PositionCollection;
  tags: TagTree;
  training: TrainingCollection;

  constructor(saved: SavedRepertoire) {
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
    this.tags = TagTree.fromSaved(saved.tags);
    this.training = TrainingCollection.fromSaved(saved.training);
  }

  static newSavedRepertoire(
    name: string,
    startFen: string,
    sideToTrain: Side,
    isRootTag = false
  ): SavedRepertoire {
    return {
      positions: {
        options: {
          directed: true,
          multigraph: false,
          compound: false
        },
        nodes: [{ v: startFen }],
        edges: []
      },
      sideToTrain,
      tags: new TagTree(name, startFen, [], isRootTag).asSaved(),
      training: new TrainingCollection().asSaved()
    };
  }

  asSaved(): SavedRepertoire {
    return {
      sideToTrain: this.sideToTrain,
      positions: this.positions.asSaved(),
      tags: this.tags.asSaved(),
      training: this.training.asSaved()
    };
  }

  getTrainingVariations(
    tagsToTrain: TagTree[],
    trainingModes: TrainingMode[],
    entireVariations = true,
    difficultyLimit = 0
  ): Variation[] {
    const filteredTags: TagTree[] = _.filter(tagsToTrain, tag =>
      this.tags.includesTag(tag.id)
    );

    const descendantMoves: VariationMove[] = this.getMovesDescendingFromTags(
      filteredTags
    );

    const trainingMoves: VariationMove[] = this.filterMovesToTrain(
      descendantMoves,
      trainingModes,
      difficultyLimit
    );

    let variations: Variation[] = [];

    if (entireVariations) {
      variations = this.getVariationsToTrainFromMoves(trainingMoves);
    } else {
      variations = _.map(trainingMoves, move => [move]);
    }

    return filterPrefixLists(variations);
  }

  getTrainingForTags(tags: TagTree[]): RepetitionTraining[] {
    const filteredTraining: RepetitionTraining[] = [];

    const filteredTags: TagTree[] = _.filter(tags, tag =>
      this.tags.includesTag(tag.id)
    );

    const descendantMoves: VariationMove[] = this.getMovesDescendingFromTags(
      filteredTags
    );

    const trainingMoves: VariationMove[] = this.filterMovesToTrain(
      descendantMoves,
      [TrainingMode.Cram]
    );

    _.forEach(trainingMoves, move => {
      const moveTraining = this.training.getTrainingForMove(
        move.sourceFen,
        move.san
      );

      if (moveTraining) {
        filteredTraining.push(moveTraining);
      }
    });

    return filteredTraining;
  }

  private getVariationsToTrainFromMoves(
    trainingMoves: VariationMove[]
  ): Variation[] {
    const variations: Variation[] = [];

    _.forEach(trainingMoves, move => {
      const trainingVariations = this.positions.getSourceVariations(
        move.sourceFen
      );
      _.forEach(trainingVariations, variation => {
        variation.push(move); // include the move to be trained at the end of the variation
        variations.push(variation);
      });
    });

    return variations;
  }

  private getMovesDescendingFromTags(tags: TagTree[]): VariationMove[] {
    const descendantPositions = _.uniq(
      _.flatten(
        _.map(tags, tag => {
          const positions = this.positions.descendantPositions(tag.fen);
          positions.unshift(tag.fen);
          return positions;
        })
      )
    );

    return _.uniq(
      _.flatten(
        _.map(descendantPositions, position =>
          this.positions.movesFromPosition(position)
        )
      )
    );
  }

  private filterMovesToTrain(
    moves: VariationMove[],
    trainingModes: TrainingMode[],
    difficultyLimit = 0
  ): VariationMove[] {
    const filteredMoves: VariationMove[] = [];

    _.forEach(moves, move => {
      const trainingForMove = this.training.getTrainingForMove(
        move.sourceFen,
        move.san
      );

      if (trainingForMove) {
        const include = _.some(trainingModes, mode =>
          trainingForMove.includeForTrainingMode(mode, difficultyLimit)
        );

        if (include) {
          filteredMoves.push(move);
        }
      }
    });

    return filteredMoves;
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

      this.tags.removeTag(position);
    });
  }
}
