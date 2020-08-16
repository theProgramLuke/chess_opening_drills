import _ from "lodash";

import { RepertoirePosition } from "@/store/repertoirePosition";
import { Side } from "@/store/side";

export class Move {
  san: string;
  position: RepertoirePosition;

  constructor(san: string, position: RepertoirePosition) {
    this.san = san;
    this.position = position;
  }
}
