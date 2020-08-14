import { RepertoirePosition } from "@/store/repertoirePosition";

export class Move {
  san: string;
  position: RepertoirePosition;

  constructor(san: string, position: RepertoirePosition) {
    this.san = san;
    this.position = position;
  }
}
