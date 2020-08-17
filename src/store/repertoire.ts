import _ from "lodash";
import { FEN } from "chessground/types";

import {
  RepertoirePosition,
  SavedRepertoirePosition
} from "@/store/repertoirePosition";
import { RepertoireTag, SavedRepertoireTag } from "@/store/repertoireTag";
import { Move } from "@/store/move";

export class SavedRepertoire {
  positions: SavedRepertoirePosition[];
  tags: SavedRepertoireTag[];

  constructor(
    positions: SavedRepertoirePosition[],
    tags: SavedRepertoireTag[]
  ) {
    this.positions = positions;
    this.tags = tags;
  }
}

export class Repertoire {
  positions: RepertoirePosition[];
  tags: RepertoireTag[];

  constructor(positions: RepertoirePosition[], tags: RepertoireTag[]) {
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

  AsSaved(): SavedRepertoire {
    const savedPositions = _.map(this.positions, position =>
      position.AsSaved(this.positions)
    );

    const loadedTags = _.map(this.tags, tag => tag.AsSaved(this.positions));

    return new SavedRepertoire(savedPositions, loadedTags);
  }

  static FromSaved(saved: SavedRepertoire): Repertoire {
    const loadedPositions = _.map(saved.positions, savedPosition =>
      RepertoirePosition.FromSaved(savedPosition)
    );

    _.forEach(saved.positions, (savedPosition, index) =>
      _.forEach(savedPosition.children, savedMove =>
        loadedPositions[index].AddChild(
          new Move(savedMove.san, loadedPositions[savedMove.positionId])
        )
      )
    );

    const loadedTags = _.map(saved.tags, savedTag =>
      RepertoireTag.FromSaved(savedTag, loadedPositions)
    );

    return new Repertoire(loadedPositions, loadedTags);
  }
}
