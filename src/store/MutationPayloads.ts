import { Repertoire } from "@/store/repertoire/Repertoire";
import { TrainingEvent } from "@/store/repertoire/RepetitionTraining";
import { TagTree } from "@/store/repertoire/TagTree";

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

export interface SetColorPayload {
  colorToSet:
    | "primary"
    | "secondary"
    | "accent"
    | "error"
    | "warning"
    | "info"
    | "success";
  color: string;
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
