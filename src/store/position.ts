import _ from "lodash";

import { Move } from "./move";
import { Side } from "./side";

export class Position {
  fen: string;
  comment: string;
  parents: Array<Position>;
  children: Array<Move>;
  myTurn: boolean;
  forSide: Side;

  constructor(fen: string, myTurn: boolean, comment: string, forSide: Side) {
    this.fen = fen;
    this.comment = comment;
    this.myTurn = myTurn;
    this.forSide = forSide;
    this.parents = [];
    this.children = [];
  }

  addChild(move: Move): void {
    this.children.push(move);
    move.position.addParent(this);
  }

  addParent(position: Position): void {
    this.parents.push(position);
  }

  rootPaths(): Array<Array<Move>> {
    const collector: Array<Array<Move>> = [];

    if (!_.isEmpty(this.parents)) {
      this.rootPathsRecursive([], collector);
    }

    return collector;
  }

  private rootPathsRecursive(
    path: Array<Move>,
    collector: Array<Array<Move>>
  ): void {
    if (_.isEmpty(this.parents)) {
      collector.push(path);
    } else {
      _.forEach(this.parents, (parent: Position) => {
        const branch = _.clone(path);
        const parentMove = parent.getChildMove(this);

        if (parentMove) {
          branch.unshift(parentMove);
        }

        parent.rootPathsRecursive(branch, collector);
      });
    }
  }

  private getChildMove(other: Position): Move | undefined {
    return _.find(this.children, (child: Move) => child.position === other);
  }
}
