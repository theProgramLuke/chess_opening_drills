import _ from "lodash";

import { RepertoirePosition } from "@/store/repertoirePosition";
import { Side } from "@/store/side";
import { Move } from "@/store/move";
import { Repertoire } from "@/store/repertoire";
import { Turn } from "@/store/turn";
import { FEN } from "chessground/types";

let repertoire: Repertoire;
let start: RepertoirePosition;
let e3: Move;
let e3e6: Move;
let e3e6e4: Move;
let e3e6e4e5: Move;
let e3e6d3: Move;
let d3: Move;
let d3e6: Move;
let d3e6e3: Move;

beforeEach(() => {
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
      "This transposes to e3, e6, d3",
      Side.White
    )
  );
});

function LinkMoves(): void {
  /*
   * 1. e3 e6
   * 2. d3
   *
   * 1. d3 e6
   * 2. e3
   *
   * 1. e3 e6
   * 2. e4 e5
   */
  repertoire = new Repertoire([start], []);
  repertoire.AddMove(start, e3);
  repertoire.AddMove(e3.position, e3e6);
  repertoire.AddMove(e3e6.position, e3e6d3);
  repertoire.AddMove(e3e6.position, e3e6e4);
  repertoire.AddMove(e3e6e4.position, e3e6e4e5);
  repertoire.AddMove(start, d3);
  repertoire.AddMove(d3.position, d3e6);
  repertoire.AddMove(d3e6.position, d3e6e3);
}

describe("RepertoirePosition", () => {
  describe("SideToMove", () => {
    it.each([
      ["rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", Side.White],
      ["rnbqkbnr/pppppppp/8/8/8/4P3/PPPP1PPP/RNBQKBNR b KQkq - 0 1", Side.Black]
    ])("for FEN %s return %s", (fen: FEN, expected: Side) => {
      const side = new RepertoirePosition(
        fen,
        false,
        "",
        Side.White
      ).SideToMove();

      expect(side).toBe(expected);
    });
  });

  describe("AddChild", () => {
    it("adds child and parent links", () => {
      start.AddChild(e3);

      expect(start.children).toEqual([e3]);
      expect(e3.position.parents).toContain(start);
    });
  });

  describe("GetTurnLists", () => {
    beforeEach(LinkMoves);

    it("returns an empty array given a position with no parents", () => {
      const paths = start.GetTurnLists();

      expect(_.isEmpty(paths)).toBeTruthy();
    });

    it("returns a single turn list when there are no tranposition", () => {
      const paths = e3e6e4e5.position.GetTurnLists();

      expect(paths).toEqual([[new Turn(e3, e3e6), new Turn(e3e6e4, e3e6e4e5)]]);
    });

    it("returns multiple turn lists when there are tranpositions", () => {
      const paths = e3e6d3.position.GetTurnLists();

      expect(paths).toEqual([
        [new Turn(e3, e3e6), new Turn(e3e6d3)],
        [new Turn(d3, d3e6), new Turn(d3e6e3)]
      ]);
    });
  });

  describe("AsPgnMoveText", () => {
    beforeEach(LinkMoves);

    it("generates the pgn of position", () => {
      const pgnMoveText = start.AsPgnMoveText();
      const expectedPgnMoveText =
        "1. e3 ( 1. d3 e6 2. e3 ) e6 2. d3 ( 2. e4 e5 )";

      expect(pgnMoveText).toEqual(expectedPgnMoveText);
    });
  });
});
