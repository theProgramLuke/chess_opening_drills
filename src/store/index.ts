import Vue from "vue";
import Vuex from "vuex";
import { Position } from "@/store/position";
import { Move } from "@/store/move";
import { RepertoireTag } from "./repertoireTag";
import { Side } from "./side";

Vue.use(Vuex);

const positions = [
  new Position(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    true,
    "",
    Side.White
  ),
  new Position(
    "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    false,
    "",
    Side.White
  ),
  new Position(
    "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    true,
    "",
    Side.White
  ),
  new Position(
    "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
    false,
    "",
    Side.White
  ),
  new Position(
    "rnbqkbnr/pp1ppp1p/6p1/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
    true,
    "",
    Side.White
  ),
  new Position(
    "rnbqkbnr/pp1ppp1p/6p1/2p5/4P3/2P2N2/PP1P1PPP/RNBQKB1R b KQkq - 0 3",
    false,
    "",
    Side.White
  ),
  new Position(
    "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
    true,
    "",
    Side.White
  ),
  new Position(
    "r1bqkbnr/pp1ppppp/2n5/1Bp5/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
    false,
    "",
    Side.White
  ),
  new Position(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    false,
    "",
    Side.Black
  ),
  new Position(
    "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    true,
    "",
    Side.Black
  ),
  new Position(
    "rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    false,
    "",
    Side.Black
  ),
  new Position(
    "rnbqkbnr/pppppp1p/6p1/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    true,
    "",
    Side.White
  ),
  new Position(
    "rnbqkbnr/pppppp1p/6p1/8/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
    false,
    "",
    Side.White
  )
];

positions[0].addChild(new Move("e4", positions[1]));
positions[0].addChild(new Move("g6", positions[11]));
positions[1].addChild(new Move("c5", positions[2]));
positions[2].addChild(new Move("Nf3", positions[3]));
positions[3].addChild(new Move("g6", positions[4]));
positions[4].addChild(new Move("c3", positions[5]));
positions[3].addChild(new Move("Nc6", positions[6]));
positions[6].addChild(new Move("Bb5", positions[7]));
positions[8].addChild(new Move("e4", positions[9]));
positions[9].addChild(new Move("e6", positions[10]));
positions[11].addChild(new Move("Nf3", positions[12]));
positions[12].addChild(new Move("c5", positions[4]));

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
    repertoirePositions: positions
  },
  mutations: {
    setDarkMode: (state, darkMode) => (state.darkMode = darkMode)
  },
  actions: {},
  modules: {},
  strict: process.env.NODE_ENV !== "production"
});
