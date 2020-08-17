import Vue from "vue";
import Vuex from "vuex";

import { RepertoirePosition } from "@/store/repertoirePosition";
import { Move } from "./move";
import { GetPersistantStorage } from "./storage";
import { Repertoire } from "./repertoire";

Vue.use(Vuex);

const storage = GetPersistantStorage();
const rep = Repertoire.FromSaved(storage.get("repertoire"));
console.log("index", rep.positions[0].GetTurnLists);

export default new Vuex.Store({
  state: {
    darkMode: storage.get("darkMode"),
    repertoire: rep
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
    clearStorage: (state): void => {
      storage.clear();
    }
  },
  actions: {},
  modules: {},
  strict: process.env.NODE_ENV !== "production"
});
