import {
  PositionCollection,
  PositionCollectionInterface,
  VariationMove
} from "@/store/repertoire/PositionCollection";

export class ObservablePositionCollection
  implements PositionCollectionInterface {
  private observed: PositionCollection;

  constructor(observed: PositionCollection) {
    this.observed = observed;
  }

  addMove(fen: string, san: string): string {
    return this.observed.addMove(fen, san);
  }

  deleteMove(fen: string, san: string): string[] {
    return this.observed.deleteMove(fen, san);
  }

  movesFromPosition(fen: string): VariationMove[] {
    return this.observed.movesFromPosition(fen);
  }

  parentPositions(fen: string): string[] {
    return this.observed.parentPositions(fen);
  }

  descendantPositions(fen: string): string[] {
    return this.observed.descendantPositions(fen);
  }

  asSaved(): Record<string, any> {
    return this.observed.asSaved();
  }

  asPgn(fen: string): string {
    return this.observed.asPgn(fen);
  }

  loadPgn(pgn: string): void {
    this.observed.loadPgn(pgn);
  }

  getVariations(fen: string): VariationMove[][] {
    return this.observed.getVariations(fen);
  }
}
