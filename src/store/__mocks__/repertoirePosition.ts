import _ from "lodash";

import { Move } from "../move";
import { Side } from "../side";
import { TrainingEvent } from "../TrainingEvent";
import { TrainingMode } from "../trainingMode";
import { Turn } from "../turn";
import { FEN } from "chessground/types";
import { SavedRepertoirePosition } from "../repertoirePosition";

export class RepertoirePosition {
  fen: string;
  comment: string;
  parents: RepertoirePosition[];
  children: Move[];
  myTurn: boolean;
  forSide: Side;
  trainingHistory: TrainingEvent[];
  nextRepetitionTimestamp?: number | undefined;
  previousIntervalDays: number;
  intervalIndex: number;
  easinessFactor: number;
  SideToMove: () => Side;
  AddChild: (move: Move) => void;
  Unlink: () => void;
  IncludeForTrainingMode: (
    mode: TrainingMode,
    difficultyModeLimit?: number
  ) => boolean;
  AddTrainingEvent: (event: TrainingEvent) => void;
  VisitChildren: (visit: (child: RepertoirePosition) => void) => void;
  IsChildPosition: (maybeChild: RepertoirePosition) => boolean;
  RootPaths: () => Move[][];
  GetTurnLists: () => Turn[][];
  AsPgn: () => string;
  AsPgnMoveText: (turnCount?: number) => string;
  AsSaved: (childParentSource: RepertoirePosition[]) => SavedRepertoirePosition;

  constructor(fen: FEN, comment: string, forSide: Side) {
    this.fen = fen;
    this.comment = comment;
    this.forSide = forSide;
    this.parents = [];
    this.children = [];
    this.myTurn = false;
    this.forSide = Side.White;
    this.trainingHistory = [];
    this.nextRepetitionTimestamp = 0;
    this.previousIntervalDays = 0;
    this.intervalIndex = 0;
    this.easinessFactor = 0;
    this.SideToMove = jest.fn();
    this.AddChild = jest.fn();
    this.Unlink = jest.fn();
    this.IncludeForTrainingMode = jest.fn();
    this.AddTrainingEvent = jest.fn();
    this.VisitChildren = jest.fn();
    this.IsChildPosition = jest.fn();
    this.RootPaths = jest.fn();
    this.GetTurnLists = jest.fn();
    this.AsPgn = jest.fn();
    this.AsPgnMoveText = jest.fn();
    this.AsSaved = jest.fn();
  }
}
