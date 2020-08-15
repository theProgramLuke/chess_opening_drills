import _ from "lodash";

import { Repertoire } from "@/store/repertoire";
import { RepertoirePosition } from "@/store/repertoirePosition";
import { Side } from "@/store/side";
import { Move } from "@/store/move";

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
      "",
      Side.White
    )
  );
});

describe("Repertoire", () => {
  describe("AddMoves", () => {
    it("adds position given position not in repertoire positions", () => {
      const repertoire = new Repertoire([start], []);

      repertoire.AddMove(start, e3);

      expect(repertoire.positions).toEqual([start, e3.position]);
    });

    it("adds the move as a child of the parent", () => {
      const repertoire = new Repertoire([start], []);

      repertoire.AddMove(start, e3);

      expect(start.children).toEqual([e3]);
    });

    it("does not add duplicate position given a transposition", () => {
      const repertoire = new Repertoire([start], []);

      repertoire.AddMove(start, e3); // 1. e3
      repertoire.AddMove(e3.position, e3e6); // 1. e3 e6
      repertoire.AddMove(e3e6.position, e3e6d3); // 1. e3 e6 2. d3
      repertoire.AddMove(start, d3); // 1. d3
      repertoire.AddMove(d3.position, d3e6); // 1. d3 e6
      repertoire.AddMove(d3e6.position, d3e6e3); // 1. d3 e6 2. e3 (transposes)

      _.forEach(
        [
          start,
          e3.position,
          e3e6.position,
          e3e6d3.position,
          d3.position,
          d3e6.position
        ],
        (position: RepertoirePosition) =>
          expect(repertoire.positions).toContain(position)
      );
    });
  });
});
