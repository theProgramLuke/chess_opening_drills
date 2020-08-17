import {
  RepertoirePosition,
  SavedRepertoirePosition
} from "@/store/repertoirePosition";
import { Move, SavedMove } from "@/store/move";
import { Side } from "@/store/side";
import { Repertoire, SavedRepertoire } from "@/store/repertoire";
import { RepertoireTag, SavedRepertoireTag } from "@/store/repertoireTag";

export let repertoire: Repertoire;
export let start: RepertoirePosition;
export let e3: Move;
export let e3e6: Move;
export let e3e6e4: Move;
export let e3e6e4e5: Move;
export let e3e6d3: Move;
export let d3: Move;
export let d3e6: Move;
export let d3e6e3: Move;
export let White: RepertoireTag;
export let Black: RepertoireTag;
export let VariationA: RepertoireTag;

export function ResetTestRepertoire() {
  start = new RepertoirePosition(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    true,
    "",
    Side.White
  );

  e3 = new Move(
    "e3",
    new RepertoirePosition(
      "rnbqkbnr/pppppppp/8/8/8/4P3/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
      false,
      "",
      Side.White
    )
  );

  e3e6 = new Move(
    "e6",
    new RepertoirePosition(
      "rnbqkbnr/pppp1ppp/4p3/8/8/4P3/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      false,
      "",
      Side.White
    )
  );

  e3e6e4 = new Move(
    "e4",
    new RepertoirePosition(
      "rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2",
      false,
      "",
      Side.White
    )
  );

  e3e6e4e5 = new Move(
    "e5",
    new RepertoirePosition(
      "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 3",
      false,
      "",
      Side.White
    )
  );

  e3e6d3 = new Move(
    "d3",
    new RepertoirePosition(
      "rnbqkbnr/pppp1ppp/4p3/8/8/3PP3/PPP2PPP/RNBQKBNR b KQkq - 0 2",
      false,
      "",
      Side.White
    )
  );

  d3 = new Move(
    "d3",
    new RepertoirePosition(
      "rnbqkbnr/pppppppp/8/8/8/3P4/PPP1PPPP/RNBQKBNR b KQkq - 0 1",
      false,
      "",
      Side.White
    )
  );

  d3e6 = new Move(
    "e6",
    new RepertoirePosition(
      "rnbqkbnr/pppp1ppp/4p3/8/8/3P4/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
      false,
      "",
      Side.White
    )
  );

  d3e6e3 = new Move(
    "e3",
    new RepertoirePosition(
      "rnbqkbnr/pppp1ppp/4p3/8/8/3PP3/PPP2PPP/RNBQKBNR b KQkq - 0 2",
      false,
      "",
      Side.White
    )
  );

  VariationA = new RepertoireTag(
    2,
    Side.White,
    "Variation A",
    e3e6.position,
    e3e6.position.fen,
    []
  );

  White = new RepertoireTag(0, Side.White, "White", start, start.fen, [
    VariationA
  ]);

  Black = new RepertoireTag(1, Side.Black, "Black", start, start.fen, []);

  repertoire = new Repertoire([start], [White, Black]);
}

export function LinkTestPositions() {
  repertoire.AddMove(start, e3); // 1. e3
  repertoire.AddMove(e3.position, e3e6); // 1. e3 e6
  repertoire.AddMove(e3e6.position, e3e6d3); // 1. e3 e6 2. d3
  repertoire.AddMove(e3e6.position, e3e6e4); // 1. e3 e6 2. e4
  repertoire.AddMove(e3e6e4.position, e3e6e4e5); // 1. e3 e6 2. e4 e5
  repertoire.AddMove(start, d3); // 1. d3
  repertoire.AddMove(d3.position, d3e6); // 1. d3 e6
  repertoire.AddMove(d3e6.position, d3e6e3); // 1. d3 e6 2. e3 (transposes)
}

export const ExpectedSavedRepertoire = new SavedRepertoire(
  [
    new SavedRepertoirePosition(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      "",
      [],
      [new SavedMove("e3", 1), new SavedMove("d3", 6)],
      true,
      Side.White
    ),
    new SavedRepertoirePosition(
      "rnbqkbnr/pppppppp/8/8/8/4P3/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
      "",
      [0],
      [new SavedMove("e6", 2)],
      false,
      Side.White
    ),
    new SavedRepertoirePosition(
      "rnbqkbnr/pppp1ppp/4p3/8/8/4P3/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      "",
      [1],
      [new SavedMove("d3", 3), new SavedMove("e4", 4)],
      false,
      Side.White
    ),
    new SavedRepertoirePosition(
      "rnbqkbnr/pppp1ppp/4p3/8/8/3PP3/PPP2PPP/RNBQKBNR b KQkq - 0 2",
      "",
      [2, 7],
      [],
      false,
      Side.White
    ),
    new SavedRepertoirePosition(
      "rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2",
      "",
      [2],
      [new SavedMove("e5", 5)],
      false,
      Side.White
    ),
    new SavedRepertoirePosition(
      "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 3",
      "",
      [4],
      [],
      false,
      Side.White
    ),
    new SavedRepertoirePosition(
      "rnbqkbnr/pppppppp/8/8/8/3P4/PPP1PPPP/RNBQKBNR b KQkq - 0 1",
      "",
      [0],
      [new SavedMove("e6", 7)],
      false,
      Side.White
    ),
    new SavedRepertoirePosition(
      "rnbqkbnr/pppp1ppp/4p3/8/8/3P4/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
      "",
      [6],
      [new SavedMove("e3", 3)],
      false,
      Side.White
    )
  ],
  [
    new SavedRepertoireTag(
      0,
      Side.White,
      "White",
      0,
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      [
        new SavedRepertoireTag(
          2,
          Side.White,
          "Variation A",
          2,
          "rnbqkbnr/pppp1ppp/4p3/8/8/4P3/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
          []
        )
      ]
    ),
    new SavedRepertoireTag(
      1,
      Side.Black,
      "Black",
      0,
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      []
    )
  ]
);
