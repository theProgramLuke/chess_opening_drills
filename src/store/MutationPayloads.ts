import { Repertoire } from "@/store/repertoire/Repertoire";

export interface AddPositionsFromPgnPayload {
  repertoire: Repertoire;
  pgn: string;
}
