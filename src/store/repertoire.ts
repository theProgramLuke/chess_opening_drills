import _ from "lodash";
import { FEN } from "chessground/types";
import { Chess } from "chess.js";

import { PgnGame, PgnMove } from "@/store/pgnParser";

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

  RemoveRepertoireTag(tagToRemove: RepertoireTag): void {
    _.forEach(this.tags, tag => tag.RemoveChild(tagToRemove));
  }

  RemoveMove(move: Move): void {
    move.position.Unlink();
    this.RemoveOrphanPositions();
  }

  private RemoveOrphanPositions(): void {
    let anyRemainingOrphans = true;
    while (anyRemainingOrphans) {
      anyRemainingOrphans = this.RemoveOrphanPositionsOnce();
    }
  }

  private RemoveOrphanPositionsOnce(): boolean {
    const removedOrphans = _.remove(
      this.positions,
      (position, index) => index !== 0 && _.isEmpty(position.parents)
    );
    _.forEach(removedOrphans, orphan => orphan.Unlink());
    return !_.isEmpty(removedOrphans);
  }

  AddFromGame(game: PgnGame): void {
    const variations: PgnMove[][] = [];
    this.VariationsFromGame(game.moves, variations);

    _.forEach(variations, variation =>
      this.AddFromVariation(this.positions[0], variation)
    );
  }

  private VariationsFromGame(
    pgnMoves: PgnMove[],
    collector: PgnMove[][],
    history: PgnMove[] = []
  ): void {
    _.forEach(pgnMoves, pgnMove => {
      if (pgnMove.ravs) {
        _.forEach(pgnMove.ravs, rav => {
          this.VariationsFromGame(rav.moves, collector, _.clone(history));
        });
      }

      history.push(_.omit(pgnMove, "ravs"));
    });

    collector.push(history);
  }

  private AddFromVariation(
    parentPosition: RepertoirePosition,
    variation: PgnMove[]
  ): void {
    const game = new Chess();

    _.forEach(variation, move => {
      if (move.move) {
        const trimmedMove = _.trimStart(move.move, ".");
        game.move(trimmedMove);

        const existingChild = _.find(
          parentPosition.children,
          child => child.san === trimmedMove
        );

        if (existingChild) {
          parentPosition = existingChild.position;
        } else {
          const nextPosition = new RepertoirePosition(
            game.fen(),
            move.comments || "",
            parentPosition.forSide
          );

          this.AddMove(parentPosition, new Move(trimmedMove, nextPosition));
          parentPosition = nextPosition;
        }
      }
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
