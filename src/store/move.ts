import _ from "lodash";

import { RepertoirePosition } from "@/store/repertoirePosition";

export class SavedMove {
  san: string;
  positionId: number;

  constructor(san: string, positionId: number) {
    this.san = san;
    this.positionId = positionId;
  }
}

export class Move {
  san: string;
  position: RepertoirePosition;

  constructor(san: string, position: RepertoirePosition) {
    this.san = san;
    this.position = position;
  }
}
