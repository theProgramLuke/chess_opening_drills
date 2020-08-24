import Vue from "vue";
import Vuex from "vuex";

import { RepertoirePosition } from "@/store/repertoirePosition";
import { Move } from "./move";
import { GetPersistantStorage } from "./storage";
import { Repertoire } from "./repertoire";
import { RepertoireTag } from "./repertoireTag";
import { Side } from "./side";
import { TrainingEvent } from "./TrainingEvent";
import { PgnGame } from "./pgnParser";

Vue.use(Vuex);

const storage = GetPersistantStorage();

export default new Vuex.Store({
  state: {
    darkMode: storage.get("darkMode"),
    primary: storage.get("primary"),
    secondary: storage.get("secondary"),
    accent: storage.get("accent"),
    error: storage.get("error"),
    warning: storage.get("warning"),
    info: storage.get("info"),
    success: storage.get("success"),
    boardTheme: storage.get("boardTheme"),
    pieceTheme: storage.get("pieceTheme"),
    whiteRepertoire: Repertoire.FromSaved(storage.get("whiteRepertoire")),
    blackRepertoire: Repertoire.FromSaved(storage.get("blackRepertoire"))
  },

  mutations: {
    setDarkMode: (state, darkMode): void => {
      state.darkMode = darkMode;
      storage.set("darkMode", darkMode);
    },

    setBoardTheme: (state, boardTheme): void => {
      state.boardTheme = boardTheme;
      storage.set("boardTheme", boardTheme);
    },

    setPieceTheme: (state, pieceTheme): void => {
      state.pieceTheme = pieceTheme;
      storage.set("pieceTheme", pieceTheme);
    },

    setColor: function(
      state,
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
      storage.set(payload.colorToSet, payload.color);
    },

    addRepertoirePosition: (
      state,
      payload: { parent: RepertoirePosition; newMove: Move }
    ): void => {
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

        storage.set(repertoireKey, repertoire.AsSaved());
      }
    },

    addRepertoireTag: (
      state,
      payload: { parent: RepertoireTag; tag: RepertoireTag }
    ): void => {
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

        storage.set(repertoireKey, repertoire.AsSaved());
      }
    },

    addTrainingEvent: (
      state,
      payload: { position: RepertoirePosition; event: TrainingEvent }
    ): void => {
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

        storage.set(repertoireKey, repertoire.AsSaved());
      }
    },

    removeRepertoireTag: (state, tag: RepertoireTag): void => {
      const repertoire =
        tag.forSide === Side.White
          ? state.whiteRepertoire
          : state.blackRepertoire;
      const repertoireKey =
        tag.forSide === Side.White ? "whiteRepertoire" : "blackRepertoire";

      repertoire.RemoveRepertoireTag(tag);

      storage.set(repertoireKey, repertoire.AsSaved());
    },

    removeRepertoireMove: (state, move: Move): void => {
      const repertoire =
        move.position.forSide === Side.White
          ? state.whiteRepertoire
          : state.blackRepertoire;
      const repertoireKey =
        move.position.forSide === Side.White
          ? "whiteRepertoire"
          : "blackRepertoire";

      repertoire.RemoveMove(move);

      storage.set(repertoireKey, repertoire.AsSaved());
    },

    addPositionsFromGame(
      state,
      payload: { forSide: Side; game: PgnGame }
    ): void {
      if (payload.game) {
        const repertoire =
          payload.forSide === Side.White
            ? state.whiteRepertoire
            : state.blackRepertoire;
        const repertoireKey =
          payload.forSide === Side.White
            ? "whiteRepertoire"
            : "blackRepertoire";

        repertoire.AddFromGame(payload.game);

        storage.set(repertoireKey, repertoire.AsSaved());
      }
    },

    clearStorage(): void {
      storage.clear();
    }
  },

  actions: {},

  modules: {},

  strict: process.env.NODE_ENV !== "production"
});
