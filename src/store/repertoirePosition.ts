import _ from "lodash";
import { FEN } from "chessground/types";

import { Move } from "@/store/move";
import { Side } from "@/store/side";
import { Turn } from "@/store/turn";

export class RepertoirePosition {
  fen: FEN;
  comment: string;
  parents: Array<RepertoirePosition>;
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

  AddChild(move: Move): void {
    const samePosition = this.fen == move.position.fen;
    const alreadyChild = !_.isEmpty(
      _.find(this.children, (child: Move) => this.fen === child.position.fen)
    );
    if (!samePosition && !alreadyChild) {
      this.children.push(move);
      move.position.parents.push(this);
    }
  }

  RootPaths(): Array<Array<Move>> {
    const collector: Array<Array<Move>> = [];

    if (!_.isEmpty(this.parents)) {
      this.RootPathsRecursive([], collector);
    }

    return collector;
  }

  private RootPathsRecursive(
    path: Array<Move>,
    collector: Array<Array<Move>>
  ): void {
    if (_.isEmpty(this.parents)) {
      collector.push(path);
    } else {
      _.forEach(this.parents, (parent: RepertoirePosition) => {
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
    return _.find(this.children, (child: Move) => child.position === other);
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
}
