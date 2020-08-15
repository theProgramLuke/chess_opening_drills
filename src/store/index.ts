import Vue from "vue";
import Vuex from "vuex";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { RepertoireTag } from "./repertoireTag";
import { Side } from "./side";
import { Move } from "./move";
import { Repertoire } from "./repertoire";

Vue.use(Vuex);

const positions = [
  new RepertoirePosition(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    true,
    "",
    Side.White
  )
];

let id = 0;

const tags = [
  new RepertoireTag(
    id++,
    Side.White,
    "White",
    positions[0],
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    []
  ),
  new RepertoireTag(
    id++,
    Side.Black,
    "Black",
    positions[0],
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    []
  )
];

export default new Vuex.Store({
  state: {
    darkMode: true,
    repertoire: new Repertoire(positions, tags)
  },
  mutations: {
    setDarkMode: (state, darkMode): void => (state.darkMode = darkMode),
    addRepertoirePosition: (
      state,
      payload: { parent: RepertoirePosition; newMove: Move }
    ): void => {
      if (payload["parent"]) {
        state.repertoire.AddMove(payload.parent, payload.newMove);
      }
    }
  },
  actions: {},
  modules: {},
  strict: process.env.NODE_ENV !== "production"
});
