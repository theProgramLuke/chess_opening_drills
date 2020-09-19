import { FEN } from "chessground/types";

import * as Real from "@/store/repertoireTag";
import { Side } from "@/store/side";
import { RepertoirePosition } from "@/store/repertoirePosition";

export class RepertoireTag {
  forSide: Side;
  name: string;
  position: RepertoirePosition;
  fen: FEN;
  children: RepertoireTag[];
  id: string;

  constructor(
    forSide: Side,
    name: string,
    position: RepertoirePosition,
    fen: FEN,
    children: RepertoireTag[],
    id?: string
  ) {
    this.id = id || "";
    this.forSide = forSide;
    this.name = name;
    this.position = position;
    this.fen = fen;
    this.children = children;
    this.AddChild = jest.fn();
    this.RemoveChild = jest.fn();
    this.AsSaved = jest.fn();
  }

  AddChild: (tag: RepertoireTag) => void;

  RemoveChild: (tag: RepertoireTag) => void;

  AsSaved: (positionSource: RepertoirePosition[]) => Real.SavedRepertoireTag;

  static FromSaved: (
    saved: Real.SavedRepertoireTag,
    positionSource: RepertoirePosition[]
  ) => RepertoireTag = jest.fn();
}

export const GetTrainingPositions = jest.fn();

export const GetTrainingMoveLists = jest.fn();
