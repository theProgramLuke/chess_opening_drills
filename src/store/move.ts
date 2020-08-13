import { Position } from "@/store/position";

export class Move {
  san: string;
  position: Position;

  constructor(san: string, position: Position) {
    this.san = san;
    this.position = position;
  }
}
