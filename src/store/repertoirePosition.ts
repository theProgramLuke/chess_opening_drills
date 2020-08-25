import _ from "lodash";
import { FEN } from "chessground/types";
import { Chess } from "chess.js";

import { EOL } from "os";
import { Move, SavedMove } from "@/store/move";
import { Side } from "@/store/side";
import { Turn } from "@/store/turn";
import { TrainingMode } from "./trainingMode";
import { TrainingEvent } from "./TrainingEvent";

export const millisecondsPerDay = 86400000;

export class SavedRepertoirePosition {
  fen: FEN;
  comment: string;
  parentIds: number[];
  children: SavedMove[];
  myTurn: boolean;
  forSide: Side;
  trainingHistory: TrainingEvent[];
  nextRepetitionTimestamp?: number;
  previousIntervalDays: number;
  intervalIndex: number;
  easinessFactor: number;

  constructor(
    fen: FEN,
    comment: string,
    parentIds: number[],
    children: SavedMove[],
    myTurn: boolean,
    forSide: Side,
    trainingHistory: TrainingEvent[],
    nextRepetitionTimestamp: number | undefined,
    previousIntervalDays: number,
    intervalIndex: number,
    easinessFactor: number
  ) {
    this.fen = fen;
    this.comment = comment;
    this.parentIds = parentIds;
    this.children = children;
    this.myTurn = myTurn;
    this.forSide = forSide;
    this.trainingHistory = trainingHistory;
    this.nextRepetitionTimestamp = nextRepetitionTimestamp;
    this.previousIntervalDays = previousIntervalDays;
    this.intervalIndex = intervalIndex;
    this.easinessFactor = easinessFactor;
  }
}

type Grade = 0 | 1 | 2 | 3 | 4 | 5;

export class RepertoirePosition {
  fen: FEN;
  comment: string;
  parents: RepertoirePosition[];
  children: Move[];
  myTurn: boolean;
  forSide: Side;
  trainingHistory: TrainingEvent[];
  nextRepetitionTimestamp?: number;
  previousIntervalDays: number;
  intervalIndex: number;
  easinessFactor: number;

  constructor(
    fen: FEN,
    comment: string,
    forSide: Side,
    myTurn?: boolean,
    trainingHistory?: TrainingEvent[],
    nextRepetitionTimestamp?: number,
    previousIntervalDays?: number,
    intervalIndex?: number,
    easinessFactor?: number
  ) {
    this.fen = fen;
    this.comment = comment;
    this.forSide = forSide;
    this.parents = [];
    this.children = [];
    this.myTurn = myTurn || false;
    this.trainingHistory = trainingHistory || [];
    this.nextRepetitionTimestamp = nextRepetitionTimestamp;
    this.previousIntervalDays = previousIntervalDays || 0;
    this.intervalIndex = intervalIndex || 0;
    this.easinessFactor = easinessFactor || 2.5;
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
      move.position.myTurn = !this.myTurn;
    }
  }

  Unlink(): void {
    _.forEach(this.parents, parent =>
      _.remove(parent.children, child => {
        const match = child.position === this;
        return match;
      })
    );

    _.forEach(this.children, child =>
      _.remove(child.position.parents, parent => parent === this)
    );

    this.parents = [];
    this.children = [];
  }

  IncludeForTrainingMode(mode: TrainingMode, difficultyModeLimit = 0): boolean {
    switch (mode) {
      case TrainingMode.New: {
        return this.IncludeForNewMode();
      }
      case TrainingMode.Scheduled: {
        return this.IncludeForScheduledMode();
      }
      case TrainingMode.Difficult: {
        return this.IncludeForDifficultMode(difficultyModeLimit);
      }
    }
  }

  private IncludeForNewMode(): boolean {
    return _.isEmpty(this.trainingHistory);
  }

  private IncludeForScheduledMode(): boolean {
    if (this.nextRepetitionTimestamp !== undefined) {
      const now = new Date(_.now());
      const scheduled = new Date(this.nextRepetitionTimestamp);

      // strip time portion
      now.setHours(0, 0, 0, 0);
      scheduled.setHours(0, 0, 0, 0);

      return now >= scheduled;
    } else {
      return false;
    }
  }

  private IncludeForDifficultMode(limit: number): boolean {
    return this.easinessFactor < limit;
  }

  AddTrainingEvent(event: TrainingEvent): void {
    this.trainingHistory.push(event);

    const grade = this.CalculateGrade(event);
    this.easinessFactor = this.NextEasinessFactor(grade);
    const nextIntervalDays = this.NextIntervalDays(grade);

    const nextIntervalMilliseconds = nextIntervalDays * millisecondsPerDay;
    this.nextRepetitionTimestamp = _.now() + nextIntervalMilliseconds;
    this.previousIntervalDays = nextIntervalDays;
  }

  private CalculateGrade(event: TrainingEvent): Grade {
    switch (event.attempts) {
      case 1: {
        if (event.responseTimeSeconds < 2) {
          return 5;
        } else if (event.responseTimeSeconds < 10) {
          return 4;
        } else {
          return 3;
        }
      }
      case 2: {
        if (event.responseTimeSeconds < 10) {
          return 2;
        } else {
          return 1;
        }
      }
      case 3:
      default: {
        return 0;
      }
    }
  }

  private NextEasinessFactor(grade: Grade): number {
    let next =
      this.easinessFactor + (0.1 - (5 - grade) * 0.08 + (5 - grade) * 0.02);
    if (next < 1) {
      next = 1;
    }
    return next;
  }

  private NextIntervalDays(grade: Grade): number {
    if (grade < 3) {
      this.intervalIndex = 1;
      return 1;
    }

    if (this.intervalIndex === 0) {
      this.intervalIndex++;
      return 1;
    }
    if (this.intervalIndex === 1) {
      this.intervalIndex++;
      return 4; // SM-2 wants 6, but that is really long
    }

    return _.round(this.easinessFactor * this.previousIntervalDays, 0);
  }

  VisitChildren(visit: { (child: RepertoirePosition): void }): void {
    this.VisitChildrenRecursive(visit, []);
  }

  private VisitChildrenRecursive(
    visit: { (child: RepertoirePosition): void },
    alreadyVisited: RepertoirePosition[]
  ): void {
    if (!_.includes(alreadyVisited, this)) {
      visit(this);
      _.forEach(this.children, child =>
        child.position.VisitChildrenRecursive(visit, alreadyVisited)
      );
    }
  }

  RootPaths(): Move[][] {
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

        if (path.length === i + 1) {
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

  AsPgn() {
    return this.GetPgnHeaders() + EOL + this.AsPgnMoveText();
  }

  private GetPgnHeaders(): string {
    let headers = "";
    const now = new Date(_.now());

    headers += '[Event "N/A"]';
    headers += EOL;
    headers += '[Site "N/A"]';
    headers += EOL;
    headers += `[Date ${now.getUTCFullYear()}.${now.getUTCMonth()}.${now.getUTCDate()}"`;
    headers += EOL;
    headers += '[Round "N/A]"';
    headers += EOL;
    headers += '[White "N/A"]';
    headers += EOL;
    headers += '[Black "N/A"]';
    headers += EOL;
    headers += '[Result "*"]';
    headers += EOL;
    headers += '[SetUp "1"]';
    headers += EOL;
    headers += `[SetUp "${this.fen}"]`;
    headers += EOL;

    return headers;
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
      this.forSide,
      this.trainingHistory,
      this.nextRepetitionTimestamp,
      this.previousIntervalDays,
      this.intervalIndex,
      this.easinessFactor
    );
  }

  static FromSaved(saved: SavedRepertoirePosition): RepertoirePosition {
    return new RepertoirePosition(
      saved.fen,
      saved.comment,
      saved.forSide,
      saved.myTurn,
      saved.trainingHistory,
      saved.nextRepetitionTimestamp,
      saved.previousIntervalDays,
      saved.intervalIndex,
      saved.easinessFactor
    );
  }
}
