import { Storage, PersistantStorage } from "@/store/PersistantStorage";
import { RepertoirePosition } from "./repertoirePosition";
import { Move } from "./move";
import { TrainingEvent } from "./TrainingEvent";
import { RepertoireTag } from "./repertoireTag";
import { Side } from "./side";
import { PgnGame } from "./pgnParser";

export interface MutationState extends Storage {
  persisted: PersistantStorage;
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
      const repertoire =
        payload.parent.forSide === Side.White
          ? state.whiteRepertoire
          : state.blackRepertoire;
      const repertoireKey =
        payload.parent.forSide === Side.White
          ? "whiteRepertoire"
          : "blackRepertoire";

      repertoire.AddMove(payload.parent, payload.newMove);

      state.persisted[repertoireKey] = repertoire;
    }
  },

  addRepertoireTag(
    state: MutationState,
    payload: { parent: RepertoireTag; tag: RepertoireTag }
  ): void {
    if (payload.parent && payload.tag) {
      const repertoire =
        payload.parent.forSide === Side.White
          ? state.whiteRepertoire
          : state.blackRepertoire;
      const repertoireKey =
        payload.parent.forSide === Side.White
          ? "whiteRepertoire"
          : "blackRepertoire";

      payload.parent.AddChild(payload.tag);

      state.persisted[repertoireKey] = repertoire;
    }
  },

  addTrainingEvent(
    state: MutationState,
    payload: { position: RepertoirePosition; event: TrainingEvent }
  ): void {
    if (payload.position && payload.event) {
      const repertoire =
        payload.position.forSide === Side.White
          ? state.whiteRepertoire
          : state.blackRepertoire;
      const repertoireKey =
        payload.position.forSide === Side.White
          ? "whiteRepertoire"
          : "blackRepertoire";

      payload.position.AddTrainingEvent(payload.event);

      state.persisted[repertoireKey] = repertoire;
    }
  },

  removeRepertoireTag(state: MutationState, tag: RepertoireTag): void {
    const repertoire =
      tag.forSide === Side.White
        ? state.whiteRepertoire
        : state.blackRepertoire;
    const repertoireKey =
      tag.forSide === Side.White ? "whiteRepertoire" : "blackRepertoire";

    repertoire.RemoveRepertoireTag(tag);

    state.persisted[repertoireKey] = repertoire;
  },

  removeRepertoireMove(state: MutationState, move: Move): void {
    const repertoire =
      move.position.forSide === Side.White
        ? state.whiteRepertoire
        : state.blackRepertoire;
    const repertoireKey =
      move.position.forSide === Side.White
        ? "whiteRepertoire"
        : "blackRepertoire";

    repertoire.RemoveMove(move);

    state.persisted[repertoireKey] = repertoire;
  },

  addPositionsFromGame(
    state: MutationState,
    payload: { forSide: Side; game: PgnGame }
  ): void {
    if (payload.game) {
      const repertoire =
        payload.forSide === Side.White
          ? state.whiteRepertoire
          : state.blackRepertoire;
      const repertoireKey =
        payload.forSide === Side.White ? "whiteRepertoire" : "blackRepertoire";

      repertoire.AddFromGame(payload.game);

      state.persisted[repertoireKey] = repertoire;
    }
  },

  clearStorage(state: MutationState): void {
    state.persisted.clear();
  }
};
