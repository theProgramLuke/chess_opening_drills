import { Side } from "./side";
import { FEN } from "chessground/types";
import { RepertoirePosition } from "./repertoirePosition";

export class RepertoireTag {
  id: number;
  forSide: Side;
  name: string;
  position: RepertoirePosition;
  fen: FEN;
  children: Array<RepertoireTag>;

  constructor(
    id: number,
    forSide: Side,
    name: string,
    position: RepertoirePosition,
    fen: FEN,
    children: Array<RepertoireTag>
  ) {
    this.id = id;
    this.forSide = forSide;
    this.name = name;
    this.position = position;
    this.fen = fen;
    this.children = children;
  }
}
