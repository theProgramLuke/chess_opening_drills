import { Storage, PersistantStorage } from "@/store/PersistantStorage";
import { RepertoirePosition } from "./repertoirePosition";
import { Move } from "./move";
import { TrainingEvent } from "./TrainingEvent";
import { RepertoireTag } from "./repertoireTag";
import { Side } from "./side";
import { PgnGame } from "./pgnParser";
import { Repertoire } from "./repertoire";

export interface MutationState extends Storage {
  persisted: PersistantStorage;
}

function getRepertoireForSide(state: MutationState, forSide: Side) {
  return forSide === Side.White ? state.whiteRepertoire : state.blackRepertoire;
}

function setRepertoireForSide(
  state: MutationState,
  forSide: Side,
  repertoire: Repertoire
) {
  if (forSide === Side.White) {
    state.whiteRepertoire = repertoire;
    state.persisted.whiteRepertoire = repertoire;
  } else {
    state.blackRepertoire = repertoire;
    state.persisted.blackRepertoire = repertoire;
  }
}

export const mutations = {
  setDarkMode(state: MutationState, darkMode: boolean): void {
    state.darkMode = darkMode;
    state.persisted.darkMode = darkMode;
  },

  setBoardTheme(state: MutationState, boardTheme: string): void {
    state.boardTheme = boardTheme;
    state.persisted.boardTheme = boardTheme;
  },

  setPieceTheme(state: MutationState, pieceTheme: string): void {
    state.pieceTheme = pieceTheme;
    state.persisted.pieceTheme = pieceTheme;
  },

  setColor(
    state: MutationState,
    payload: {
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
  ): void {
    state[payload.colorToSet] = payload.color;
    state.persisted[payload.colorToSet] = payload.color;
  },

  addRepertoirePosition(
    state: MutationState,
    payload: { parent: RepertoirePosition; newMove: Move }
  ): void {
    if (payload.parent && payload.newMove) {
      const side = payload.parent.forSide;
      const repertoire = getRepertoireForSide(state, side);

      repertoire.AddMove(payload.parent, payload.newMove);

      setRepertoireForSide(state, side, repertoire);
    }
  },

  addRepertoireTag(
    state: MutationState,
    payload: { parent: RepertoireTag; tag: RepertoireTag }
  ): void {
    if (payload.parent && payload.tag) {
      const side = payload.parent.forSide;
      const repertoire = getRepertoireForSide(state, side);

      payload.parent.AddChild(payload.tag);

      setRepertoireForSide(state, side, repertoire);
    }
  },

  addTrainingEvent(
    state: MutationState,
    payload: { position: RepertoirePosition; event: TrainingEvent }
  ): void {
    if (payload.position && payload.event) {
      const side = payload.position.forSide;
      const repertoire = getRepertoireForSide(state, side);

      payload.position.AddTrainingEvent(payload.event);

      setRepertoireForSide(state, side, repertoire);
    }
  },

  removeRepertoireTag(state: MutationState, tag: RepertoireTag): void {
    const side = tag.forSide;
    const repertoire = getRepertoireForSide(state, side);

    repertoire.RemoveRepertoireTag(tag);

    setRepertoireForSide(state, side, repertoire);
  },

  removeRepertoireMove(state: MutationState, move: Move): void {
    const side = move.position.forSide;
    const repertoire = getRepertoireForSide(state, side);

    repertoire.RemoveMove(move);

    setRepertoireForSide(state, side, repertoire);
  },

  addPositionsFromGame(
    state: MutationState,
    payload: { forSide: Side; game: PgnGame }
  ): void {
    if (payload.game) {
      const side = payload.forSide;
      const repertoire = getRepertoireForSide(state, side);

      repertoire.AddFromGame(payload.game);

      setRepertoireForSide(state, side, repertoire);
    }
  },

  clearStorage(state: MutationState): void {
    state.persisted.clear();
  }
};