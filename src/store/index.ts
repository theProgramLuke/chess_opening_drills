import Vue from "vue";
import Vuex from "vuex";
import { Position } from "@/store/position";
import { Move } from "@/store/move";
import { RepertoireTag } from "./repertoireTag";
import { Side } from "./side";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    darkMode: true,
    repertoireTags: [
      new RepertoireTag(
        0,
        Side.White,
        "White",
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        [
          new RepertoireTag(
            1,
            Side.White,
            "Sicillian Defense",
            "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
            [
              new RepertoireTag(
                2,
                Side.White,
                "Old Sicillian",
                "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
                []
              ),
              new RepertoireTag(
                3,
                Side.White,
                "Hyper-Accelerated Dragon",
                "rnbqkbnr/pp1ppp1p/6p1/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
                []
              )
            ]
          )
        ]
      ),
      new RepertoireTag(
        5,
        Side.Black,
        "Black",
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        [
          new RepertoireTag(
            6,
            Side.Black,
            "1.e4",
            "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
            [
              new RepertoireTag(
                7,
                Side.Black,
                "French",
                "rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
                []
              )
            ]
          )
        ]
      )
    ],
    whiteRepertoirePositions: [
      new Position(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        true,
        "",
        [],
        [
          new Move(
            "e4",
            "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1"
          )
        ]
      ),
      new Position(
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
        false,
        "",
        ["rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"],
        [
          new Move(
            "c5",
            "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2"
          )
        ]
      ),
      new Position(
        "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
        true,
        "",
        ["rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1"],
        [
          new Move(
            "Nf3",
            "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2"
          )
        ]
      ),
      new Position(
        "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
        false,
        "",
        ["rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2"],
        [
          new Move(
            "g6",
            "rnbqkbnr/pp1ppp1p/6p1/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3"
          ),
          new Move(
            "Nc6",
            "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3"
          )
        ]
      ),
      new Position(
        "rnbqkbnr/pp1ppp1p/6p1/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
        true,
        "",
        ["rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2"],
        [
          new Move(
            "c3",
            "rnbqkbnr/pp1ppp1p/6p1/2p5/4P3/2P2N2/PP1P1PPP/RNBQKB1R b KQkq - 0 3"
          )
        ]
      ),
      new Position(
        "rnbqkbnr/pp1ppp1p/6p1/2p5/4P3/2P2N2/PP1P1PPP/RNBQKB1R b KQkq - 0 3",
        false,
        "",
        ["rnbqkbnr/pp1ppp1p/6p1/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3"],
        []
      ),
      new Position(
        "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
        true,
        "",
        ["rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2"],
        [
          new Move(
            "Bb5",
            "r1bqkbnr/pp1ppppp/2n5/1Bp5/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3"
          )
        ]
      ),
      new Position(
        "r1bqkbnr/pp1ppppp/2n5/1Bp5/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
        false,
        "",
        ["r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3"],
        []
      )
    ],
    blackRepertoirePositions: []
  },
  mutations: {
    setDarkMode: (state, darkMode) => (state.darkMode = darkMode)
  },
  actions: {},
  modules: {},
  strict: process.env.NODE_ENV !== "production"
});
