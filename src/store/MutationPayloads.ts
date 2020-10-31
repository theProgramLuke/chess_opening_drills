import { Repertoire } from "@/store/repertoire/Repertoire";
import { TrainingEvent } from "@/store/repertoire/RepetitionTraining";
import { TagTree } from "@/store/repertoire/TagTree";
import { DrawShape } from "chessground/draw";
import { EngineMetadata } from "./EngineHelpers";

export interface AddTrainingEventPayload {
  repertoire: Repertoire;
  fen: string;
  san: string;
  event: TrainingEvent;
}

export interface AddRepertoireMovePayload {
  repertoire: Repertoire;
  fen: string;
  san: string;
}

export type ColorName =
  | "primary"
  | "secondary"
  | "accent"
  | "error"
  | "warning"
  | "info"
  | "success";

export interface SetColorPayload {
  colorToSet: ColorName;
  value: string;
}

export interface AddRepertoireTagPayload {
  repertoire: Repertoire;
  parent: TagTree;
  name: string;
  fen: string;
}

export interface RemoveRepertoireMovePayload {
  repertoire: Repertoire;
  fen: string;
  san: string;
}

export interface AddMovesFromPgnPayload {
  repertoire: Repertoire;
  pgn: string;
}

export interface RemoveRepertoireTagPayload {
  repertoire: Repertoire;
  id: string;
}

export interface SetPositionCommentsPayload {
  repertoire: Repertoire;
  fen: string;
  comments: string;
}

export interface SetPositionDrawingsPayload {
  repertoire: Repertoire;
  fen: string;
  drawings: DrawShape[];
}

export type SetDarkModePayload = boolean;

export type SetBoardThemePayload = string;

export type SetPieceThemePayload = string;

export type SetEngineMetadataPayload = EngineMetadata | undefined;

export type SetBackupDirectoryPayload = string | undefined;

export type SetBackupLimitPayload = number;

export type SetEnableBackupsPayload = boolean;

export type SetMoveAnimationSpeedPayload = number;
