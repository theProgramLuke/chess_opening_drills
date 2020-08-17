import _ from "lodash";
import { FEN } from "chessground/types";
import { Chess } from "chess.js";

import { Move, SavedMove } from "@/store/move";
import { Side } from "@/store/side";
import { Turn } from "@/store/turn";

export class SavedRepertoirePosition {
  fen: FEN;
  comment: string;
  parentIds: number[];
  children: SavedMove[];
  myTurn: boolean;
  forSide: Side;

  constructor(
    fen: FEN,
    comment: string,
    parentIds: number[],
    children: SavedMove[],
    myTurn: boolean,
    forSide: Side
  ) {
    this.fen = fen;
    this.comment = comment;
    this.parentIds = parentIds;
    this.children = children;
    this.myTurn = myTurn;
    this.forSide = forSide;
  }
}

export class RepertoirePosition {
  fen: FEN;
  comment: string;
  parents: RepertoirePosition[];
  children: Move[];
  myTurn: boolean;
  forSide: Side;

  constructor(fen: FEN, myTurn: boolean, comment: string, forSide: Side) {
    this.fen = fen;
    this.comment = comment;
    this.myTurn = myTurn;
    this.forSide = forSide;
    this.parents = [];
    this.children = [];
  }

  SideToMove(): Side {
    return Chess(this.fen).turn() === "w" ? Side.White : Side.Black;
  }

  AddChild(move: Move): void {
    const samePosition = this.fen == move.position.fen;
    const alreadyChild = !_.isEmpty(
      _.find(
        this.children,
        (child: Move) => move.position.fen === child.position.fen
      )
    );
    if (!samePosition && !alreadyChild) {
      this.children.push(move);
      move.position.parents.push(this);
    }
  }

  private RootPaths(): Move[][] {
    const collector: Move[][] = [];

    if (!_.isEmpty(this.parents)) {
      this.RootPathsRecursive([], collector);
    }

    return collector;
  }

  private RootPathsRecursive(path: Move[], collector: Move[][]): void {
    if (_.isEmpty(this.parents)) {
      collector.push(path);
    } else {
      _.forEach(this.parents, parent => {
        const branch = _.clone(path);
        const parentMove = parent.getChildMove(this);

        if (parentMove) {
          branch.unshift(parentMove);
        }

        parent.RootPathsRecursive(branch, collector);
      });
    }
  }

  private getChildMove(other: RepertoirePosition): Move | undefined {
    return _.find(this.children, child => child.position === other);
  }

  GetTurnLists(): Array<Array<Turn>> {
    const moveLists: Array<Array<Turn>> = [];

    const paths = this.RootPaths();

    _.forEach(paths, (path: Array<Move>) => {
      const turns: Array<Turn> = [];

      _.forEach(_.range(0, path.length, 2), (i: number) => {
        const whiteMove = path[i];

        if (path.length === i) {
          turns.push(new Turn(whiteMove));
        } else {
          const blackMove = path[i + 1];
          turns.push(new Turn(whiteMove, blackMove));
        }
      });

      moveLists.push(turns);
    });

    return moveLists;
  }

  AsPgnMoveText(turnCount = 1): string {
    if (_.isEmpty(this.children)) {
      return "";
    }

    const side = this.SideToMove();
    let pgnMoveText = "";
    let childTurnCount = turnCount;

    if (side === Side.White) {
      // White made this move.
      pgnMoveText += turnCount + ". ";
      childTurnCount++;
    }

    const mainLine = _.first(this.children);
    if (mainLine) {
      pgnMoveText += mainLine.san;
    }

    const variations = _.tail(this.children);

    _.forEach(variations, child => {
      pgnMoveText += " ( "; // start variation
      pgnMoveText += turnCount;
      pgnMoveText += side === Side.White ? ". " : "... ";
      pgnMoveText += child.san;
      pgnMoveText += " ";
      pgnMoveText += child.position.AsPgnMoveText(childTurnCount);
      pgnMoveText += " )"; // end variation
    });

    if (mainLine) {
      pgnMoveText += " ";
      pgnMoveText += mainLine.position.AsPgnMoveText(childTurnCount);
    }

    return _.trim(pgnMoveText);
  }

  AsSaved(childParentSource: RepertoirePosition[]): SavedRepertoirePosition {
    const savedChildren = _.map(
      this.children,
      child =>
        new SavedMove(child.san, _.indexOf(childParentSource, child.position))
    );

    const parentIds = _.map(this.parents, parent =>
      _.indexOf(childParentSource, parent)
    );

    return new SavedRepertoirePosition(
      this.fen,
      this.comment,
      parentIds,
      savedChildren,
      this.myTurn,
      this.forSide
    );
  }

  static FromSaved(saved: SavedRepertoirePosition): RepertoirePosition {
    return new RepertoirePosition(
      saved.fen,
      saved.myTurn,
      saved.comment,
      saved.forSide
    );
  }
}
