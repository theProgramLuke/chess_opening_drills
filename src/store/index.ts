import Vue from "vue";
import Vuex from "vuex";

import { RepertoirePosition } from "@/store/repertoirePosition";
import { Move } from "./move";
import { GetPersistantStorage } from "./storage";
import { Repertoire } from "./repertoire";
import { RepertoireTag } from "./repertoireTag";

Vue.use(Vuex);

const storage = GetPersistantStorage();

export default new Vuex.Store({
  state: {
    darkMode: storage.get("darkMode"),
    repertoire: Repertoire.FromSaved(storage.get("repertoire"))
  },
  mutations: {
    setDarkMode: (state, darkMode): void => {
      state.darkMode = darkMode;
      storage.set("darkMode", darkMode);
    },
    addRepertoirePosition: (
      state,
      payload: { parent: RepertoirePosition; newMove: Move }
    ): void => {
      if (payload["parent"] && payload["newMove"]) {
        state.repertoire.AddMove(payload.parent, payload.newMove);
        storage.set("repertoire", state.repertoire.AsSaved());
      }
    },
    addRepertoireTag: (
      state,
      payload: { parent: RepertoireTag; tag: RepertoireTag }
    ): void => {
      if (payload["parent"] && payload["tag"]) {
        payload["parent"].AddChild(payload["tag"]);
        storage.set("repertoire", state.repertoire.AsSaved());
      }
    },
    removeRepertoireTag: (state, tag: RepertoireTag): void => {
      state.repertoire.RemoveRepertoireTag(tag);
      storage.set("repertoire", state.repertoire.AsSaved());
    },
    clearStorage: (state): void => {
      storage.clear();
    }
  },
  actions: {},
  modules: {},
  strict: process.env.NODE_ENV !== "production"
});
