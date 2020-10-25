import { Repertoire } from "@/store/repertoire/Repertoire";
import { TrainingEvent } from "@/store/repertoire/RepetitionTraining";

export interface AddPositionsFromPgnPayload {
  repertoire: Repertoire;
  pgn: string;
}

export interface AddTrainingEventPayload {
  repertoire: Repertoire;
  fen: string;
  san: string;
  event: TrainingEvent;
}
