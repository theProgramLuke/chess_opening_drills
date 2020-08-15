import _ from "lodash";
import { FEN } from "chessground/types";

import { RepertoirePosition } from "@/store/repertoirePosition";
import { RepertoireTag } from "@/store/repertoireTag";
import { Move } from "@/store/move";

export class Repertoire {
  positions: Array<RepertoirePosition>;
  tags: Array<RepertoireTag>;

  constructor(
    positions: Array<RepertoirePosition>,
    tags: Array<RepertoireTag>
  ) {
    this.positions = positions;
    this.tags = tags;
  }

  AddMove(parent: RepertoirePosition, move: Move): void {
    const existingPosition = this.LookupRepertoirePosition(move.position.fen);
    if (existingPosition) {
      move.position = existingPosition;
    }

    parent.AddChild(move);

    if (!existingPosition) {
      this.positions.push(move.position);
    }
  }

  private LookupRepertoirePosition(fen: FEN): RepertoirePosition | undefined {
    return _.find(this.positions, (position: RepertoirePosition) => {
      return fen === position.fen;
    });
  }
}
