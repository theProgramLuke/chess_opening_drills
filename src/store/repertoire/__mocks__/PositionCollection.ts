import _ from "lodash";

import * as Real from "@/store/repertoire/PositionCollection";
import { DrawShape } from "chessground/draw";

export class PositionCollection implements Real.PositionCollectionInterface {
  addMove: (fen: string, san: string) => string = jest.fn();
  deleteMove: (fen: string, san: string) => string[] = jest.fn();
  movesFromPosition: (fen: string) => Real.VariationMove[] = jest.fn();
  parentPositions: (fen: string) => string[] = jest.fn();
  descendantPositions: (fen: string) => string[] = jest.fn();
  asSaved: () => Record<string, any> = jest.fn();
  asPgn: (fen: string) => string = jest.fn();
  loadPgn: (pgn: string) => void = jest.fn();
  getChildVariations: (fen: string) => Real.VariationMove[][] = jest.fn();
  getSourceVariations: (fen: string) => Real.Variation[] = jest.fn();
  setPositionComments: (fen: string, comments: string) => void = jest.fn();
  getPositionComments: (fen: string) => string = jest.fn();
  setPositionDrawings: (fen: string, drawings: DrawShape[]) => void = jest.fn();
  getPositionDrawings: (fen: string) => DrawShape[] = jest.fn();

  addMoveObserver: Real.AddMoveObserver;
  deleteMoveObserver: Real.DeleteMoveObserver;

  constructor(
    serialized: Real.SavedPositionCollection,
    onAddMove: Real.AddMoveObserver = _.noop,
    onDeleteMove: Real.DeleteMoveObserver = _.noop
  ) {
    this.addMoveObserver = onAddMove;
    this.deleteMoveObserver = onDeleteMove;
  }
}
