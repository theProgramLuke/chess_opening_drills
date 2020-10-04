import _ from "lodash";
import { json } from "graphlib";

import { TagTree } from "@/store/repertoire/TagTree";
import {
  PositionCollectionInterface,
  PositionCollection,
  VariationMove
} from "@/store/repertoire/PositionCollection";

export interface SavedRepertoire {
  positions: json.SavedGraph;
  tags: TagTree[];
}

// Implement PositionCollectionInterface with positions as private so that
// we can modify the other repertoire members on position mutations.
export class Repertoire implements PositionCollectionInterface {
  private positions: PositionCollection;
  tags: TagTree[];

  constructor(positions: PositionCollection, tags: TagTree[]) {
    this.positions = positions;
    this.tags = tags;
  }

  addMove(fen: string, san: string): string {
    return this.positions.addMove(fen, san);
  }

  deleteMove(fen: string, san: string): string[] {
    const deleted = this.positions.deleteMove(fen, san);
    _.forEach(deleted, deletedFen =>
      _.forEach(this.tags, tag => tag.removeTag(deletedFen))
    );
    return deleted;
  }

  movesFromPosition(fen: string): VariationMove[] {
    return this.positions.movesFromPosition(fen);
  }

  parentPositions(fen: string): string[] {
    return this.positions.parentPositions(fen);
  }

  descendantPositions(fen: string): string[] {
    return this.positions.descendantPositions(fen);
  }

  asPgn(fen: string): string {
    return this.positions.asPgn(fen);
  }

  loadPgn(pgn: string): void {
    this.positions.loadPgn(pgn);
  }

  getVariations(fen: string): VariationMove[][] {
    return this.positions.getVariations(fen);
  }

  asSaved(): SavedRepertoire {
    return {
      positions: this.positions.asSaved(),
      tags: this.tags
    };
  }
}
