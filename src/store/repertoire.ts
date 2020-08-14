import _ from "lodash";
import { FEN } from "chessground/types";

import { RepertoirePosition } from "./repertoirePosition";
import { RepertoireTag } from "./repertoireTag";
import { Position } from "vue-router/types/router";
import { Move } from "./move";

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

  LookupRepertoirePosition(fen: FEN): RepertoirePosition | undefined {
    return _.find(this.positions, (position: RepertoirePosition) => {
      return fen === position.fen;
    });
  }

  private _LookupRepertoireTag(
    tag: RepertoireTag,
    id: number
  ): RepertoireTag | null {
    if (tag["id"] === id) {
      return tag;
    }

    if (tag["children"].length === 0) {
      return null;
    }

    const mapped = tag["children"].map((child: RepertoireTag) =>
      this._LookupRepertoireTag(child, id)
    );
    const filtered = mapped.filter((child: RepertoireTag | null) => {
      return child != null;
    });

    return filtered[0];
  }

  LookupRepertoireTag(id: number): RepertoireTag | null {
    const mapped = this.tags.map((child: RepertoireTag) =>
      this._LookupRepertoireTag(child, id)
    );
    const filtered = mapped.filter((child: RepertoireTag | null) => {
      return child != null;
    });

    // assert(filtered.length === 1, "Should only find one matching tag...");

    return filtered[0];
  }
}
